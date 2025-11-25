import { Profile } from './profile';

export interface BenchmarkReport {
  report_id: string;
  profile_id: string;
  user_id: string;
  generation_date: string;
  compensation_quartile: number;
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
  is_current: boolean;
}

export const benchmarkService = {
  generateReport: (profile: Profile): BenchmarkReport => {
    // Simulate benchmark calculation using profile data
    const report: BenchmarkReport = {
      report_id: crypto.randomUUID(),
      profile_id: profile.profile_id,
      user_id: profile.user_id,
      generation_date: new Date().toISOString(),
      compensation_quartile: calculateCompensationQuartile(profile),
      career_progression_score: calculateProgressionScore(profile),
      skill_relevance_scores: calculateSkillRelevance(profile),
      position_level_score: calculatePositionLevel(profile),
      comparable_profiles_count: Math.floor(Math.random() * 200) + 100, // Mock: 100-300 comparable profiles
      data_sources_used: [
        'McKinsey Global Salary Report 2024',
        'Deloitte Career Advancement Study',
        'LinkedIn Workforce Trends',
        'Stanford Career Development Research',
        'Industry Skills Matrix 2024',
      ],
      insights: generateInsights(profile),
      is_current: true,
    };

    // Store report
    const reports = JSON.parse(localStorage.getItem('benchmark_reports') || '{}');
    if (!reports[profile.user_id]) {
      reports[profile.user_id] = [];
    }
    
    // Mark all previous reports as not current
    reports[profile.user_id].forEach((r: BenchmarkReport) => {
      r.is_current = false;
    });
    
    reports[profile.user_id].push(report);
    localStorage.setItem('benchmark_reports', JSON.stringify(reports));

    return report;
  },

  getCurrentReport: (userId: string): BenchmarkReport | null => {
    const reports = JSON.parse(localStorage.getItem('benchmark_reports') || '{}');
    const userReports = reports[userId] || [];
    return userReports.find((r: BenchmarkReport) => r.is_current) || null;
  },

  getAllReports: (userId: string): BenchmarkReport[] => {
    const reports = JSON.parse(localStorage.getItem('benchmark_reports') || '{}');
    return reports[userId] || [];
  },
};

function calculateCompensationQuartile(profile: Profile): number {
  if (!profile.salary_package) return 50;
  
  // Mock calculation based on salary, experience, and industry
  const yearsOfExperience = new Date().getFullYear() - (profile.graduation_year || 2010);
  const baseSalary = profile.salary_package;
  
  // Simple percentile calculation (mock)
  // In real app, this would compare against actual market data
  let percentile = 50;
  
  // Adjust based on salary ranges (simplified)
  if (baseSalary < 60000) percentile = 25;
  else if (baseSalary < 80000) percentile = 40;
  else if (baseSalary < 100000) percentile = 55;
  else if (baseSalary < 120000) percentile = 68;
  else if (baseSalary < 150000) percentile = 78;
  else if (baseSalary < 180000) percentile = 85;
  else percentile = 92;
  
  // Adjust for years of experience
  if (yearsOfExperience < 5) percentile -= 10;
  else if (yearsOfExperience > 20) percentile += 5;
  
  return Math.max(10, Math.min(99, percentile));
}

function calculateProgressionScore(profile: Profile): number {
  const progressions = profile.career_progression.length;
  const yearsOfExperience = new Date().getFullYear() - (profile.graduation_year || 2010);
  
  // Expected progressions: ~1 every 3-4 years
  const expectedProgressions = Math.floor(yearsOfExperience / 3.5);
  const ratio = progressions / Math.max(expectedProgressions, 1);
  
  // Convert to percentile score
  let score = 50;
  if (ratio > 1.5) score = 90;
  else if (ratio > 1.2) score = 75;
  else if (ratio > 1.0) score = 65;
  else if (ratio > 0.8) score = 55;
  else if (ratio > 0.5) score = 40;
  else score = 30;
  
  return Math.max(10, Math.min(99, score));
}

function calculateSkillRelevance(profile: Profile): {
  technical: number;
  soft: number;
  overall: number;
} {
  // Mock calculation based on number and relevance of skills
  const techSkillCount = profile.technical_skills.length;
  const softSkillCount = profile.soft_skills.length;
  
  // Modern/relevant technical skills
  const modernTechSkills = ['Python', 'JavaScript', 'React', 'AWS', 'Azure', 'Machine Learning', 'Data Analysis'];
  const modernSkillCount = profile.technical_skills.filter(skill => 
    modernTechSkills.some(modern => skill.toLowerCase().includes(modern.toLowerCase()))
  ).length;
  
  // Critical soft skills
  const criticalSoftSkills = ['Leadership', 'Communication', 'Strategic Planning'];
  const criticalSoftCount = profile.soft_skills.filter(skill =>
    criticalSoftSkills.some(critical => skill.toLowerCase().includes(critical.toLowerCase()))
  ).length;
  
  let technicalScore = Math.min(95, 40 + (techSkillCount * 5) + (modernSkillCount * 8));
  let softScore = Math.min(95, 40 + (softSkillCount * 6) + (criticalSoftCount * 10));
  
  return {
    technical: technicalScore,
    soft: softScore,
    overall: Math.round((technicalScore + softScore) / 2),
  };
}

function calculatePositionLevel(profile: Profile): number {
  const yearsOfExperience = new Date().getFullYear() - (profile.graduation_year || 2010);
  const title = profile.current_title.toLowerCase();
  
  // Mock position level scoring
  let baseScore = 50;
  
  // Adjust based on seniority in title
  if (title.includes('director') || title.includes('vp') || title.includes('head')) {
    baseScore = 85;
  } else if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
    baseScore = 70;
  } else if (title.includes('manager')) {
    baseScore = 65;
  } else if (title.includes('junior') || yearsOfExperience < 5) {
    baseScore = 35;
  }
  
  // Adjust for experience
  if (yearsOfExperience > 15 && baseScore < 70) baseScore += 10;
  if (yearsOfExperience < 5 && baseScore > 60) baseScore -= 10;
  
  return Math.max(10, Math.min(99, baseScore));
}

function generateInsights(profile: Profile): {
  compensation: string;
  progression: string;
  skills: string;
  overall: string;
} {
  const compQuartile = calculateCompensationQuartile(profile);
  const progressionScore = calculateProgressionScore(profile);
  const skillScores = calculateSkillRelevance(profile);
  
  let compensationInsight = '';
  if (compQuartile >= 75) {
    compensationInsight = `You're in the top 25% of earners in your field. Great job! Your compensation is competitive.`;
  } else if (compQuartile >= 50) {
    compensationInsight = `You're earning at the ${compQuartile}th percentile. There's opportunity to negotiate for a 10-15% increase based on market rates.`;
  } else {
    compensationInsight = `You're at the ${compQuartile}th percentile. Peers in similar roles earn 20-30% more on average. Consider salary negotiation or exploring new opportunities.`;
  }
  
  let progressionInsight = '';
  if (progressionScore >= 70) {
    progressionInsight = `Your career progression is strong. You're advancing faster than peers.`;
  } else if (progressionScore >= 50) {
    progressionInsight = `Your progression is on track with industry averages. Consider seeking leadership opportunities.`;
  } else {
    progressionInsight = `Your progression is below average. Focus on building visibility and seeking promotion opportunities.`;
  }
  
  let skillsInsight = '';
  if (skillScores.overall >= 75) {
    skillsInsight = `Your skill set is highly relevant and competitive in today's market.`;
  } else if (skillScores.overall >= 60) {
    skillsInsight = `Your skills are solid. Consider adding emerging technologies or leadership skills to stay ahead.`;
  } else {
    skillsInsight = `Your skill set needs updating. Focus on modern technical skills and leadership competencies.`;
  }
  
  const overallScore = Math.round((compQuartile + progressionScore + skillScores.overall) / 3);
  let overallInsight = '';
  if (overallScore >= 70) {
    overallInsight = `You're well-positioned in your career. Focus on strategic moves to reach the next level.`;
  } else if (overallScore >= 50) {
    overallInsight = `You have solid fundamentals. Targeted improvements in compensation and skills can accelerate your advancement.`;
  } else {
    overallInsight = `There's significant opportunity for growth. Focus on skills development and career strategy to improve your market position.`;
  }
  
  return {
    compensation: compensationInsight,
    progression: progressionInsight,
    skills: skillsInsight,
    overall: overallInsight,
  };
}
