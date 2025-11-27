from typing import Annotated
from fastapi import APIRouter, Depends

from ..database import get_database
from ..models import DashboardSummary, UserResponse
from .auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db = Depends(get_database)
):
    user_id = str(current_user.id)
    
    # 1. Get Benchmark Data
    benchmark = await db.benchmark_reports.find_one({
        "user_id": user_id,
        "is_current": True
    })
    
    quartile = benchmark.get("compensation_quartile") if benchmark else None
    
    # 2. Get Career Plan Data
    plan = await db.career_plans.find_one({
        "user_id": user_id,
        "is_active": True
    })
    
    completed = 0
    total = 0
    percentage = 0
    next_milestone = None
    
    if plan:
        recommendations = plan.get("recommendations", [])
        total = len(recommendations)
        completed = sum(1 for rec in recommendations if rec.get("status") == "completed")
        
        if total > 0:
            percentage = int((completed / total) * 100)
            
        # Find first active recommendation as next milestone
        for rec in recommendations:
            if rec.get("status") == "active":
                next_milestone = rec.get("title")
                break
    
    return DashboardSummary(
        benchmark_quartile=quartile,
        plan_completion_percentage=percentage,
        completed_recommendations=completed,
        total_recommendations=total,
        next_milestone=next_milestone
    )