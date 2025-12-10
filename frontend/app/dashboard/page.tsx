"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { profileService, Profile } from '@/lib/profile';
import DashboardNav from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        try {
          const token = await getToken();
          if (!token) return;

          const userProfile = await profileService.getProfileAsync(token);
          
          if (userProfile) {
            setProfile(userProfile);
          }
          // Removed automatic redirect to avoid loops if API fails temporarily
          // The UI will show a "Complete Your Profile" button instead
        } catch (error) {
          console.error("Error checking profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    checkProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!profile) {
    return (
      <>
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to DevCareerIQ!</h2>
            <p className="text-gray-600 mb-6">Let's start by setting up your professional profile</p>
            <Button onClick={() => router.push('/profile-setup')}>
              Complete Your Profile
            </Button>
          </div>
        </div>
      </>
    );
  }

  const needsCompletion = profile.completion_percentage < 80;

  return (
    <>
      <DashboardNav />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground">Here's your career advancement overview</p>
          </div>

          {needsCompletion && (
            <Card className="mb-6 border-amber-200 bg-amber-50/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center text-lg">
                  Complete Your Profile
                </CardTitle>
                <CardDescription className="text-amber-800/80">
                  Your profile is {profile.completion_percentage}% complete. Complete it to get accurate benchmarks and AI-powered recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={profile.completion_percentage} className="mb-4 h-2 bg-amber-200" />
                <Button asChild variant="default" className="bg-amber-600 hover:bg-amber-700 text-white border-0">
                  <Link href="/profile-setup">Complete Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">
                {profile.completion_percentage}%
              </div>
              <Progress value={profile.completion_percentage} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {profile.completion_percentage < 100 ? 'Keep going!' : 'Excellent!'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <p className="font-semibold text-foreground text-lg truncate">{profile.current_title}</p>
                <p className="text-sm text-muted-foreground truncate">{profile.current_company}</p>
              </div>
              <Badge variant="outline" className="font-normal">{profile.industry}</Badge>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Skills Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Technical</p>
                  <p className="text-2xl font-bold text-foreground">{profile.technical_skills.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Soft Skills</p>
                  <p className="text-2xl font-bold text-foreground">{profile.soft_skills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>What would you like to do today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start h-auto py-3 px-4" variant="outline">
                <Link href="/dashboard/benchmark">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">View Benchmark Report</span>
                    <span className="text-xs text-muted-foreground font-normal">Compare your salary and skills</span>
                  </div>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start h-auto py-3 px-4" variant="outline">
                <Link href="/dashboard/plan">
                   <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">View Career Plan</span>
                    <span className="text-xs text-muted-foreground font-normal">AI-generated growth roadmap</span>
                  </div>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start h-auto py-3 px-4" variant="outline">
                <Link href="/dashboard/profile">
                   <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">Update Profile</span>
                    <span className="text-xs text-muted-foreground font-normal">Keep your information current</span>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Getting Started</CardTitle>
              <CardDescription className="text-primary-foreground/80">Your roadmap to career advancement</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-6 relative">
                 <div className="absolute left-[15px] top-2 bottom-2 w-px bg-primary-foreground/20" />
                <li className="flex items-start relative z-10">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-foreground text-primary rounded-full flex items-center justify-center text-sm font-bold mr-4">
                    1
                  </span>
                  <div className="pt-1">
                    <p className="font-semibold text-sm">Complete your profile</p>
                    <p className="text-xs text-primary-foreground/70 mt-0.5">Provide comprehensive career data</p>
                  </div>
                </li>
                <li className="flex items-start relative z-10">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-foreground text-primary rounded-full flex items-center justify-center text-sm font-bold mr-4">
                    2
                  </span>
                  <div className="pt-1">
                    <p className="font-semibold text-sm">Review your benchmark</p>
                    <p className="text-xs text-primary-foreground/70 mt-0.5">See where you stand in the market</p>
                  </div>
                </li>
                <li className="flex items-start relative z-10">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-foreground text-primary rounded-full flex items-center justify-center text-sm font-bold mr-4">
                    3
                  </span>
                  <div className="pt-1">
                    <p className="font-semibold text-sm">Follow your AI career plan</p>
                    <p className="text-xs text-primary-foreground/70 mt-0.5">Take action on personalized recommendations</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
}
