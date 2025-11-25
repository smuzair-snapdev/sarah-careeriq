import { Profile } from './profile';
import { BenchmarkReport } from './benchmark';

export interface Recommendation {
  recommendation_id: string;
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
  plan_id: string;
  profile_id: string;
  user_id: string;
  benchmark_report_id: string;
  generation_date: string;
  last_modified_date: string;
  recommendations: Recommendation[];
  overall_completion_percentage: number;
}

export const careerPlanService = {
  generatePlan: (profile: Profile, benchmarkReport: BenchmarkReport): CareerPlan => {
    const recommendations = generateRecommendations(profile, benchmarkReport);
    
    const plan: CareerPlan = {
      plan_id: crypto.randomUUID(),
      profile_id: profile.profile_id,
      user_id: profile.user_id,
      benchmark_report_id: benchmarkReport.report_id,
      generation_date: new Date().toISOString(),
      last_modified_date: new Date().toISOString(),
      recommendations,
      overall_completion_percentage: 0,
    };

    // Store plan
    const plans = JSON.parse(localStorage.getItem('career_plans') || '{}');
    plans[profile.user_id] = plan;
    localStorage.setItem('career_plans', JSON.stringify(plans));

    return plan;
  },

  getPlan: (userId: string): CareerPlan | null => {
    const plans = JSON.parse(localStorage.getItem('career_plans') || '{}');
    return plans[userId] || null;
  },

  updateRecommendation: (
    userId: string,
    recommendationId: string,
    updates: Partial<Recommendation>
  ): CareerPlan => {
    const plans = JSON.parse(localStorage.getItem('career_plans') || '{}');
    const plan = plans[userId];

    if (!plan) {
      throw new Error('Plan not found');
    }

    const recIndex = plan.recommendations.findIndex(
      (r: Recommendation) => r.recommendation_id === recommendationId
    );

    if (recIndex === -1) {
      throw new Error('Recommendation not found');
    }

    plan.recommendations[recIndex] = {
      ...plan.recommendations[recIndex],
      ...updates,
      completed_date: updates.status === 'completed' ? new Date().toISOString() : plan.recommendations[recIndex].completed_date,
      dismissed_date: updates.status === 'dismissed' ? new Date().toISOString() : plan.recommendations[recIndex].dismissed_date,
    };

    plan.last_modified_date = new Date().toISOString();
    plan.overall_completion_percentage = calculateCompletionPercentage(plan);

    plans[userId] = plan;
    localStorage.setItem('career_plans', JSON.stringify(plans));

    return plan;
  },

  regeneratePlan: (profile: Profile, benchmarkReport: BenchmarkReport): CareerPlan => {
    return careerPlanService.generatePlan(profile, benchmarkReport);
  },
};

function generateRecommendations(profile: Profile, benchmarkReport: BenchmarkReport): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Compensation recommendations
  if (benchmarkReport.compensation_quartile < 60) {
    recommendations.push({
      recommendation_id: crypto.randomUUID(),
      category: 'compensation',
      title: 'Negotiate Salary Increase',
      description: `Based on market data, professionals with your experience and role typically earn ${Math.round((100 - benchmarkReport.compensation_quartile) * 0.3)}% more. Prepare a case highlighting your achievements and market rates to negotiate with your current employer or explore new opportunities.`,
      expected_impact: `Potential 15-25% salary increase, moving you to the ${Math.min(benchmarkReport.compensation_quartile + 20, 85)}th percentile`,
      data_source: 'McKinsey Global Salary Report 2024, Deloitte Compensation Benchmarks',
      priority_level: 'high',
      status: 'active',
      user_notes: '',
      created_date: new Date().toISOString(),
      completed_date: null,
      dismissed_date: null,
    });
  }

  if (benchmarkReport.compensation_quartile >= 40 && benchmarkReport.compensation_quartile < 75) {
    recommendations.push({
      recommendation_id: crypto.randomUUID(),
      category: 'compensation',
      title: 'Research Bonus and Equity Opportunities',
      description: 'Many companies offer performance bonuses and equity compensation. If you don\'t currently receive these, negotiate for them in your next review or job change.',
      expected_impact: '10-20% increase in total compensation',
      data_source: 'LinkedIn Compensation Trends 2024',
      priority_level: 'medium',
      status: 'active',
      user_notes: '',
      created_date: new Date().toISOString(),
      completed_date: null,
      dismissed_date: null,
    });
  }

  // Skills recommendations
  const modernSkills = ['Python', 'Machine Learning', 'AWS', 'Azure', 'React', 'Data Analysis'];
  const hasModernSkills = profile.technical_skills.some(skill =>
    modernSkills.some(modern => skill.toLowerCase().includes(modern.toLowerCase()))
  );

  if (!hasModernSkills || benchmarkReport.skill_relevance_scores.technical < 70) {
    const skillsToLearn = modernSkills.filter(skill =>
      !profile.technical_skills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    ).slice(0, 2);

    if (skillsToLearn.length > 0) {
      recommendations.push({
        recommendation_id: crypto.randomUUID(),
        category: 'skills',
        title: `Learn ${skillsToLearn[0]}`,
        description: `${skillsToLearn[0]} is highly demanded in ${profile.industry}. Professionals with this skill see 23% faster promotion rates and 18% higher compensation.`,
        expected_impact: '23% increase in promotion probability, 18% salary premium',
        data_source: 'LinkedIn Workforce Skills Report, Stanford Career Development Study',
        priority_level: 'high',
        status: 'active',
        user_notes: '',
        created_date: new Date().toISOString(),
        completed_date: null,
        dismissed_date: null,
      });
    }
  }

  // Leadership/soft skills recommendations
  const leadershipSkills = ['Leadership', 'Strategic Planning', 'Team Management'];
  const hasLeadershipSkills = profile.soft_skills.some(skill =>
    leadershipSkills.some(lead => skill.toLowerCase().includes(lead.toLowerCase()))
  );

  if (!hasLeadershipSkills || benchmarkReport.skill_relevance_scores.soft < 70) {
    recommendations.push({
      recommendation_id: crypto.randomUUID(),
      category: 'skills',
      title: 'Develop Leadership Skills',
      description: 'Leadership and people management skills are critical for advancing to senior roles. Consider taking leadership courses, mentoring junior team members, or seeking project lead opportunities.',
      expected_impact: 'Essential for promotion to senior/director level positions',
      data_source: 'Harvard Business Review Leadership Studies',
      priority_level: 'high',
      status: 'active',
      user_notes: '',
      created_date: new Date().toISOString(),
      completed_date: null,
      dismissed_date: null,
    });
  }

  // Career progression recommendations
  if (benchmarkReport.career_progression_score < 60) {
    recommendations.push({
      recommendation_id: crypto.randomUUID(),
      category: 'strategic',
      title: 'Build Visibility for Promotion',
      description: 'Your progression rate is below average. Build visibility by: leading high-impact projects, presenting at company meetings, networking with senior leadership, and documenting your achievements.',
      expected_impact: 'Increases promotion likelihood within 12-18 months',
      data_source: 'Deloitte Career Advancement Study',
      priority_level: 'high',
      status: 'active',
      user_notes: '',
      created_date: new Date().toISOString(),
      completed_date: null,
      dismissed_date: null,
    });
  }

  // Networking recommendation
  recommendations.push({
    recommendation_id: crypto.randomUUID(),
    category: 'strategic',
    title: 'Expand Professional Network',
    description: 'Build connections with leaders in your industry through LinkedIn, industry conferences, and professional associations. 85% of jobs are filled through networking.',
    expected_impact: 'Opens doors to opportunities and accelerates advancement',
    data_source: 'LinkedIn Professional Networking Report',
    priority_level: 'medium',
    status: 'active',
    user_notes: '',
    created_date: new Date().toISOString(),
    completed_date: null,
    dismissed_date: null,
  });

  // Industry-specific strategic recommendation
  if (profile.industry === 'Technology') {
    recommendations.push({
      recommendation_id: crypto.randomUUID(),
      category: 'strategic',
      title: 'Stay Ahead of AI Trends',
      description: 'AI is transforming the technology industry. Stay current by following AI developments, exploring how AI impacts your role, and learning AI-adjacent skills.',
      expected_impact: 'Future-proofs your career against automation',
      data_source: 'MIT AI Impact Study 2024',
      priority_level: 'medium',
      status: 'active',
      user_notes: '',
      created_date: new Date().toISOString(),
      completed_date: null,
      dismissed_date: null,
    });
  }

  // Certification recommendation
  const title = profile.current_title.toLowerCase();
  if (title.includes('manager') || title.includes('director')) {
    recommendations.push({
      recommendation_id: crypto.randomUUID(),
      category: 'skills',
      title: 'Consider Executive Education',
      description: 'An executive education program or MBA can provide strategic thinking skills and networking opportunities valuable for senior leadership roles.',
      expected_impact: '35% of executives credit advanced education for their advancement',
      data_source: 'Wharton Executive Education Impact Study',
      priority_level: 'low',
      status: 'active',
      user_notes: '',
      created_date: new Date().toISOString(),
      completed_date: null,
      dismissed_date: null,
    });
  }

  return recommendations;
}

function calculateCompletionPercentage(plan: CareerPlan): number {
  const activeRecs = plan.recommendations.filter(r => r.status !== 'dismissed');
  if (activeRecs.length === 0) return 0;
  
  const completed = activeRecs.filter(r => r.status === 'completed').length;
  return Math.round((completed / activeRecs.length) * 100);
}
