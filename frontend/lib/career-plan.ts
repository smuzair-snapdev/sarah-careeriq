import { Profile } from './profile';
import { BenchmarkReport } from './benchmark';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Recommendation {
  recommendation_id: string; // Mapped from backend 'id'
  category: 'compensation' | 'skills' | 'strategic';
  title: string;
  description: string;
  expected_impact: string;
  data_source: string;
  priority_level: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'dismissed';
  user_notes: string;
  created_date: string;
  completed_date: string | null;
  dismissed_date: string | null;
}

export interface CareerPlan {
  plan_id: string; // Mapped from backend '_id'
  profile_id: string; // backend: user_id (simplification) or separate field
  user_id: string;
  benchmark_report_id: string;
  generation_date: string; // backend: generated_at
  last_modified_date: string; // backend: generated_at (simplification)
  recommendations: Recommendation[];
  overall_completion_percentage: number;
}

// Helper to map backend response to frontend interface
const mapBackendPlanToFrontend = (backendPlan: any): CareerPlan => {
  const mappedRecs = (backendPlan.recommendations || []).map((rec: any) => {
    // Ensure we extract the ID properly - backend uses 'id' field
    const recId = rec.id || rec._id || rec.recommendation_id;
    
    if (!recId) {
      console.error('Recommendation missing ID:', rec);
    }
    return {
      recommendation_id: recId,
      category: rec.category,
      title: rec.title,
      description: rec.description,
      expected_impact: rec.expected_impact,
      data_source: rec.data_source,
      priority_level: rec.priority_level,
      status: rec.status,
      user_notes: rec.user_notes || '',
      created_date: rec.created_date,
      completed_date: rec.completed_date,
      dismissed_date: rec.dismissed_date,
    };
  });
  
  return {
    plan_id: backendPlan._id || backendPlan.id,
    profile_id: backendPlan.user_id,
    user_id: backendPlan.user_id,
    benchmark_report_id: backendPlan.benchmark_report_id || '',
    generation_date: backendPlan.generated_at,
    last_modified_date: backendPlan.generated_at,
    overall_completion_percentage: backendPlan.overall_completion_percentage || 0,
    recommendations: mappedRecs,
  };
};

export const careerPlanService = {
  generatePlan: async (token: string): Promise<CareerPlan> => {
    const response = await fetch(`${API_URL}/api/v1/plan/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate career plan');
    }

    const data = await response.json();
    return mapBackendPlanToFrontend(data);
  },

  getPlan: async (token: string): Promise<CareerPlan | null> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/plan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch career plan');
      }

      const data = await response.json();
      return mapBackendPlanToFrontend(data);
    } catch (error) {
      console.error('Error fetching plan:', error);
      return null;
    }
  },

  updateRecommendation: async (
    token: string,
    recommendationId: string,
    updates: Partial<Recommendation>
  ): Promise<Recommendation> => {
    // Construct the payload expected by backend RecommendationUpdate model
    const payload: any = {
      status: updates.status,
    };
    if (updates.user_notes !== undefined) {
      payload.user_notes = updates.user_notes;
    }

    const url = `${API_URL}/api/v1/plan/recommendations/${recommendationId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update recommendation:', response.status, errorText);
      throw new Error('Failed to update recommendation');
    }

    const data = await response.json();
    
    // Return mapped recommendation - ensure ID is extracted properly
    const recId = data.id || data._id || data.recommendation_id;
    if (!recId) {
      console.error('Updated recommendation missing ID:', data);
    }
    
    return {
      recommendation_id: recId,
      category: data.category,
      title: data.title,
      description: data.description,
      expected_impact: data.expected_impact,
      data_source: data.data_source,
      priority_level: data.priority_level,
      status: data.status,
      user_notes: data.user_notes || '',
      created_date: data.created_date,
      completed_date: data.completed_date,
      dismissed_date: data.dismissed_date,
    };
  },

  // Kept for compatibility if needed, but redirects to generatePlan
  regeneratePlan: async (token: string): Promise<CareerPlan> => {
    return careerPlanService.generatePlan(token);
  },
};
