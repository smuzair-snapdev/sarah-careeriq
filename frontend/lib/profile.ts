export interface CareerProgression {
  date: string;
  title: string;
  company: string;
}

export interface Profile {
  profile_id: string;
  user_id: string;
  graduation_year: number | null;
  field_of_study: string;
  age: number | null;
  current_company: string;
  current_title: string;
  industry: string;
  technical_skills: string[];
  soft_skills: string[];
  career_progression: CareerProgression[];
  salary_package: number | null;
  created_date: string;
  last_modified_date: string;
  completion_percentage: number;
}

export const INDUSTRIES = [
  'Software Engineering',
  'Marketing',
  'Sales',
  'Product Management',
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Legal',
  'Real Estate',
  'Other',
];

export const SUGGESTED_TECHNICAL_SKILLS = [
  'Python',
  'JavaScript',
  'Java',
  'SQL',
  'React',
  'Node.js',
  'AWS',
  'Azure',
  'Data Analysis',
  'Machine Learning',
  'Project Management',
  'Agile/Scrum',
  'Excel',
  'Tableau',
  'Salesforce',
];

export const SUGGESTED_SOFT_SKILLS = [
  'Leadership',
  'Communication',
  'Problem Solving',
  'Team Collaboration',
  'Critical Thinking',
  'Adaptability',
  'Time Management',
  'Negotiation',
  'Strategic Planning',
  'Conflict Resolution',
  'Emotional Intelligence',
  'Decision Making',
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const profileService = {
  createProfile: async (userId: string, data: Partial<Profile>): Promise<Profile> => {
    // Note: We assume authentication token is handled via headers in real implementation
    // Here we just mock the call structure or use a token if passed.
    // For frontend components, we should probably pass token as argument like other services
    // But to maintain interface compatibility with existing code (if any sync calls remain), we'll throw error
    // or assume token is available in a global context (not ideal) or update the signature.
    // Given the refactor, we should update components to use async calls.
    
    // For now, let's throw an error to force update if this is called synchronously
    throw new Error("Use createProfileAsync with token");
  },

  createProfileAsync: async (token: string, data: Partial<Profile>): Promise<Profile> => {
    const response = await fetch(`${API_URL}/api/v1/profile`, {
      method: 'PUT', // Using PUT for upsert as per backend implementation
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create profile');
    }

    const profile = await response.json();
    return mapBackendProfileToFrontend(profile);
  },
  
  getProfile: (userId: string): Profile | null => {
     // Legacy sync method - should be deprecated
     return null;
  },

  getProfileAsync: async (token: string): Promise<Profile | null> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile = await response.json();
      return mapBackendProfileToFrontend(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },
  
  updateProfile: (userId: string, data: Partial<Profile>): Profile => {
     throw new Error("Use updateProfileAsync with token");
  },

  updateProfileAsync: async (token: string, data: Partial<Profile>): Promise<Profile> => {
    const response = await fetch(`${API_URL}/api/v1/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const profile = await response.json();
    return mapBackendProfileToFrontend(profile);
  },
  
  deleteProfile: (userId: string): void => {
    // Not implemented in backend yet
  },
};

function mapBackendProfileToFrontend(backendProfile: any): Profile {
  const profile = {
    profile_id: backendProfile.id || backendProfile._id,
    user_id: backendProfile.user_id,
    graduation_year: backendProfile.graduation_year,
    field_of_study: backendProfile.field_of_study,
    age: backendProfile.age,
    current_company: backendProfile.current_company,
    current_title: backendProfile.current_title,
    industry: backendProfile.industry,
    technical_skills: backendProfile.technical_skills || [],
    soft_skills: backendProfile.soft_skills || [],
    career_progression: backendProfile.career_progression || [],
    salary_package: backendProfile.salary_package,
    created_date: backendProfile.updated_at, // Using updated_at as proxy
    last_modified_date: backendProfile.updated_at,
    completion_percentage: 0
  };
  
  profile.completion_percentage = calculateCompletionPercentage(profile);
  return profile;
}

function calculateCompletionPercentage(profile: Profile): number {
  let completed = 0;
  const total = 11; // Total number of key fields
  
  if (profile.graduation_year) completed++;
  if (profile.field_of_study) completed++;
  if (profile.age) completed++;
  if (profile.current_company) completed++;
  if (profile.current_title) completed++;
  if (profile.industry) completed++;
  if (profile.technical_skills.length > 0) completed++;
  if (profile.soft_skills.length > 0) completed++;
  if (profile.career_progression.length > 0) completed++;
  if (profile.salary_package) completed++;
  if (profile.technical_skills.length >= 3 && profile.soft_skills.length >= 3) completed++; // Bonus for comprehensive skills
  
  return Math.round((completed / total) * 100);
}
