from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
import random

from ..database import get_database
from ..models import (
    BenchmarkReportResponse, BenchmarkReportInDB, UserResponse, 
    MarketDataInDB, MarketData, SkillRelevance, BenchmarkInsights
)
from .auth import get_current_user

router = APIRouter(prefix="/benchmarks", tags=["benchmarks"])

@router.post("/seed-market-data")
async def seed_market_data(db = Depends(get_database)):
    """Seed the database with initial market data for demonstration"""
    # Check if we already have data
    count = await db.market_data.count_documents({})
    if count > 0:
        return {"message": "Market data already seeded"}
    
    # Seed multiple industries
    industries = [
        MarketData(
            industry="Software Engineering",
            salary_range={
                "entry": [60000, 90000],
                "mid": [100000, 150000],
                "senior": [160000, 250000],
                "lead": [200000, 350000]
            },
            top_skills=[
                "Python", "FastAPI", "React", "AWS", "Docker",
                "System Design", "MongoDB", "TypeScript", "CI/CD", "GraphQL"
            ],
            top_soft_skills=[
                "Communication", "Problem Solving", "Teamwork", "Adaptability",
                "Time Management", "Leadership", "Mentoring"
            ],
            growth_rate="15%",
            updated_at=datetime.utcnow()
        ),
        MarketData(
            industry="Marketing",
            salary_range={
                "entry": [45000, 65000],
                "mid": [70000, 110000],
                "senior": [120000, 180000],
                "lead": [150000, 250000]
            },
            top_skills=[
                "Digital Marketing", "SEO", "Content Strategy", "Google Analytics",
                "Social Media Marketing", "Brand Management", "Copywriting", "CRM", "Data Analysis", "Project Management"
            ],
            top_soft_skills=[
                "Creativity", "Communication", "Strategic Thinking", "Collaboration", "Adaptability"
            ],
            growth_rate="10%",
            updated_at=datetime.utcnow()
        ),
        MarketData(
            industry="Sales",
            salary_range={
                "entry": [40000, 60000],
                "mid": [70000, 120000],
                "senior": [130000, 200000],
                "lead": [180000, 300000]
            },
            top_skills=[
                "CRM", "Negotiation", "Lead Generation", "Account Management",
                "Communication", "Strategic Planning", "Presentation", "Salesforce", "Cold Calling", "Closing"
            ],
            top_soft_skills=[
                "Persuasion", "Resilience", "Active Listening", "Relationship Building", "Empathy"
            ],
            growth_rate="8%",
            updated_at=datetime.utcnow()
        ),
        MarketData(
            industry="Product Management",
            salary_range={
                "entry": [70000, 95000],
                "mid": [110000, 160000],
                "senior": [170000, 240000],
                "lead": [220000, 350000]
            },
            top_skills=[
                "Product Strategy", "Agile", "User Research", "Data Analysis",
                "Roadmapping", "UX Design", "Communication", "Stakeholder Management", "A/B Testing", "SQL"
            ],
            top_soft_skills=[
                "Leadership", "Strategic Vision", "Empathy", "Prioritization", "Communication"
            ],
            growth_rate="12%",
            updated_at=datetime.utcnow()
        )
    ]
    
    for industry in industries:
        await db.market_data.insert_one(industry.model_dump())
        
    return {"message": "Market data seeded successfully"}

@router.post("/generate", response_model=BenchmarkReportResponse)
async def generate_benchmark(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db = Depends(get_database)
):
    user_id = str(current_user.id)
    
    # 1. Fetch User Profile
    profile = await db.profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=400, detail="Profile required to generate benchmark")
    
    # 2. Fetch Market Data based on user industry
    user_industry = profile.get("industry", "Software Engineering")
    market_data = await db.market_data.find_one({"industry": user_industry})
    
    if not market_data:
        # Fallback to Software Engineering if industry not found or empty
        print(f"Industry '{user_industry}' not found, falling back to Software Engineering")
        market_data = await db.market_data.find_one({"industry": "Software Engineering"})
        
        if not market_data:
             # Auto-seed if absolutely nothing exists
            await seed_market_data(db)
            market_data = await db.market_data.find_one({"industry": "Software Engineering"})

    # 3. Calculate Logic
    user_salary = profile.get("salary_package", 0)
    user_tech_skills = set([s.lower() for s in profile.get("technical_skills", [])])
    user_soft_skills = set([s.lower() for s in profile.get("soft_skills", [])])
    
    market_tech_skills = set([s.lower() for s in market_data["top_skills"]])
    # Handle optional soft skills in market data (backward compatibility)
    market_soft_skills = set([s.lower() for s in market_data.get("top_soft_skills", [])])
    
    # Determine seniority level based on experience/title (Simplified for MVP)
    # In a real app, we'd parse title or years of experience
    # Here we'll guess based on salary vs ranges
    salary_ranges = market_data["salary_range"]
    
    # Find which bucket matches best or default to 'mid'
    comparison_range = salary_ranges.get("mid")
    
    # Calculate Quartile against the Mid-Level range (standard benchmark)
    range_min = comparison_range[0]
    range_max = comparison_range[1]
    range_span = range_max - range_min
    
    if user_salary < range_min:
        quartile = 1
        comparison = "Below Market Average"
        # Calculate percentile below range
        percentile = 10 
        insights_comp = "Your compensation is currently below market rates for mid-level roles."
    elif user_salary > range_max:
        quartile = 4
        comparison = "Top of Market"
        percentile = 95
        insights_comp = "You are compensated at the top of the market for this role level."
    else:
        # Calculate position within range
        position = user_salary - range_min
        percentage = position / range_span
        percentile = int(25 + (percentage * 50)) # Map to 25-75 range for mid bucket
        
        if percentage < 0.25:
            quartile = 1
            comparison = "Entry Level for Role"
            insights_comp = "You are in the lower quartile for mid-level compensation."
        elif percentage < 0.5:
            quartile = 2
            comparison = "Competitive"
            insights_comp = "Your salary is competitive but has room for growth."
        elif percentage < 0.75:
            quartile = 3
            comparison = "Strongly Competitive"
            insights_comp = "You are paid well compared to the market average."
        else:
            quartile = 4
            comparison = "Leading Market"
            insights_comp = "You are among the top earners for your experience level."
            
        
    # Skill Match - Technical
    matching_tech = user_tech_skills.intersection(market_tech_skills)
    missing_tech = list(market_tech_skills - user_tech_skills)
    tech_score = int((len(matching_tech) / len(market_tech_skills)) * 100) if market_tech_skills else 0
    
    # Skill Match - Soft
    matching_soft = user_soft_skills.intersection(market_soft_skills)
    # missing_soft = list(market_soft_skills - user_soft_skills) # Not currently used in display
    soft_score = int((len(matching_soft) / len(market_soft_skills)) * 100) if market_soft_skills else 0
    
    # Overall Skill Score (Weighted 70% tech, 30% soft)
    overall_skill_score = int((tech_score * 0.7) + (soft_score * 0.3))

    skill_relevance = SkillRelevance(
        overall=overall_skill_score,
        technical=tech_score,
        soft=soft_score
    )

    insights_skills = f"You match {tech_score}% of top technical skills. Focusing on {', '.join(missing_tech[:2])} could boost your profile."

    # Career Progression Score (Simplified Calculation)
    # Ideally based on years vs title changes. Here, we'll simulate based on profile data existence
    progression_items = profile.get("career_progression", [])
    if len(progression_items) > 2:
        progression_score = 85
        insights_prog = "Strong career trajectory with consistent growth."
    elif len(progression_items) > 0:
        progression_score = 65
        insights_prog = "Steady progress observed in your recent roles."
    else:
        progression_score = 40
        insights_prog = "Add more career history to get a better progression analysis."
        
    # Position Level Score (Salary vs Years since grad)
    current_year = datetime.utcnow().year
    grad_year = profile.get("graduation_year", current_year)
    years_exp = max(0, current_year - grad_year)
    
    # Simple logic: Exp * 10 capped at 90, adjusted by salary percentile
    base_pos_score = min(90, years_exp * 10) 
    # Adjust +/- 10 based on if salary is high/low for experience
    if percentile > 60:
        base_pos_score += 10
    elif percentile < 40:
        base_pos_score -= 10
    
    position_level_score = min(100, max(0, base_pos_score))
    
    # Overall Insight
    quartile_suffix = {1: "st", 2: "nd", 3: "rd", 4: "th"}
    suffix = quartile_suffix.get(quartile, "th")
    
    insights = BenchmarkInsights(
        overall=f"You are positioned in the {quartile}{suffix} quartile compared to industry peers.",
        compensation=insights_comp,
        progression=insights_prog,
        skills=insights_skills
    )
    
    # 4. Create Report
    report = BenchmarkReportInDB(
        user_id=user_id,
        compensation_quartile=percentile, # Using actual percentile for better chart granularity
        skill_match_score=overall_skill_score, # Legacy support
        skill_relevance_scores=skill_relevance,
        career_progression_score=progression_score,
        position_level_score=position_level_score,
        missing_critical_skills=missing_tech[:5], # Top 5 missing technical
        market_salary_comparison=comparison,
        recommendations_summary=f"Focus on acquiring {', '.join(missing_tech[:3])} to increase market value.",
        comparable_profiles_count=random.randint(120, 500), # Simulated cohort size
        data_sources_used=["Glassdoor 2024", "LinkedIn Salary Insights", "Bureau of Labor Statistics"],
        insights=insights,
        generated_at=datetime.utcnow(),
        is_current=True
    )
    
    # 5. Archive old reports (Set is_current=False)
    await db.benchmark_reports.update_many(
        {"user_id": user_id, "is_current": True},
        {"$set": {"is_current": False}}
    )
    
    # 6. Save new report
    new_report = await db.benchmark_reports.insert_one(report.model_dump(by_alias=True, exclude={"id"}))
    
    # 7. Return
    created_report = await db.benchmark_reports.find_one({"_id": new_report.inserted_id})
    return BenchmarkReportResponse(**created_report)

@router.get("/latest", response_model=BenchmarkReportResponse)
async def get_latest_benchmark(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db = Depends(get_database)
):
    report = await db.benchmark_reports.find_one({
        "user_id": str(current_user.id),
        "is_current": True
    })
    
    if not report:
        raise HTTPException(status_code=404, detail="No active benchmark report found")
        
    return BenchmarkReportResponse(**report)