from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from ..database import get_database
from ..models import UserResponse, UserInDB
from ..security import verify_clerk_token

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

class UserSyncRequest(BaseModel):
    email: EmailStr
    name: str = "User"

async def get_token_payload(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    token = credentials.credentials
    payload = verify_clerk_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

async def get_current_user(
    payload: Annotated[dict, Depends(get_token_payload)],
    db = Depends(get_database)
):
    clerk_id = payload.get("sub")
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Invalid token subject")
        
    user = await db.users.find_one({"clerk_id": clerk_id})
    if not user:
        # Auto-create (JIT provisioning) if token is valid but user not in DB
        # This prevents 401 loops if the sync step was missed
        print(f"User {clerk_id} not found in DB. JIT provisioning...")
        # Fallback email if missing in token (e.g. from some OAuth providers via Clerk)
        # For MVP we can generate a placeholder or handle it more gracefully.
        # Better to use a placeholder than crash.
        email = payload.get("email")
        if not email:
             # Try to find email in other claims or use placeholder
             email = f"{clerk_id}@placeholder.careeriq.com"
             
        new_user = UserInDB(
            clerk_id=clerk_id,
            email=email,
            name=payload.get("name", "User"),
            provider="clerk"
        )
        result = await db.users.insert_one(new_user.model_dump(by_alias=True, exclude=["id"]))
        user = await db.users.find_one({"_id": result.inserted_id})
        
    return UserResponse(**user)

@router.post("/sync", response_model=UserResponse)
async def sync_user(
    user_data: UserSyncRequest,
    payload: Annotated[dict, Depends(get_token_payload)],
    db = Depends(get_database)
):
    clerk_id = payload.get("sub")
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Invalid token subject")
    
    existing_user = await db.users.find_one({"clerk_id": clerk_id})
    
    if existing_user:
        return UserResponse(**existing_user)
    
    # Create new user
    new_user = UserInDB(
        clerk_id=clerk_id,
        email=user_data.email,
        name=user_data.name,
        provider="clerk"
    )
    
    result = await db.users.insert_one(new_user.model_dump(by_alias=True, exclude=["id"]))
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    return UserResponse(**created_user)

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Annotated[UserResponse, Depends(get_current_user)]):
    return current_user