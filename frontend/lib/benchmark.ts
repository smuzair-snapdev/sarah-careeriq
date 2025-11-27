import { Profile } from './profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface BenchmarkReport {
  report_id: string;
  profile_id: string;
  user_id: string;
  generation_date: string;
  compensation_quartile: number;
  skill_match_score: number; // Changed from skill_relevance_scores object
  missing_critical_skills: string[];
  market_salary_comparison: string;
  recommendations_summary: string;
  is_current: boolean;
  
  // Derived fields for frontend compatibility (mapped from backend data)
  career_progression_score: number;
  skill_relevance_scores: {
    technical: number;
    soft: number;
    overall: number;
  };
  position_level_score: number;
  comparable_profiles_count: number;
  data_sources_used: string[];
  insights: {
    compensation: string;
    progression: string;
    skills: string;
    overall: string;
  };
}

// Helper to map backend response to frontend interface
const mapBackendReportToFrontend = (backendReport: any): BenchmarkReport => {
  // Fallback defaults in case older records are fetched
  const progressionScore = backendReport.career_progression_score || 65;
  const positionScore = backendReport.position_level_score || 60;
  const skillScore = backendReport.skill_match_score || 50;
  
  // Handle new nested structures or fallbacks
  const skillRelevance = backendReport.skill_relevance_scores || {
    technical: skillScore,
    soft: skillScore,
    overall: skillScore
  };

  const insights = backendReport.insights || {
    compensation: `You are in the ${backendReport.market_salary_comparison} range compared to market standards.`,
    progression: "Your career progression is steady.",
    skills: `You have a ${skillScore}% match with top market skills.`,
    overall: backendReport.recommendations_summary
  };

  return {
    report_id: backendReport.id || backendReport._id,
    profile_id: backendReport.user_id, // 1:1 mapping
    user_id: backendReport.user_id,
    generation_date: backendReport.generated_at,
    // Backend now returns actual percentile (0-100). If old data (1-4), multiply by 25.
    compensation_quartile: backendReport.compensation_quartile <= 4
      ? backendReport.compensation_quartile * 25
      : backendReport.compensation_quartile,
    skill_match_score: skillScore,
    missing_critical_skills: backendReport.missing_critical_skills || [],
    market_salary_comparison: backendReport.market_salary_comparison,
    recommendations_summary: backendReport.recommendations_summary,
    is_current: backendReport.is_current,
    
    // Mapped fields
    career_progression_score: progressionScore,
    skill_relevance_scores: skillRelevance,
    position_level_score: positionScore,
    comparable_profiles_count: backendReport.comparable_profiles_count || 150,
    data_sources_used: backendReport.data_sources_used || [
      'Tech Salary Survey 2024',
      'Global Workforce Trends'
    ],
    insights: insights
  };
};

export const benchmarkService = {
  generateReport: async (token: string): Promise<BenchmarkReport> => {
    const response = await fetch(`${API_URL}/api/v1/benchmarks/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate benchmark report');
    }

    const data = await response.json();
    return mapBackendReportToFrontend(data);
  },

  getCurrentReport: async (token: string): Promise<BenchmarkReport | null> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/benchmarks/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch benchmark report');
      }

      const data = await response.json();
      return mapBackendReportToFrontend(data);
    } catch (error) {
      console.error('Error fetching benchmark:', error);
      return null;
    }
  },

  // kept for compatibility signature
  getAllReports: async (token: string): Promise<BenchmarkReport[]> => {
    // For MVP, just return current report in array
    const current = await benchmarkService.getCurrentReport(token);
    return current ? [current] : [];
  },
};
