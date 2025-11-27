"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { careerPlanService, CareerPlan } from '@/lib/career-plan';
import { benchmarkService, BenchmarkReport } from '@/lib/benchmark';
import DashboardNav from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProgressPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [reports, setReports] = useState<BenchmarkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (user) {
      try {
        const token = await getToken();
        if (!token) return;

        const [existingPlan, allReports] = await Promise.all([
          careerPlanService.getPlan(token),
          benchmarkService.getAllReports(token)
        ]);
        
        setPlan(existingPlan);
        setReports(allReports.sort((a, b) =>
          new Date(b.generation_date).getTime() - new Date(a.generation_date).getTime()
        ));
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <>
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your progress...</p>
          </div>
        </div>
      </>
    );
  }

  const completedRecs = plan?.recommendations.filter(r => r.status === 'completed') || [];
  const activeRecs = plan?.recommendations.filter(r => r.status === 'active') || [];

  return (
    <>
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
            <p className="text-gray-600">Monitor your career advancement journey</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">
                {plan?.overall_completion_percentage || 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Overall completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {completedRecs.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Recommendations done</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {activeRecs.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active recommendations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Benchmark Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">
                {reports.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Reports generated</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="reports">Benchmark History</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🎉 Completed Recommendations</CardTitle>
                <CardDescription>
                  {completedRecs.length === 0 
                    ? 'No completed recommendations yet. Start taking action on your career plan!'
                    : `You've completed ${completedRecs.length} recommendation${completedRecs.length !== 1 ? 's' : ''}. Great progress!`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedRecs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Ready to make progress?</p>
                    <Button onClick={() => router.push('/dashboard/plan')}>
                      View Career Plan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedRecs.map((rec) => (
                      <div 
                        key={rec.recommendation_id}
                        className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3">
                          ✓
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                            <Badge variant="outline">{rec.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          {rec.completed_date && (
                            <p className="text-xs text-gray-500">
                              Completed on {new Date(rec.completed_date).toLocaleDateString()}
                            </p>
                          )}
                          {rec.user_notes && (
                            <div className="mt-2 p-2 bg-white rounded border border-green-300">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Your notes:</p>
                              <p className="text-sm text-gray-600">{rec.user_notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📅 Career Journey Timeline</CardTitle>
                <CardDescription>Your career milestones and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-6">
                    {/* Completed recommendations timeline */}
                    {completedRecs
                      .sort((a, b) => {
                         const dateA = a.completed_date ? new Date(a.completed_date).getTime() : 0;
                         const dateB = b.completed_date ? new Date(b.completed_date).getTime() : 0;
                         return dateB - dateA;
                      })
                      .map((rec) => (
                        <div key={rec.recommendation_id} className="relative pl-10">
                          <div className="absolute left-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                            ✓
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                              <Badge variant="outline">{rec.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{rec.expected_impact}</p>
                            <p className="text-xs text-gray-500">
                              {rec.completed_date && new Date(rec.completed_date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}

                    {/* Benchmark report generations */}
                    {reports.map((report) => (
                      <div key={report.report_id} className="relative pl-10">
                        <div className="absolute left-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm">
                          📊
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">Benchmark Report Generated</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                            <div>
                              <span className="text-gray-600">Compensation:</span>
                              <span className="ml-1 font-medium">{report.compensation_quartile}th percentile</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Progression:</span>
                              <span className="ml-1 font-medium">{report.career_progression_score}/100</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(report.generation_date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {completedRecs.length === 0 && reports.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-600">Your career journey timeline will appear here as you make progress</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📈 Benchmark Report History</CardTitle>
                <CardDescription>Track how your market position has evolved</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No benchmark reports yet</p>
                    <Button onClick={() => router.push('/dashboard/benchmark')}>
                      Generate Benchmark Report
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report, index) => (
                      <div 
                        key={report.report_id}
                        className={`p-4 rounded-lg border ${
                          report.is_current 
                            ? 'bg-indigo-50 border-indigo-300' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Report #{reports.length - index}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(report.generation_date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          {report.is_current && (
                            <Badge className="bg-indigo-600">Current</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">Compensation</p>
                            <p className="text-lg font-bold text-gray-900">
                              {report.compensation_quartile}th
                            </p>
                            <p className="text-xs text-gray-500">percentile</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Progression</p>
                            <p className="text-lg font-bold text-gray-900">
                              {report.career_progression_score}
                            </p>
                            <p className="text-xs text-gray-500">score</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Skills</p>
                            <p className="text-lg font-bold text-gray-900">
                              {report.skill_relevance_scores.overall}
                            </p>
                            <p className="text-xs text-gray-500">relevance</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Position Level</p>
                            <p className="text-lg font-bold text-gray-900">
                              {report.position_level_score}
                            </p>
                            <p className="text-xs text-gray-500">score</p>
                          </div>
                        </div>

                        {index > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Change from previous:</p>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div className={getChangeColor(report.compensation_quartile - reports[index - 1].compensation_quartile)}>
                                {getChangeText(report.compensation_quartile - reports[index - 1].compensation_quartile)}
                              </div>
                              <div className={getChangeColor(report.career_progression_score - reports[index - 1].career_progression_score)}>
                                {getChangeText(report.career_progression_score - reports[index - 1].career_progression_score)}
                              </div>
                              <div className={getChangeColor(report.skill_relevance_scores.overall - reports[index - 1].skill_relevance_scores.overall)}>
                                {getChangeText(report.skill_relevance_scores.overall - reports[index - 1].skill_relevance_scores.overall)}
                              </div>
                              <div className={getChangeColor(report.position_level_score - reports[index - 1].position_level_score)}>
                                {getChangeText(report.position_level_score - reports[index - 1].position_level_score)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-600 font-semibold';
  if (change < 0) return 'text-red-600 font-semibold';
  return 'text-gray-600';
}

function getChangeText(change: number): string {
  if (change > 0) return `+${change}`;
  if (change < 0) return `${change}`;
  return 'No change';
}
