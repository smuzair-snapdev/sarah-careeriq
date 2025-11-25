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
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const userProfile = profileService.getProfile(user.id);
      setProfile(userProfile);
      setLoading(false);
    }
  }, [user]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">View and manage your professional information</p>
          </div>
          <Button asChild>
            <Link href="/profile-setup">Edit Profile</Link>
          </Button>
        </div>

        {/* Profile Completion */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>
              {profile.completion_percentage < 100 
                ? 'Complete your profile for more accurate insights'
                : 'Your profile is complete!'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {profile.completion_percentage}% Complete
              </span>
              {profile.completion_percentage === 100 && (
                <Badge className="bg-green-500">Complete ✓</Badge>
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
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/benchmark">
              View Benchmark Report
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/plan">
              View Career Plan
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
