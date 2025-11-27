"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { careerPlanService, CareerPlan, Recommendation } from '@/lib/career-plan';
import { profileService } from '@/lib/profile';
import { exportCareerPlanToPDF } from '@/lib/pdf-export';
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
import { Download } from 'lucide-react';

export default function CareerPlanPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (user) {
        try {
          const token = await getToken();
          if (!token) return;

          const existingPlan = await careerPlanService.getPlan(token);
          setPlan(existingPlan);
        } catch (error) {
          console.error("Failed to load plan", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleGeneratePlan = async () => {
    if (!user) return;
    
    try {
      setGenerating(true);
      const token = await getToken();
      if (!token) return;

      const newPlan = await careerPlanService.generatePlan(token);
      setPlan(newPlan);
    } catch (error) {
      console.error("Failed to generate plan", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleComplete = async (recommendationId: string, currentStatus: string) => {
    if (!user || !plan) return;
    const token = await getToken();
    if (!token) return;

    if (!recommendationId || recommendationId === 'undefined') {
      console.error('Invalid recommendation ID');
      return;
    }

    const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
    try {
      const updatedRec = await careerPlanService.updateRecommendation(token, recommendationId, {
        status: newStatus as 'active' | 'completed' | 'dismissed',
      });
      
      // Update local state to reflect change immediately
      const updatedPlan = { ...plan };
      const recIndex = updatedPlan.recommendations.findIndex(r => r.recommendation_id === recommendationId);
      if (recIndex !== -1) {
        updatedPlan.recommendations[recIndex] = updatedRec;
        
        // Update selectedRec if it's the one currently open
        if (selectedRec && selectedRec.recommendation_id === recommendationId) {
          setSelectedRec(updatedRec);
        }

        // Recalculate percentage locally (optional, but good for UI responsiveness)
        const activeRecs = updatedPlan.recommendations.filter(r => r.status !== 'dismissed');
        if (activeRecs.length > 0) {
          const completed = activeRecs.filter(r => r.status === 'completed').length;
          updatedPlan.overall_completion_percentage = Math.round((completed / activeRecs.length) * 100);
        }
      }
      setPlan(updatedPlan);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDismiss = async (recommendationId: string) => {
    if (!user || !plan) return;
    const token = await getToken();
    if (!token) return;

    try {
      const updatedRec = await careerPlanService.updateRecommendation(token, recommendationId, {
        status: 'dismissed',
      });

       // Update local state
       const updatedPlan = { ...plan };
       const recIndex = updatedPlan.recommendations.findIndex(r => r.recommendation_id === recommendationId);
       if (recIndex !== -1) {
         updatedPlan.recommendations[recIndex] = updatedRec;
         // Recalculate percentage locally
        const activeRecs = updatedPlan.recommendations.filter(r => r.status !== 'dismissed');
        if (activeRecs.length > 0) {
          const completed = activeRecs.filter(r => r.status === 'completed').length;
          updatedPlan.overall_completion_percentage = Math.round((completed / activeRecs.length) * 100);
        } else {
             updatedPlan.overall_completion_percentage = 0;
        }
       }
       setPlan(updatedPlan);
       setSelectedRec(null);
    } catch (error) {
      console.error("Failed to dismiss", error);
    }
  };

  const handleUpdateNotes = async (recommendationId: string, notes: string) => {
    if (!user || !plan) return;
    const token = await getToken();
    if (!token) return;
    
    // Optimistic update for notes input field to avoid lag
    // In a real app we'd debounce the API call
    const updatedPlan = { ...plan };
    const recIndex = updatedPlan.recommendations.findIndex(r => r.recommendation_id === recommendationId);
    if (recIndex !== -1) {
        updatedPlan.recommendations[recIndex].user_notes = notes;
        setPlan(updatedPlan);
        
        // Also update selectedRec so the textarea doesn't lag/reset
        if (selectedRec && selectedRec.recommendation_id === recommendationId) {
          setSelectedRec({ ...selectedRec, user_notes: notes });
        }
    }
    
    // We'll just update state locally for typing smoothness,
    // but actual save would ideally happen onBlur or debounced.
    // For MVP, we can trigger the API call here but not wait for it to update UI
    careerPlanService.updateRecommendation(token, recommendationId, {
      user_notes: notes,
    }).catch(e => console.error("Failed to save notes", e));
  };

  const handleExportPDF = async () => {
    if (!plan || !user) return;
    
    try {
      const token = await getToken();
      if (!token) return;
      
      const profile = await profileService.getProfileAsync(token);
      const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'User';
      const industry = profile?.industry || 'Technology';
      
      exportCareerPlanToPDF({
        recommendations: plan.recommendations.map(rec => ({
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          timeline: rec.timeline
        })),
        milestones: plan.milestones?.map(milestone => ({
          title: milestone.title,
          description: milestone.description,
          timeline: milestone.timeline,
          status: milestone.status
        })) || [],
        created_at: plan.generation_date
      }, userName, industry);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
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
            <p className="text-gray-600 mb-6">Create your personalized career plan with AI</p>
            <Button onClick={handleGeneratePlan} disabled={generating}>
              {generating ? 'Generating Plan...' : 'Generate Career Plan'}
            </Button>
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              className="bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button asChild variant="outline" className="bg-white">
              <Link href="/dashboard/benchmark">View Benchmark Report</Link>
            </Button>
          </div>
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
          {filteredRecommendations.map((rec, index) => (
            <Card
              key={rec.recommendation_id || `rec-${index}`}
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
              </DialogHeader>
              
              <div className="flex gap-2 mb-4">
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
