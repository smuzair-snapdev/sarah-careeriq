"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { profileService, Profile } from '@/lib/profile';
import DashboardNav from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const token = await getToken();
          if (!token) return;

          const userProfile = await profileService.getProfileAsync(token);
          setProfile(userProfile);
        } catch (err) {
          console.error("Failed to load profile", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) {
    return (
      <>
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">No Profile Found</h2>
            <p className="text-muted-foreground mb-6">Create your profile to get started</p>
            <Button onClick={() => router.push('/profile-setup')}>Create Profile</Button>
          </div>
        </div>
      </>
    );
  }

  const yearsOfExperience = new Date().getFullYear() - (profile.graduation_year || 2010);

  return (
    <>
      <DashboardNav />
      <div className="min-h-screen bg-background pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">My Profile</h1>
              <p className="text-muted-foreground">View and manage your professional information</p>
            </div>
            <Button asChild>
              <Link href="/profile-setup">Edit Profile</Link>
            </Button>
          </div>

          {/* Info Alert */}
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="font-semibold text-blue-900 mb-1 text-sm">Profile Updates Trigger AI Regeneration</p>
                  <p className="text-xs text-blue-800/80 leading-relaxed">
                    When you update your profile, your <strong>Benchmark Report</strong> is automatically recalculated and your <strong>Career Plan</strong> is regenerated using AI with the latest data and market insights.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card className="mb-6 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Profile Completion</CardTitle>
                {profile.completion_percentage === 100 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>
                )}
              </div>
              <CardDescription>
                {profile.completion_percentage < 100
                  ? 'Complete your profile for more accurate AI-powered insights'
                  : 'Your profile is complete! You\'ll get the best recommendations.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {profile.completion_percentage}%
                </span>
              </div>
              <Progress value={profile.completion_percentage} className="h-2" />
            </CardContent>
          </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Education */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Field of Study</p>
                <p className="text-base text-foreground mt-0.5">{profile.field_of_study || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Graduation Year</p>
                <p className="text-base text-foreground mt-0.5">{profile.graduation_year || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Experience</p>
                <p className="text-base text-foreground mt-0.5">{yearsOfExperience} years</p>
              </div>
            </CardContent>
          </Card>

          {/* Current Position */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Current Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Job Title</p>
                <p className="text-base text-foreground mt-0.5">{profile.current_title || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company</p>
                <p className="text-base text-foreground mt-0.5">{profile.current_company || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Industry</p>
                <Badge variant="outline" className="mt-1 font-normal">{profile.industry || 'Not specified'}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Technical Skills */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Technical Skills</CardTitle>
                <Badge variant="secondary">{profile.technical_skills.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {profile.technical_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.technical_skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="font-normal hover:bg-muted">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No technical skills added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Soft Skills */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Soft Skills</CardTitle>
                <Badge variant="secondary">{profile.soft_skills.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {profile.soft_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.soft_skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No soft skills added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Compensation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Annual Salary</p>
              {profile.salary_package ? (
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  ${profile.salary_package.toLocaleString()}
                </p>
              ) : (
                <p className="text-muted-foreground">Not specified</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Private and used only for benchmarking
              </p>
            </CardContent>
          </Card>

          {/* Profile Metadata */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Age</p>
                  <p className="text-base text-foreground mt-0.5">{profile.age || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</p>
                  <p className="text-base text-foreground mt-0.5">
                    {new Date(profile.created_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button asChild variant="outline" className="flex-1 h-auto py-4">
            <Link href="/dashboard/benchmark">
              <div className="flex flex-col items-center gap-1">
                <span className="font-medium">View Benchmark Report</span>
                <span className="text-xs text-muted-foreground">Compare market position</span>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 h-auto py-4">
            <Link href="/dashboard/plan">
              <div className="flex flex-col items-center gap-1">
                <span className="font-medium">View Career Plan</span>
                <span className="text-xs text-muted-foreground">AI growth roadmap</span>
              </div>
            </Link>
          </Button>
        </div>
        </div>
      </div>
    </>
  );
}
