"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { careerPlanService, CareerPlan, Recommendation } from '@/lib/career-plan';
import DashboardNav from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

export default function CareerPlanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    if (user) {
      const existingPlan = careerPlanService.getPlan(user.id);
      
      if (!existingPlan) {
        router.push('/dashboard/benchmark');
        return;
      }
      
      setPlan(existingPlan);
      setLoading(false);
    }
  }, [user, router]);

  const handleToggleComplete = (recommendationId: string, currentStatus: string) => {
    if (!user || !plan) return;

    const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
    const updatedPlan = careerPlanService.updateRecommendation(user.id, recommendationId, {
      status: newStatus,
    });
    setPlan(updatedPlan);
  };

  const handleDismiss = (recommendationId: string) => {
    if (!user || !plan) return;

    const updatedPlan = careerPlanService.updateRecommendation(user.id, recommendationId, {
      status: 'dismissed',
    });
    setPlan(updatedPlan);
    setSelectedRec(null);
  };

  const handleUpdateNotes = (recommendationId: string, notes: string) => {
    if (!user || !plan) return;

    const updatedPlan = careerPlanService.updateRecommendation(user.id, recommendationId, {
      user_notes: notes,
    });
    setPlan(updatedPlan);
  };

  if (loading) {
    return (
      <>
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your career plan...</p>
          </div>
        </div>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Career Plan Available</h2>
            <p className="text-gray-600 mb-6">Generate your benchmark report first</p>
            <Button onClick={() => router.push('/dashboard/benchmark')}>View Benchmark Report</Button>
          </div>
        </div>
      </>
    );
  }

  const activeRecommendations = plan.recommendations.filter(r => r.status !== 'dismissed');
  const filteredRecommendations = filterCategory === 'all'
    ? activeRecommendations
    : activeRecommendations.filter(r => r.category === filterCategory);

  const categoryIcons = {
    compensation: '💰',
    skills: '🎯',
    strategic: '🚀',
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <>
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Advancement Plan</h1>
            <p className="text-gray-600">
              Generated on {new Date(plan.generation_date).toLocaleDateString()}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/benchmark">View Benchmark Report</Link>
          </Button>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              {plan.overall_completion_percentage}% of recommendations completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={plan.overall_completion_percentage} className="h-3 mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {activeRecommendations.length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {plan.recommendations.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">
                  {plan.recommendations.filter(r => r.status === 'dismissed').length}
                </div>
                <div className="text-sm text-gray-600">Dismissed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="mb-6">
          <Tabs defaultValue="all" value={filterCategory} onValueChange={setFilterCategory}>
            <TabsList>
              <TabsTrigger value="all">
                All ({activeRecommendations.length})
              </TabsTrigger>
              <TabsTrigger value="compensation">
                💰 Compensation ({activeRecommendations.filter(r => r.category === 'compensation').length})
              </TabsTrigger>
              <TabsTrigger value="skills">
                🎯 Skills ({activeRecommendations.filter(r => r.category === 'skills').length})
              </TabsTrigger>
              <TabsTrigger value="strategic">
                🚀 Strategic ({activeRecommendations.filter(r => r.category === 'strategic').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => (
            <Card 
              key={rec.recommendation_id} 
              className={rec.status === 'completed' ? 'opacity-75 bg-gray-50' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Checkbox
                      checked={rec.status === 'completed'}
                      onCheckedChange={() => handleToggleComplete(rec.recommendation_id, rec.status)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{categoryIcons[rec.category]}</span>
                        <CardTitle className={rec.status === 'completed' ? 'line-through' : ''}>
                          {rec.title}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Badge className={priorityColors[rec.priority_level]}>
                          {rec.priority_level} priority
                        </Badge>
                        <Badge variant="outline">
                          {rec.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRec(rec)}
                  >
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Expected Impact:</p>
                  <p className="text-sm text-blue-800">{rec.expected_impact}</p>
                </div>
                {rec.user_notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-900 mb-1">Your Notes:</p>
                    <p className="text-sm text-amber-800">{rec.user_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredRecommendations.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600">No recommendations in this category</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recommendation Detail Dialog */}
      <Dialog open={!!selectedRec} onOpenChange={(open) => !open && setSelectedRec(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRec && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{categoryIcons[selectedRec.category]}</span>
                  {selectedRec.title}
                </DialogTitle>
                <DialogDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge className={priorityColors[selectedRec.priority_level]}>
                      {selectedRec.priority_level} priority
                    </Badge>
                    <Badge variant="outline">
                      {selectedRec.category}
                    </Badge>
                    {selectedRec.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700">{selectedRec.description}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Expected Impact</h4>
                  <p className="text-sm text-blue-800">{selectedRec.expected_impact}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Data Source</h4>
                  <p className="text-sm text-gray-700">{selectedRec.data_source}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Your Notes</h4>
                  <Textarea
                    placeholder="Add notes about your progress or thoughts..."
                    value={selectedRec.user_notes}
                    onChange={(e) => handleUpdateNotes(selectedRec.recommendation_id, e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleToggleComplete(selectedRec.recommendation_id, selectedRec.status)}
                    className="flex-1"
                  >
                    {selectedRec.status === 'completed' ? 'Mark as Active' : 'Mark as Complete'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDismiss(selectedRec.recommendation_id)}
                    className="flex-1"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
