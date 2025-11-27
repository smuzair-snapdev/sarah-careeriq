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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Welcome back, {user?.name}! ✨</h1>
            <p className="text-lg text-gray-600">Here's your career advancement overview</p>
          </div>

          {needsCompletion && (
            <Card className="mb-6 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center">
                  <span className="mr-2">⚡</span> Complete Your Profile
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Your profile is {profile.completion_percentage}% complete. Complete it to get accurate benchmarks and AI-powered recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={profile.completion_percentage} className="mb-4 h-2" />
                <Button asChild className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                  <Link href="/profile-setup">Complete Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-lg text-gray-700 flex items-center">
                <span className="mr-2">📊</span> Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {profile.completion_percentage}%
              </div>
              <Progress value={profile.completion_percentage} className="h-2 mb-3" />
              <p className="text-sm text-gray-600">
                {profile.completion_percentage < 100 ? '🎯 Keep going!' : '✅ Excellent!'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-lg text-gray-700 flex items-center">
                <span className="mr-2">💼</span> Current Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <p className="font-semibold text-gray-900 text-lg">{profile.current_title}</p>
                <p className="text-sm text-gray-600">{profile.current_company}</p>
              </div>
              <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">{profile.industry}</Badge>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-lg text-gray-700 flex items-center">
                <span className="mr-2">🎓</span> Skills Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Technical Skills</p>
                  <p className="text-2xl font-bold text-indigo-600">{profile.technical_skills.length}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Soft Skills</p>
                  <p className="text-2xl font-bold text-purple-600">{profile.soft_skills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">⚡</span> Quick Actions
              </CardTitle>
              <CardDescription>What would you like to do today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 hover:from-blue-100 hover:to-indigo-100 border border-indigo-200" variant="outline">
                <Link href="/dashboard/benchmark">
                  📈 View Benchmark Report
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 hover:from-purple-100 hover:to-pink-100 border border-purple-200" variant="outline">
                <Link href="/dashboard/plan">
                  🎯 View Career Plan
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 border border-green-200" variant="outline">
                <Link href="/dashboard/profile">
                  👤 Update Profile
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 hover:from-amber-100 hover:to-orange-100 border border-amber-200" variant="outline">
                <Link href="/dashboard/progress">
                  ✨ Track Progress
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-white">🚀 Getting Started</CardTitle>
              <CardDescription className="text-indigo-100">Your roadmap to career advancement</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-md">
                    1
                  </span>
                  <div>
                    <p className="font-semibold">Complete your profile</p>
                    <p className="text-sm text-indigo-100">Provide comprehensive career data</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-md">
                    2
                  </span>
                  <div>
                    <p className="font-semibold">Review your benchmark</p>
                    <p className="text-sm text-indigo-100">See where you stand in the market</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-md">
                    3
                  </span>
                  <div>
                    <p className="font-semibold">Follow your AI career plan</p>
                    <p className="text-sm text-indigo-100">Take action on personalized recommendations</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-md">
                    4
                  </span>
                  <div>
                    <p className="font-semibold">Track your progress</p>
                    <p className="text-sm text-indigo-100">Monitor your career advancement journey</p>
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
