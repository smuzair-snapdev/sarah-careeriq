from typing import Optional, Annotated, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, BeforeValidator
from bson import ObjectId

# Helper for MongoDB ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = "User"
    provider: str = "clerk"

class UserCreate(UserBase):
    clerk_id: str

class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    clerk_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }

class UserResponse(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    credential: str # The JWT from Google

# Profile Models

class CareerProgressionItem(BaseModel):
    title: str
    company: str
    start_date: Optional[str] = None # ISO format or just year/month
    end_date: Optional[str] = None
    description: Optional[str] = None

class ProfileBase(BaseModel):
    graduation_year: int
    field_of_study: str
    current_company: str
    current_title: str
    industry: str = "Software Engineering"
    technical_skills: List[str]
    soft_skills: List[str]
    salary_package: int
    career_progression: List[CareerProgressionItem] = []

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileInDB(ProfileBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }

class ProfileResponse(ProfileBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    updated_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
# Benchmark & Market Data Models

class MarketData(BaseModel):
    industry: str
    salary_range: dict  # e.g. {"entry": [30k, 50k], "senior": [80k, 120k]}
    top_skills: List[str]
    top_soft_skills: List[str] = [] # Added for soft skill analysis
    growth_rate: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MarketDataInDB(MarketData):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }

class SkillRelevance(BaseModel):
    overall: int
    technical: int
    soft: int

class BenchmarkInsights(BaseModel):
    overall: str
    compensation: str
    progression: str
    skills: str

class BenchmarkReportBase(BaseModel):
    compensation_quartile: int # 0-100 percentile
    skill_match_score: int # 0-100 (Legacy/Simple)
    skill_relevance_scores: SkillRelevance
    career_progression_score: int # 0-100
    position_level_score: int # 0-100
    missing_critical_skills: List[str]
    market_salary_comparison: str # "Above", "Below", "In Range"
    recommendations_summary: str
    comparable_profiles_count: int
    data_sources_used: List[str]
    insights: BenchmarkInsights

class BenchmarkReportCreate(BenchmarkReportBase):
    pass

class BenchmarkReportInDB(BenchmarkReportBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    is_current: bool = True

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }

class BenchmarkReportResponse(BenchmarkReportBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    generated_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
# Career Plan Models

class Recommendation(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    category: str = "strategic" # "compensation", "skills", "strategic"
    title: str
    description: str
    expected_impact: str = "Medium impact on career growth"
    data_source: str = "Industry Trends 2024"
    priority_level: str = "medium" # "high", "medium", "low"
    status: str = "active" # "active", "completed", "dismissed"
    user_notes: Optional[str] = None
    created_date: datetime = Field(default_factory=datetime.utcnow)
    completed_date: Optional[datetime] = None
    dismissed_date: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat() if v else None
        }
    }

class CareerPlanBase(BaseModel):
    summary: str
    long_term_goal: str
    recommendations: List[Recommendation]

class CareerPlanCreate(CareerPlanBase):
    pass

class CareerPlanInDB(CareerPlanBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    benchmark_report_id: Optional[str] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }

class CareerPlanResponse(CareerPlanBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    generated_at: datetime
    overall_completion_percentage: int = 0
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }

class RecommendationUpdate(BaseModel):
    status: Optional[str] = None
    user_notes: Optional[str] = None

# Dashboard Models

class DashboardSummary(BaseModel):
    benchmark_quartile: Optional[int] = None
    plan_completion_percentage: int = 0
    completed_recommendations: int = 0
    total_recommendations: int = 0
    next_milestone: Optional[str] = None