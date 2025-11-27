from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Body
from datetime import datetime
import json
import google.generativeai as genai
from bson import ObjectId

from ..database import get_database
from ..models import (
    CareerPlanResponse, CareerPlanInDB, UserResponse, 
    Recommendation, RecommendationUpdate, PyObjectId
)
from ..config import get_settings
from .auth import get_current_user

router = APIRouter(prefix="/plan", tags=["plan"])
settings = get_settings()

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

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

    # 2. Fetch Latest Benchmark (optional but recommended)
    benchmark = await db.benchmark_reports.find_one({
        "user_id": user_id,
        "is_current": True
    })
    
    # 3. Construct Prompt
    # Convert profile and benchmark to JSON-serializable dicts (handling ObjectIds if any)
    profile_summary = {
        "title": profile.get("current_title"),
        "skills": profile.get("technical_skills", []) + profile.get("soft_skills", []),
        "experience": profile.get("career_progression", [])
    }
    
    benchmark_summary = {}
    if benchmark:
        # Safely access nested dictionary fields
        insights = benchmark.get("insights", {})
        relevance_scores = benchmark.get("skill_relevance_scores", {})
        
        benchmark_summary = {
            "compensation": {
                "percentile": benchmark.get("compensation_quartile"),
                "status": benchmark.get("market_salary_comparison"),
                "insight": insights.get("compensation", "")
            },
            "skills_analysis": {
                "overall_match": benchmark.get("skill_match_score"),
                "technical_score": relevance_scores.get("technical"),
                "soft_skill_score": relevance_scores.get("soft"),
                "missing_critical": benchmark.get("missing_critical_skills", []),
                "insight": insights.get("skills", "")
            },
            "progression": {
                "score": benchmark.get("career_progression_score"),
                "position_level_score": benchmark.get("position_level_score"),
                "insight": insights.get("progression", "")
            },
            "overall_market_context": insights.get("overall", "")
        }

    prompt = f"""
    You are an expert career coach for mid-career professionals. Generate a personalized career advancement plan in JSON format based on the user's profile and comprehensive market benchmark analysis.
    
    User Profile: {json.dumps(profile_summary, default=str)}
    Market Benchmark: {json.dumps(benchmark_summary, default=str)}
    
    The JSON output must strictly follow this structure:
    {{
        "summary": "A 2-sentence summary of the user's current standing and potential.",
        "long_term_goal": "A realistic but ambitious 2-year career goal.",
        "recommendations": [
            {{
                "category": "compensation" | "skills" | "strategic",
                "title": "Actionable Title (e.g., 'Learn Python', 'Negotiate Salary')",
                "description": "Specific details on what to do (2-3 sentences).",
                "expected_impact": "Quantifiable impact (e.g., 'Increases salary potential by 15%').",
                "data_source": "Cite a credible source (e.g., 'Glassdoor 2024 Report', 'LinkedIn Skills Graph').",
                "priority_level": "high" | "medium" | "low"
            }}
        ]
    }}
    
    Requirements:
    - Provide exactly 5-7 recommendations.
    - Ensure a mix of 'compensation', 'skills', and 'strategic' categories.
    - Be specific and data-driven.
    - Tailor advice based on the specific benchmark gaps identified (e.g., if technical score is low, focus on skills).
    - Do not include markdown formatting or backticks, just the raw JSON.
    """

    # 4. Call Gemini
    try:
        if not settings.GEMINI_API_KEY:
            raise Exception("No Gemini API Key provided")

        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt)
        
        # Clean response text (remove potential markdown code blocks)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        
        plan_data = json.loads(clean_text)
        
    except Exception as e:
        print(f"LLM Error: {e}")
        # Fallback for demo/testing if LLM fails or no key
        plan_data = {
            "summary": "AI generation failed or key missing. Here is a template plan to get you started.",
            "long_term_goal": "Advance in current field by acquiring high-value skills.",
            "recommendations": [
                {
                    "category": "strategic",
                    "title": "Update Resume & LinkedIn",
                    "description": "Ensure your CV and public profile reflect your latest skills and achievements to attract recruiters.",
                    "expected_impact": "Increase profile visibility by 40%",
                    "data_source": "LinkedIn Talent Solutions",
                    "priority_level": "high"
                },
                {
                     "category": "skills",
                     "title": "Assess Technical Skills",
                     "description": "Review current job postings for your target role to identify top 3 missing technical skills.",
                     "expected_impact": "Aligns capabilities with market demand",
                     "data_source": "Indeed Job Trends",
                     "priority_level": "medium"
                }
            ]
        }
        # In production, you might want to raise an error instead
        # if settings.GEMINI_API_KEY:
        #      raise HTTPException(status_code=500, detail=f"AI Generation failed: {str(e)}")


    # 5. Create Recommendation Objects with IDs
    recommendations = []
    for rec in plan_data.get("recommendations", []):
        # Validate/Default fields to ensure model compatibility
        category = rec.get("category", "strategic").lower()
        if category not in ["compensation", "skills", "strategic"]:
            category = "strategic"
            
        priority = rec.get("priority_level", "medium").lower()
        if priority not in ["high", "medium", "low"]:
            priority = "medium"

        recommendations.append(Recommendation(
            title=rec.get("title", "Untitled Recommendation"),
            description=rec.get("description", "No description provided."),
            category=category,
            expected_impact=rec.get("expected_impact", "Positive career growth"),
            data_source=rec.get("data_source", "General Industry Best Practices"),
            priority_level=priority
        ))
    
    # 6. Archive old plans
    await db.career_plans.update_many(
        {"user_id": user_id, "is_active": True},
        {"$set": {"is_active": False}}
    )
    
    # 7. Save New Plan
    plan_in_db = CareerPlanInDB(
        user_id=user_id,
        benchmark_report_id=str(benchmark["_id"]) if benchmark else None,
        summary=plan_data.get("summary", ""),
        long_term_goal=plan_data.get("long_term_goal", ""),
        recommendations=recommendations,
        generated_at=datetime.utcnow(),
        is_active=True
    )
    
    new_plan = await db.career_plans.insert_one(plan_in_db.model_dump(by_alias=True, exclude={"id"}))
    
    created_plan = await db.career_plans.find_one({"_id": new_plan.inserted_id})
    
    response_data = CareerPlanResponse(**created_plan)
    return response_data

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
        
    # Regenerate IDs for recommendations that have empty or missing IDs
    recs = plan.get("recommendations", [])
    if recs:
        ids_generated = False
        for rec in recs:
            if not rec.get('id'):
                from bson import ObjectId
                rec['id'] = str(ObjectId())
                ids_generated = True
        
        # Save the updated IDs back to the database if we generated any
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
    
    # Find the plan containing the recommendation
    plan = await db.career_plans.find_one({
        "user_id": user_id,
        "is_active": True,
        "recommendations.id": rec_id
    })
    
    if not plan:
        raise HTTPException(status_code=404, detail="Recommendation not found in active plan")
    
    # Update the specific recommendation in the array
    # We use the positional operator $ to identify the matching element
    update_fields = {}
    if update_data.status is not None:
        update_fields["recommendations.$.status"] = update_data.status
        
        # Update timestamps based on status
        if update_data.status == "completed":
             update_fields["recommendations.$.completed_date"] = datetime.utcnow()
        elif update_data.status == "dismissed":
             update_fields["recommendations.$.dismissed_date"] = datetime.utcnow()
        elif update_data.status == "active":
             # Reset dates if moving back to active
             update_fields["recommendations.$.completed_date"] = None
             update_fields["recommendations.$.dismissed_date"] = None

    if update_data.user_notes is not None:
        update_fields["recommendations.$.user_notes"] = update_data.user_notes
        
    if not update_fields:
        # No updates to apply, return current state
        for rec in plan["recommendations"]:
            if rec["id"] == rec_id:
                return Recommendation(**rec)

    update_query = {
        "$set": update_fields
    }
    
    try:
        result = await db.career_plans.update_one(
            {"_id": plan["_id"], "recommendations.id": rec_id},
            update_query
        )

        # Return the updated recommendation and recalculate overall percentage
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
            
        # Update the percentage in DB
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