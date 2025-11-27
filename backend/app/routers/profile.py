from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime

from ..database import get_database
from ..models import ProfileUpdate, ProfileResponse, ProfileInDB, UserResponse
from .auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db = Depends(get_database)
):
    profile = await db.profiles.find_one({"user_id": str(current_user.id)})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileResponse(**profile)

@router.put("", response_model=ProfileResponse)
async def update_profile(
    profile_update: ProfileUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db = Depends(get_database)
):
    user_id = str(current_user.id)
    
    # Prepare profile data
    profile_data = profile_update.model_dump()
    profile_in_db = ProfileInDB(
        **profile_data,
        user_id=user_id,
        updated_at=datetime.utcnow()
    )
    
    # Upsert profile (update if exists, insert if not)
    result = await db.profiles.update_one(
        {"user_id": user_id},
        {"$set": profile_in_db.model_dump(by_alias=True, exclude={"id"})},
        upsert=True
    )
    
    # Fetch the updated/created profile to return
    updated_profile = await db.profiles.find_one({"user_id": user_id})
    
    # IMPORTANT: Invalidate old benchmark reports and career plans
    # Mark all existing benchmark reports as not current
    await db.benchmark_reports.update_many(
        {"user_id": user_id, "is_current": True},
        {"$set": {"is_current": False}}
    )
    
    # Mark all existing career plans as not active
    await db.career_plans.update_many(
        {"user_id": user_id, "is_active": True},
        {"$set": {"is_active": False}}
    )
    
    # Note: The frontend should call /benchmarks/generate and /plan/generate
    # to create new reports based on the updated profile
    
    return ProfileResponse(**updated_profile)