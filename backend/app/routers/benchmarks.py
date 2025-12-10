from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
import random
import math

from ..database import get_database
from ..models import (
    BenchmarkReportResponse, BenchmarkReportInDB, UserResponse, 
    MarketDataInDB, MarketData, SkillRelevance, BenchmarkInsights
)
from .auth import get_current_user

router = APIRouter(prefix="/benchmarks", tags=["benchmarks"])

@router.post("/seed-market-data")
async def seed_market_data(db = Depends(get_database)):
    """
    Deprecated: Real data is now ingested via scripts/ingest_survey.py
    This endpoint remains for backward compatibility or testing.
    """
    return {"message": "Use backend/scripts/ingest_survey.py to load real data."}

async def get_cohort_stats(db, country: str, dev_role: str, years_exp: float):
    """
    Fetch cohort data with fallback logic if sample size is too small.
    """
    collection = db.market_benchmarks
    
    # Define constraints
    exp_min = max(0, years_exp - 2)
    exp_max = years_exp + 2
    
    # 1. Try strict match
    match_query = {
        "country": country,
        "dev_role": dev_role,
        "years_experience": {"$gte": exp_min, "$lte": exp_max},
        "salary": {"$gt": 0} # Ensure valid salary
    }
    
    count = await collection.count_documents(match_query)
    cohort_name = f"{dev_role} in {country} ({exp_min}-{exp_max} yoe)"
    
    # 2. Relax constraints if count is low
    if count < 10:
        # Try wider experience range
        exp_min = max(0, years_exp - 5)
        exp_max = years_exp + 5
        match_query["years_experience"] = {"$gte": exp_min, "$lte": exp_max}
        count = await collection.count_documents(match_query)
        cohort_name = f"{dev_role} in {country} (Extended Exp)"
        
    if count < 10:
        # Remove country constraint (Global comparison for role)
        del match_query["country"]
        count = await collection.count_documents(match_query)
        cohort_name = f"{dev_role} (Global, {exp_min}-{exp_max} yoe)"
        
    if count < 10:
         # Fallback to just country (General tech in country)
        match_query = {
            "country": country,
            "years_experience": {"$gte": exp_min, "$lte": exp_max},
            "salary": {"$gt": 0}
        }
        count = await collection.count_documents(match_query)
        cohort_name = f"Developers in {country}"

    if count == 0:
        return None, None

    # Fetch Data
    # We need:
    # - Salary list (for percentile)
    # - Top skills (languages, databases, platforms, frameworks)
    
    pipeline = [
        {"$match": match_query},
        {"$facet": {
            "salaries": [
                {"$project": {"salary": 1}},
                {"$sort": {"salary": 1}}
            ],
            "top_languages": [
                {"$unwind": "$languages"},
                {"$group": {"_id": "$languages", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ],
            "top_databases": [
                {"$unwind": "$databases"},
                {"$group": {"_id": "$databases", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 5}
            ],
            "top_frameworks": [
                {"$unwind": "$frameworks"},
                {"$group": {"_id": "$frameworks", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 5}
            ]
        }}
    ]
    
    results = await collection.aggregate(pipeline).to_list(length=1)
    stats = results[0]
    
    return stats, cohort_name

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
    
    user_role = profile.get("dev_role", profile.get("current_title", "Developer"))
    user_country = profile.get("country", "United States")
    user_exp = profile.get("years_experience", 2)
    user_salary = profile.get("salary_package", 0)
    user_tech_skills = set([s.lower() for s in profile.get("technical_skills", [])])
    
    # 2. Get Cohort Statistics
    stats, cohort_name = await get_cohort_stats(db, user_country, user_role, user_exp)
    
    if not stats:
        # Absolute Fallback if no data exists at all
        raise HTTPException(status_code=404, detail="Not enough market data to generate a benchmark.")

    # 3. Calculate Logic
    
    # Salary Analysis
    salaries = [doc['salary'] for doc in stats['salaries']]
    cohort_size = len(salaries)
    
    # Calculate Percentile
    # Find how many people earn less than user
    below_count = sum(1 for s in salaries if s < user_salary)
    percentile = int((below_count / cohort_size) * 100) if cohort_size > 0 else 0
    
    # Determine Quartile
    quartile = 1
    if percentile >= 75: quartile = 4
    elif percentile >= 50: quartile = 3
    elif percentile >= 25: quartile = 2
    
    # Market Comparison Text
    comparison = "Competitive"
    if percentile < 25: comparison = "Below Market"
    elif percentile > 75: comparison = "Top of Market"
    
    # Insights
    insights_comp = f"You earn more than {percentile}% of {cohort_name}."
    if percentile < 20:
        insights_comp += " Your compensation is significantly below the market average."
    
    # Skills Analysis
    # Combine top skills from all categories
    market_skills_counts = {}
    
    for cat in ['top_languages', 'top_databases', 'top_frameworks']:
        for item in stats.get(cat, []):
            skill = item['_id']
            # Only count if significant (e.g. appearing in > 10% of profiles or top list)
            market_skills_counts[skill] = item['count']

    # Get top 15 overall most frequent skills in cohort
    sorted_market_skills = sorted(market_skills_counts.items(), key=lambda x: x[1], reverse=True)[:15]
    market_tech_skills = set([s[0].lower() for s in sorted_market_skills])
    
    # Match
    matching_tech = user_tech_skills.intersection(market_tech_skills)
    missing_tech = list(market_tech_skills - user_tech_skills)
    
    # Simple score: how many of the top 15 skills do you have?
    # Weighted by their frequency could be better, but simple ratio is fine for MVP
    tech_score = int((len(matching_tech) / len(market_tech_skills)) * 100) if market_tech_skills else 0
    
    # Soft skills (Placeholder as survey data doesn't have soft skills usually)
    soft_score = 70 # Default to reasonable score
    
    overall_skill_score = int((tech_score * 0.7) + (soft_score * 0.3))
    
    insights_skills = f"You match {len(matching_tech)} of the top {len(market_tech_skills)} skills in your cohort."
    
    # Progression & Position (Simplified)
    progression_score = min(100, int(user_exp * 10) + 20) 
    position_level_score = min(100, int(user_exp * 8) + 30)
    
    quartile_suffix = {1: "st", 2: "nd", 3: "rd", 4: "th"}
    suffix = quartile_suffix.get(quartile, "th")

    insights = BenchmarkInsights(
        overall=f"Benchmarked against {cohort_size} professionals in {cohort_name}.",
        compensation=insights_comp,
        progression="Progression analysis based on years of experience.",
        skills=insights_skills
    )

    skill_relevance = SkillRelevance(
        overall=overall_skill_score,
        technical=tech_score,
        soft=soft_score
    )

    # 4. Create Report
    report = BenchmarkReportInDB(
        user_id=user_id,
        compensation_quartile=percentile,
        skill_match_score=overall_skill_score,
        skill_relevance_scores=skill_relevance,
        career_progression_score=progression_score,
        position_level_score=position_level_score,
        missing_critical_skills=[s.title() for s in missing_tech[:5]],
        market_salary_comparison=comparison,
        recommendations_summary=f"Consider learning {', '.join([s.title() for s in missing_tech[:3]])} to boost your profile.",
        comparable_profiles_count=cohort_size,
        data_sources_used=["Stack Overflow Survey 2024", "Market Benchmarks"],
        insights=insights,
        generated_at=datetime.utcnow(),
        is_current=True
    )
    
    # 5. Archive old reports
    await db.benchmark_reports.update_many(
        {"user_id": user_id, "is_current": True},
        {"$set": {"is_current": False}}
    )
    
    # 6. Save new report
    new_report = await db.benchmark_reports.insert_one(report.model_dump(by_alias=True, exclude={"id"}))
    
    # 7. Return
    created_report = await db.benchmark_reports.find_one({"_id": new_report.inserted_id})
    
    # Attach the cohort name as a temporary field (not in DB model, but useful for debug/display if needed)
    # response = BenchmarkReportResponse(**created_report)
    # return response
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