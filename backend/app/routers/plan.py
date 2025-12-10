from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId

from ..database import get_database
from ..models import (
    CareerPlanResponse, CareerPlanInDB, UserResponse, 
    Recommendation, RecommendationUpdate
)
from ..services import ai_advisor
from .auth import get_current_user
from .benchmarks import generate_benchmark

router = APIRouter(prefix="/plan", tags=["plan"])

@router.post("/generate", response_model=CareerPlanResponse, response_model_by_alias=False)
async def generate_career_plan(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db = Depends(get_database)
):
    user_id = str(current_user.id)
    
    # 1. Fetch Profile
    profile = await db.profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=400, detail="Profile required to generate plan")

    # 2. Get or Generate Benchmark
    benchmark_data = None
    try:
        # Try to get existing active benchmark first
        benchmark_doc = await db.benchmark_reports.find_one({
            "user_id": user_id,
            "is_current": True
        })
        
        if benchmark_doc:
            benchmark_data = benchmark_doc
        else:
            # Generate new one if missing
            # calling the router function directly, passing dependencies manually
            res = await generate_benchmark(current_user, db)
            # Convert response model to dict
            benchmark_data = res.model_dump(by_alias=True)
            
    except Exception as e:
        print(f"Error retrieving benchmark for plan: {e}")
        # Proceed with empty benchmark context rather than failing completely
        benchmark_data = {}

    # 3. Call AI Advisor
    # Profile is already a dict-like from Mongo
    ai_plan = await ai_advisor.generate_career_advice(profile, benchmark_data)
    
    # 4. Process Recommendations
    recommendations = []
    for rec in ai_plan.get("recommendations", []):
         # Validate category and priority
        category = rec.get("category", "strategic").lower()
        if category not in ["compensation", "skills", "strategic"]:
            category = "strategic"
            
        priority = rec.get("priority_level", "medium").lower()
        if priority not in ["high", "medium", "low"]:
            priority = "medium"

        recommendations.append(Recommendation(
            title=rec.get("title", "Untitled Recommendation"),
            description=rec.get("description", ""),
            category=category,
            expected_impact=rec.get("expected_impact", ""),
            data_source=rec.get("data_source", "AI Advisor"),
            priority_level=priority
        ))
        
    # 5. Archive old plans
    await db.career_plans.update_many(
        {"user_id": user_id, "is_active": True},
        {"$set": {"is_active": False}}
    )
    
    # 6. Save New Plan
    benchmark_id = None
    if benchmark_data and "_id" in benchmark_data:
        benchmark_id = str(benchmark_data["_id"])
    elif benchmark_data and "id" in benchmark_data:
        benchmark_id = str(benchmark_data["id"])

    plan_in_db = CareerPlanInDB(
        user_id=user_id,
        benchmark_report_id=benchmark_id,
        summary=ai_plan.get("summary", ""),
        long_term_goal=ai_plan.get("long_term_goal", ""),
        recommendations=recommendations,
        generated_at=datetime.utcnow(),
        is_active=True
    )
    
    new_plan = await db.career_plans.insert_one(plan_in_db.model_dump(by_alias=True, exclude={"id"}))
    created_plan = await db.career_plans.find_one({"_id": new_plan.inserted_id})
    
    return CareerPlanResponse(**created_plan)

@router.get("", response_model=CareerPlanResponse, response_model_by_alias=False)
async def get_current_plan(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db = Depends(get_database)
):
    plan = await db.career_plans.find_one({
        "user_id": str(current_user.id),
        "is_active": True
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="No active career plan found")
        
    # Regenerate IDs for recommendations that have empty or missing IDs (legacy fix)
    recs = plan.get("recommendations", [])
    if recs:
        ids_generated = False
        for rec in recs:
            if not rec.get('id'):
                rec['id'] = str(ObjectId())
                ids_generated = True
        
        if ids_generated:
            await db.career_plans.update_one(
                {"_id": plan["_id"]},
                {"$set": {"recommendations": recs}}
            )
    
    active_recs = [r for r in recs if r.get("status") != "dismissed"]
    total_active = len(active_recs)
    completed_count = len([r for r in active_recs if r.get("status") == "completed"])
    
    percentage = 0
    if total_active > 0:
        percentage = round((completed_count / total_active) * 100)
        
    plan["overall_completion_percentage"] = percentage
    
    return CareerPlanResponse(**plan)

@router.patch("/recommendations/{rec_id}", response_model=Recommendation, response_model_by_alias=False)
async def update_recommendation_status(
    rec_id: str,
    update_data: RecommendationUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db = Depends(get_database)
):
    user_id = str(current_user.id)
    
    plan = await db.career_plans.find_one({
        "user_id": user_id,
        "is_active": True,
        "recommendations.id": rec_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Recommendation not found in active plan")
    
    update_fields = {}
    if update_data.status is not None:
        update_fields["recommendations.$.status"] = update_data.status
        
        if update_data.status == "completed":
             update_fields["recommendations.$.completed_date"] = datetime.utcnow()
        elif update_data.status == "dismissed":
             update_fields["recommendations.$.dismissed_date"] = datetime.utcnow()
        elif update_data.status == "active":
             update_fields["recommendations.$.completed_date"] = None
             update_fields["recommendations.$.dismissed_date"] = None

    if update_data.user_notes is not None:
        update_fields["recommendations.$.user_notes"] = update_data.user_notes
        
    if not update_fields:
        for rec in plan["recommendations"]:
            if rec["id"] == rec_id:
                return Recommendation(**rec)

    try:
        await db.career_plans.update_one(
            {"_id": plan["_id"], "recommendations.id": rec_id},
            {"$set": update_fields}
        )

        updated_plan = await db.career_plans.find_one({"_id": plan["_id"]})
        if not updated_plan:
             raise HTTPException(status_code=500, detail="Error retrieving updated plan")
        
        # Recalculate percentage
        recs = updated_plan.get("recommendations", [])
        active_recs = [r for r in recs if r.get("status") != "dismissed"]
        total_active = len(active_recs)
        completed_count = len([r for r in active_recs if r.get("status") == "completed"])
        
        percentage = 0
        if total_active > 0:
            percentage = round((completed_count / total_active) * 100)
            
        await db.career_plans.update_one(
            {"_id": plan["_id"]},
            {"$set": {"overall_completion_percentage": percentage}}
        )

        for rec in updated_plan["recommendations"]:
            if rec["id"] == rec_id:
                return Recommendation(**rec)
        
        raise HTTPException(status_code=404, detail="Recommendation lost after update")

    except Exception as e:
        print(f"Database error updating recommendation: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")