"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { profileService } from '@/lib/profile';
import { benchmarkService, BenchmarkReport } from '@/lib/benchmark';
import { careerPlanService } from '@/lib/career-plan';
import DashboardNav from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function BenchmarkPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<BenchmarkReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      const profile = profileService.getProfile(user.id);
      
      if (!profile) {
        router.push('/profile-setup');
        return;
      }

      if (profile.completion_percentage < 80) {
        router.push('/dashboard');
        return;
      }

      let existingReport = benchmarkService.getCurrentReport(user.id);
      
      if (!existingReport) {
        // Generate initial report
        setGenerating(true);
        existingReport = benchmarkService.generateReport(profile);
        
        // Also generate career plan
        careerPlanService.generatePlan(profile, existingReport);
        setGenerating(false);
      }
      
      setReport(existingReport);
      setLoading(false);
    }
  }, [user, router]);

  const handleRegenerateReport = () => {
    if (!user) return;
    
    const profile = profileService.getProfile(user.id);
    if (!profile) return;

    setGenerating(true);
    const newReport = benchmarkService.generateReport(profile);
    careerPlanService.generatePlan(profile, newReport);
    setReport(newReport);
    setGenerating(false);
  };

  if (loading || generating) {
    return (
      <>
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {generating ? 'Generating Your Benchmark Report...' : 'Loading...'}
            </h2>
            <p className="text-gray-600">Analyzing your career data against industry standards</p>
          </div>
        </div>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Benchmark Report Available</h2>
            <p className="text-gray-600 mb-6">Complete your profile to generate your benchmark report</p>
            <Button onClick={() => router.push('/profile-setup')}>Complete Profile</Button>
          </div>
        </div>
      </>
    );
  }

  const getQuartileColor = (quartile: number) => {
    if (quartile >= 75) return 'text-green-600 bg-green-50';
    if (quartile >= 50) return 'text-blue-600 bg-blue-50';
    if (quartile >= 25) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-blue-500';
    if (score >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <>
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Industry Benchmark Report</h1>
            <p className="text-gray-600">
              Generated on {new Date(report.generation_date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Based on {report.comparable_profiles_count} comparable professionals
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRegenerateReport}>
              Regenerate Report
            </Button>
            <Button asChild>
              <Link href="/dashboard/plan">View Career Plan →</Link>
            </Button>
          </div>
        </div>

        {/* Overview Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
            <CardDescription>{report.insights.overall}</CardDescription>
          </CardHeader>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Compensation Quartile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold mb-2 ${getQuartileColor(report.compensation_quartile).split(' ')[0]}`}>
                {report.compensation_quartile}th
              </div>
              <Progress 
                value={report.compensation_quartile} 
                className="mb-2"
              />
              <p className="text-xs text-gray-600">Percentile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Career Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold mb-2 ${getQuartileColor(report.career_progression_score).split(' ')[0]}`}>
                {report.career_progression_score}
              </div>
              <Progress 
                value={report.career_progression_score} 
                className="mb-2"
              />
              <p className="text-xs text-gray-600">Score (out of 100)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Skill Relevance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold mb-2 ${getQuartileColor(report.skill_relevance_scores.overall).split(' ')[0]}`}>
                {report.skill_relevance_scores.overall}
              </div>
              <Progress 
                value={report.skill_relevance_scores.overall} 
                className="mb-2"
              />
              <p className="text-xs text-gray-600">Overall Score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Position Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold mb-2 ${getQuartileColor(report.position_level_score).split(' ')[0]}`}>
                {report.position_level_score}
              </div>
              <Progress 
                value={report.position_level_score} 
                className="mb-2"
              />
              <p className="text-xs text-gray-600">vs. Experience</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>💰 Compensation Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Your Position</span>
                  <Badge className={getQuartileColor(report.compensation_quartile)}>
                    {report.compensation_quartile}th Percentile
                  </Badge>
                </div>
                <Progress value={report.compensation_quartile} className="h-3" />
              </div>
              <p className="text-sm text-gray-700">{report.insights.compensation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📈 Career Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression Rate</span>
                  <Badge className={getQuartileColor(report.career_progression_score)}>
                    Score: {report.career_progression_score}
                  </Badge>
                </div>
                <Progress value={report.career_progression_score} className="h-3" />
              </div>
              <p className="text-sm text-gray-700">{report.insights.progression}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Skills Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Technical Skills</span>
                    <span className="font-medium">{report.skill_relevance_scores.technical}%</span>
                  </div>
                  <Progress value={report.skill_relevance_scores.technical} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Soft Skills</span>
                    <span className="font-medium">{report.skill_relevance_scores.soft}%</span>
                  </div>
                  <Progress value={report.skill_relevance_scores.soft} className="h-2" />
                </div>
              </div>
              <p className="text-sm text-gray-700">{report.insights.skills}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📚 Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">This report is based on authoritative market research:</p>
              <ul className="space-y-2">
                {report.data_sources_used.map((source, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-900">Ready to Take Action?</CardTitle>
            <CardDescription className="text-indigo-700">
              View your personalized career advancement plan with specific recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/dashboard/plan">View Career Plan →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
