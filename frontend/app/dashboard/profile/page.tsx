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
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Profile Found</h2>
            <p className="text-gray-600 mb-6">Create your profile to get started</p>
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">My Profile</h1>
              <p className="text-lg text-gray-600">View and manage your professional information</p>
            </div>
            <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md">
              <Link href="/profile-setup">✏️ Edit Profile</Link>
            </Button>
          </div>

          {/* Info Alert */}
          <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Profile Updates Trigger AI Regeneration</p>
                  <p className="text-sm text-blue-700">
                    When you update your profile, your <strong>Benchmark Report</strong> is automatically recalculated and your <strong>Career Plan</strong> is regenerated using AI (Gemini) with the latest data and market insights.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card className="mb-6 bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">📊</span> Profile Completion
              </CardTitle>
              <CardDescription>
                {profile.completion_percentage < 100 
                  ? 'Complete your profile for more accurate AI-powered insights'
                  : 'Your profile is complete! You\'ll get the best recommendations.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {profile.completion_percentage}% Complete
                </span>
                {profile.completion_percentage === 100 && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">Complete ✓</Badge>
                )}
              </div>
              <Progress value={profile.completion_percentage} className="h-3" />
            </CardContent>
          </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle>🎓 Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Field of Study</p>
                <p className="text-lg text-gray-900">{profile.field_of_study || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Graduation Year</p>
                <p className="text-lg text-gray-900">{profile.graduation_year || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Years of Experience</p>
                <p className="text-lg text-gray-900">{yearsOfExperience} years</p>
              </div>
            </CardContent>
          </Card>

          {/* Current Position */}
          <Card>
            <CardHeader>
              <CardTitle>💼 Current Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Job Title</p>
                <p className="text-lg text-gray-900">{profile.current_title || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Company</p>
                <p className="text-lg text-gray-900">{profile.current_company || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Industry</p>
                <Badge variant="secondary" className="text-base">{profile.industry || 'Not specified'}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Technical Skills */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Technical Skills</CardTitle>
              <CardDescription>{profile.technical_skills.length} skills</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.technical_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.technical_skills.map((skill) => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No technical skills added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Soft Skills */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Soft Skills</CardTitle>
              <CardDescription>{profile.soft_skills.length} skills</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.soft_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.soft_skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No soft skills added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Career Progression */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>📈 Career Progression</CardTitle>
              <CardDescription>
                {profile.career_progression.length} milestone{profile.career_progression.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.career_progression.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4">
                    {profile.career_progression
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((entry, index) => (
                        <div key={index} className="relative pl-10">
                          <div className="absolute left-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {profile.career_progression.length - index}
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="font-semibold text-gray-900">{entry.title}</p>
                            <p className="text-sm text-gray-600">{entry.company}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(entry.date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No career progression entries yet</p>
              )}
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle>💰 Compensation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-gray-600 mb-1">Annual Salary Package</p>
              {profile.salary_package ? (
                <p className="text-2xl font-bold text-gray-900">
                  ${profile.salary_package.toLocaleString()}
                </p>
              ) : (
                <p className="text-gray-500">Not specified</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                This information is private and used only for benchmarking
              </p>
            </CardContent>
          </Card>

          {/* Profile Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>📅 Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-600">Age</p>
                <p className="text-lg text-gray-900">{profile.age || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Created</p>
                <p className="text-sm text-gray-700">
                  {new Date(profile.created_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm text-gray-700">
                  {new Date(profile.last_modified_date).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button asChild variant="outline" className="flex-1 border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
            <Link href="/dashboard/benchmark">
              📈 View Benchmark Report
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50">
            <Link href="/dashboard/plan">
              🎯 View Career Plan
            </Link>
          </Button>
        </div>
        </div>
      </div>
    </>
  );
}
