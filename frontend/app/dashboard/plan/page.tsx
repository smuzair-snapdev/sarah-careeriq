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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Download, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      
      const updatedPlan = { ...plan };
      const recIndex = updatedPlan.recommendations.findIndex(r => r.recommendation_id === recommendationId);
      if (recIndex !== -1) {
        updatedPlan.recommendations[recIndex] = updatedRec;
        
        if (selectedRec && selectedRec.recommendation_id === recommendationId) {
          setSelectedRec(updatedRec);
        }

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

       const updatedPlan = { ...plan };
       const recIndex = updatedPlan.recommendations.findIndex(r => r.recommendation_id === recommendationId);
       if (recIndex !== -1) {
         updatedPlan.recommendations[recIndex] = updatedRec;
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
    
    const updatedPlan = { ...plan };
    const recIndex = updatedPlan.recommendations.findIndex(r => r.recommendation_id === recommendationId);
    if (recIndex !== -1) {
        updatedPlan.recommendations[recIndex].user_notes = notes;
        setPlan(updatedPlan);
        
        if (selectedRec && selectedRec.recommendation_id === recommendationId) {
          setSelectedRec({ ...selectedRec, user_notes: notes });
        }
    }
    
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
      const userName = 'User';
      const industry = profile?.industry || 'Technology';
      
      exportCareerPlanToPDF({
        recommendations: plan.recommendations.map(rec => ({
          title: rec.title,
          description: rec.description,
          priority: rec.priority_level,
          timeline: 'Ongoing'
        })),
        milestones: [],
        created_at: plan.generation_date
      }, userName, industry);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your career plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">No Career Plan Available</h2>
            <p className="text-muted-foreground mb-8">Generate a personalized AI career plan based on your profile and market benchmarks.</p>
            <Button onClick={handleGeneratePlan} disabled={generating} size="lg">
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                'Generate Career Plan'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeRecommendations = plan.recommendations.filter(r => r.status !== 'dismissed');
  const filteredRecommendations = filterCategory === 'all'
    ? activeRecommendations
    : activeRecommendations.filter(r => r.category === filterCategory);

  const categoryIcons: Record<string, string> = {
    compensation: '💰',
    skills: '🎯',
    strategic: '🚀',
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Career Plan</h1>
            <p className="text-muted-foreground">
              Generated on {new Date(plan.generation_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/benchmark">View Benchmark Report</Link>
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Progress</CardTitle>
            <CardDescription>
              {plan.overall_completion_percentage}% of recommendations completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={plan.overall_completion_percentage} className="h-2 mb-6" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {activeRecommendations.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {plan.recommendations.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">
                  {plan.recommendations.filter(r => r.status === 'dismissed').length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Dismissed</div>
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
                Compensation
              </TabsTrigger>
              <TabsTrigger value="skills">
                Skills
              </TabsTrigger>
              <TabsTrigger value="strategic">
                Strategic
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {filteredRecommendations.map((rec, index) => (
            <Card
              key={rec.recommendation_id || `rec-${index}`}
              className={cn(
                "transition-all shadow-sm border-border hover:border-primary/50 cursor-pointer",
                rec.status === 'completed' && "opacity-60 bg-muted/30"
              )}
              onClick={() => setSelectedRec(rec)}
            >
              <CardHeader className="py-4">
                <div className="flex items-start gap-4">
                   <div className="flex items-center h-6" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={rec.status === 'completed'}
                      onCheckedChange={() => handleToggleComplete(rec.recommendation_id, rec.status)}
                    />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">{categoryIcons[rec.category]}</span>
                        <h3 className={cn("text-base font-semibold truncate", rec.status === 'completed' && "line-through text-muted-foreground")}>
                          {rec.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={cn(rec.priority_level === 'high' && "border-red-200 text-red-700 bg-red-50")}>
                          {rec.priority_level}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {rec.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{rec.description}</p>
                   </div>
                   <div className="flex items-center justify-center">
                     <ArrowRight className="w-4 h-4 text-muted-foreground" />
                   </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {filteredRecommendations.length === 0 && (
            <Card className="border-dashed shadow-none bg-muted/10">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No recommendations in this category</p>
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
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <span className="text-2xl">{categoryIcons[selectedRec.category]}</span>
                  {selectedRec.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className={cn(selectedRec.priority_level === 'high' && "border-red-200 text-red-700 bg-red-50")}>
                  {selectedRec.priority_level} priority
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {selectedRec.category}
                </Badge>
                {selectedRec.status === 'completed' && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Completed
                  </Badge>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedRec.description}</p>
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-1 text-sm">Expected Impact</h4>
                  <p className="text-sm text-foreground/80">{selectedRec.expected_impact}</p>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-1 text-sm">Data Source</h4>
                  <p className="text-sm text-muted-foreground">{selectedRec.data_source}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Your Notes</h4>
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
    </div>
  );
}
