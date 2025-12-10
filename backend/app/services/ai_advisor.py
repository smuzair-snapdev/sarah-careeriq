import json
import google.generativeai as genai
from ..config import get_settings

settings = get_settings()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

async def generate_career_advice(profile: dict, benchmark_data: dict) -> dict:
    """
    Generates AI-powered career advice based on user profile and benchmark data.
    """
    if not settings.GEMINI_API_KEY:
        # Fallback for when API key is missing
        return _get_fallback_plan()

    # Extract user details
    role = profile.get('current_title', 'Developer')
    experience = profile.get('years_experience', 0)
    skills = ', '.join(profile.get('technical_skills', []))
    salary = profile.get('salary_package', 0)
    country = profile.get('country', 'Unknown')

    # Construct a detailed prompt
    prompt = f"""
    You are an expert technical career coach specializing in software development careers.
    
    User Profile:
    - Role: {role}
    - Experience: {experience} years
    - Location: {country}
    - Skills: {skills}
    - Salary Input: {salary} (Note: This value might be in local currency or USD. Use the country context to infer.)
    
    Market Benchmark Context (Cohort: {benchmark_data.get('cohort_name', 'Global')}):
    - Salary Quartile: {benchmark_data.get('compensation_quartile', 'N/A')} percentile (based on USD converted data)
    - Market Comparison: {benchmark_data.get('market_salary_comparison', 'N/A')}
    - Top Missing Skills: {', '.join(benchmark_data.get('missing_critical_skills', []))}
    - Skill Match Score: {benchmark_data.get('skill_match_score', 'N/A')}/100
    - Insights: {json.dumps(benchmark_data.get('insights', {}), default=str)}
    
    Task: Generate a personalized career development plan.
    
    CRITICAL: Analyze the salary. The benchmark is in USD. If the user's salary input ({salary}) seems to be in local currency (e.g., significantly higher than typical USD amounts for {country}), please calculate an approximate conversion to USD in your reasoning or simply note the discrepancy in the summary. Do not treat a local currency amount as a USD amount if it's obviously different (e.g. 3,000,000).
    
    The output MUST be a valid JSON object matching this structure exactly:
    {{
        "summary": "2-3 sentences analyzing their position relative to the market, addressing any salary currency nuances if detected.",
        "long_term_goal": "A strategic 1-2 year goal (e.g., 'Senior Engineer', 'Tech Lead').",
        "recommendations": [
            {{
                "category": "compensation" | "skills" | "strategic",
                "title": "Actionable title",
                "description": "Specific advice.",
                "expected_impact": "Quantifiable outcome (e.g., +15% salary growth).",
                "data_source": "General Industry Trends",
                "priority_level": "high" | "medium" | "low"
            }}
        ]
    }}
    
    Requirements:
    - Provide exactly 5-7 high-quality recommendations. 
    - If salary (adjusted for currency) is low (below 50th percentile), include specific compensation negotiation or job switching advice.
    - If skill match is low, prioritize learning the missing critical skills.
    - Ensure 'category' is one of the three allowed values.
    - Ensure 'priority_level' is one of the three allowed values.
    
    Return ONLY valid JSON. Do not use Markdown code blocks.
    """

    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt)
        
        # Clean response text (remove potential markdown code blocks)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        
        plan_data = json.loads(clean_text)
        return plan_data
        
    except Exception as e:
        print(f"LLM Error: {e}")
        return _get_fallback_plan()

def _get_fallback_plan() -> dict:
    return {
        "summary": "AI generation is currently unavailable. Here is a template plan to get you started.",
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