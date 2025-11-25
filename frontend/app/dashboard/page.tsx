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
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      const userProfile = profileService.getProfile(user.id);
      setProfile(userProfile);
      
      // Redirect to profile setup if no profile exists
      if (!userProfile) {
        router.push('/profile-setup');
      }
    }
  }, [user, router]);

  if (!profile) {
    return (
      <>
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to CareerIQ!</h2>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Here's your career advancement overview</p>
        </div>

        {needsCompletion && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900">Complete Your Profile</CardTitle>
              <CardDescription className="text-amber-700">
                Your profile is {profile.completion_percentage}% complete. Complete it to get accurate benchmarks and recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={profile.completion_percentage} className="mb-4" />
              <Button asChild variant="outline">
                <Link href="/profile-setup">Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {profile.completion_percentage}%
              </div>
              <Progress value={profile.completion_percentage} />
              <p className="text-sm text-gray-600 mt-2">
                {profile.completion_percentage < 100 ? 'Keep going!' : 'Excellent!'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <p className="font-semibold text-gray-900">{profile.current_title}</p>
                <p className="text-sm text-gray-600">{profile.current_company}</p>
              </div>
              <Badge variant="secondary">{profile.industry}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Technical Skills</p>
                  <p className="text-2xl font-bold text-indigo-600">{profile.technical_skills.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Soft Skills</p>
                  <p className="text-2xl font-bold text-indigo-600">{profile.soft_skills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>What would you like to do today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/benchmark">
                  📈 View Benchmark Report
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/plan">
                  🎯 View Career Plan
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/profile">
                  👤 Update Profile
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/progress">
                  📅 Track Progress
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Your roadmap to career advancement</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm mr-3">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Complete your profile</p>
                    <p className="text-sm text-gray-600">Provide comprehensive career data</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm mr-3">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Review your benchmark</p>
                    <p className="text-sm text-gray-600">See where you stand in the market</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm mr-3">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Follow your career plan</p>
                    <p className="text-sm text-gray-600">Take action on recommendations</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm mr-3">
                    4
                  </span>
                  <div>
                    <p className="font-medium">Track your progress</p>
                    <p className="text-sm text-gray-600">Monitor your career advancement</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
