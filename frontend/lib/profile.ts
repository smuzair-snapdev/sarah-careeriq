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
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Marketing',
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

export const profileService = {
  createProfile: (userId: string, data: Partial<Profile>): Profile => {
    const profile: Profile = {
      profile_id: crypto.randomUUID(),
      user_id: userId,
      graduation_year: data.graduation_year || null,
      field_of_study: data.field_of_study || '',
      age: data.age || null,
      current_company: data.current_company || '',
      current_title: data.current_title || '',
      industry: data.industry || '',
      technical_skills: data.technical_skills || [],
      soft_skills: data.soft_skills || [],
      career_progression: data.career_progression || [],
      salary_package: data.salary_package || null,
      created_date: new Date().toISOString(),
      last_modified_date: new Date().toISOString(),
      completion_percentage: 0,
    };
    
    profile.completion_percentage = calculateCompletionPercentage(profile);
    
    const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
    profiles[userId] = profile;
    localStorage.setItem('profiles', JSON.stringify(profiles));
    
    return profile;
  },
  
  getProfile: (userId: string): Profile | null => {
    const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
    return profiles[userId] || null;
  },
  
  updateProfile: (userId: string, data: Partial<Profile>): Profile => {
    const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
    const existingProfile = profiles[userId];
    
    if (!existingProfile) {
      throw new Error('Profile not found');
    }
    
    const updatedProfile = {
      ...existingProfile,
      ...data,
      last_modified_date: new Date().toISOString(),
    };
    
    updatedProfile.completion_percentage = calculateCompletionPercentage(updatedProfile);
    
    profiles[userId] = updatedProfile;
    localStorage.setItem('profiles', JSON.stringify(profiles));
    
    return updatedProfile;
  },
  
  deleteProfile: (userId: string): void => {
    const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
    delete profiles[userId];
    localStorage.setItem('profiles', JSON.stringify(profiles));
  },
};

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
