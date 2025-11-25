"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { profileService, Profile, INDUSTRIES, SUGGESTED_TECHNICAL_SKILLS, SUGGESTED_SOFT_SKILLS, CareerProgression } from '@/lib/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const STEPS = [
  { id: 1, title: 'Education', description: 'Your educational background' },
  { id: 2, title: 'Current Position', description: 'Your current role and company' },
  { id: 3, title: 'Technical Skills', description: 'Your technical expertise' },
  { id: 4, title: 'Soft Skills', description: 'Your interpersonal abilities' },
  { id: 5, title: 'Career History', description: 'Your career progression' },
  { id: 6, title: 'Compensation', description: 'Your salary information' },
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  
  // Form state
  const [graduationYear, setGraduationYear] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [age, setAge] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [customTechSkill, setCustomTechSkill] = useState('');
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [customSoftSkill, setCustomSoftSkill] = useState('');
  const [careerProgression, setCareerProgression] = useState<CareerProgression[]>([]);
  const [newProgressionDate, setNewProgressionDate] = useState('');
  const [newProgressionTitle, setNewProgressionTitle] = useState('');
  const [newProgressionCompany, setNewProgressionCompany] = useState('');
  const [salaryPackage, setSalaryPackage] = useState('');

  useEffect(() => {
    if (user) {
      const existingProfile = profileService.getProfile(user.id);
      if (existingProfile) {
        // Load existing profile data
        setGraduationYear(existingProfile.graduation_year?.toString() || '');
        setFieldOfStudy(existingProfile.field_of_study || '');
        setAge(existingProfile.age?.toString() || '');
        setCurrentCompany(existingProfile.current_company || '');
        setCurrentTitle(existingProfile.current_title || '');
        setIndustry(existingProfile.industry || '');
        setTechnicalSkills(existingProfile.technical_skills || []);
        setSoftSkills(existingProfile.soft_skills || []);
        setCareerProgression(existingProfile.career_progression || []);
        setSalaryPackage(existingProfile.salary_package?.toString() || '');
      }
    }
  }, [user]);

  const handleNext = () => {
    setError('');
    if (validateCurrentStep()) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!graduationYear || !fieldOfStudy || !age) {
          setError('Please fill in all education fields');
          return false;
        }
        const gradYear = parseInt(graduationYear);
        const userAge = parseInt(age);
        if (gradYear < 1980 || gradYear > new Date().getFullYear()) {
          setError('Please enter a valid graduation year');
          return false;
        }
        if (userAge < 30 || userAge > 50) {
          setError('This platform is designed for professionals aged 30-50');
          return false;
        }
        return true;
      case 2:
        if (!currentCompany || !currentTitle || !industry) {
          setError('Please fill in all current position fields');
          return false;
        }
        return true;
      case 3:
        if (technicalSkills.length === 0) {
          setError('Please select at least one technical skill');
          return false;
        }
        return true;
      case 4:
        if (softSkills.length === 0) {
          setError('Please select at least one soft skill');
          return false;
        }
        return true;
      case 5:
        // Career progression is optional
        return true;
      case 6:
        if (!salaryPackage) {
          setError('Please enter your salary package');
          return false;
        }
        if (parseInt(salaryPackage) <= 0) {
          setError('Please enter a valid salary amount');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (!user) return;

    const profileData: Partial<Profile> = {
      graduation_year: parseInt(graduationYear),
      field_of_study: fieldOfStudy,
      age: parseInt(age),
      current_company: currentCompany,
      current_title: currentTitle,
      industry,
      technical_skills: technicalSkills,
      soft_skills: softSkills,
      career_progression: careerProgression,
      salary_package: parseInt(salaryPackage),
    };

    const existingProfile = profileService.getProfile(user.id);
    if (existingProfile) {
      profileService.updateProfile(user.id, profileData);
    } else {
      profileService.createProfile(user.id, profileData);
    }

    router.push('/dashboard');
  };

  const toggleSkill = (skill: string, type: 'technical' | 'soft') => {
    if (type === 'technical') {
      if (technicalSkills.includes(skill)) {
        setTechnicalSkills(technicalSkills.filter(s => s !== skill));
      } else {
        setTechnicalSkills([...technicalSkills, skill]);
      }
    } else {
      if (softSkills.includes(skill)) {
        setSoftSkills(softSkills.filter(s => s !== skill));
      } else {
        setSoftSkills([...softSkills, skill]);
      }
    }
  };

  const addCustomSkill = (type: 'technical' | 'soft') => {
    if (type === 'technical' && customTechSkill.trim()) {
      if (!technicalSkills.includes(customTechSkill.trim())) {
        setTechnicalSkills([...technicalSkills, customTechSkill.trim()]);
      }
      setCustomTechSkill('');
    } else if (type === 'soft' && customSoftSkill.trim()) {
      if (!softSkills.includes(customSoftSkill.trim())) {
        setSoftSkills([...softSkills, customSoftSkill.trim()]);
      }
      setCustomSoftSkill('');
    }
  };

  const addCareerProgression = () => {
    if (newProgressionDate && newProgressionTitle && newProgressionCompany) {
      setCareerProgression([
        ...careerProgression,
        {
          date: newProgressionDate,
          title: newProgressionTitle,
          company: newProgressionCompany,
        },
      ]);
      setNewProgressionDate('');
      setNewProgressionTitle('');
      setNewProgressionCompany('');
    }
  };

  const removeCareerProgression = (index: number) => {
    setCareerProgression(careerProgression.filter((_, i) => i !== index));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <Input
                id="graduationYear"
                type="number"
                placeholder="2010"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                min="1980"
                max={new Date().getFullYear()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy">Field of Study</Label>
              <Input
                id="fieldOfStudy"
                type="text"
                placeholder="Computer Science"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="35"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="30"
                max="50"
              />
              <p className="text-sm text-gray-500">This platform is designed for professionals aged 30-50</p>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentCompany">Current Company</Label>
              <Input
                id="currentCompany"
                type="text"
                placeholder="Acme Corp"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentTitle">Current Job Title</Label>
              <Input
                id="currentTitle"
                type="text"
                placeholder="Senior Software Engineer"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Your Technical Skills</Label>
              <p className="text-sm text-gray-500 mb-3">Click to select or deselect skills</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {SUGGESTED_TECHNICAL_SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={technicalSkills.includes(skill) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill, 'technical')}
                  >
                    {skill}
                    {technicalSkills.includes(skill) && ' ✓'}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customTechSkill">Add Custom Skill</Label>
              <div className="flex gap-2">
                <Input
                  id="customTechSkill"
                  type="text"
                  placeholder="Enter a skill"
                  value={customTechSkill}
                  onChange={(e) => setCustomTechSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSkill('technical')}
                />
                <Button type="button" onClick={() => addCustomSkill('technical')}>Add</Button>
              </div>
            </div>
            
            {technicalSkills.length > 0 && (
              <div>
                <Label>Your Technical Skills ({technicalSkills.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {technicalSkills.map((skill) => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Your Soft Skills</Label>
              <p className="text-sm text-gray-500 mb-3">Click to select or deselect skills</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {SUGGESTED_SOFT_SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={softSkills.includes(skill) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill, 'soft')}
                  >
                    {skill}
                    {softSkills.includes(skill) && ' ✓'}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customSoftSkill">Add Custom Skill</Label>
              <div className="flex gap-2">
                <Input
                  id="customSoftSkill"
                  type="text"
                  placeholder="Enter a skill"
                  value={customSoftSkill}
                  onChange={(e) => setCustomSoftSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSkill('soft')}
                />
                <Button type="button" onClick={() => addCustomSkill('soft')}>Add</Button>
              </div>
            </div>
            
            {softSkills.length > 0 && (
              <div>
                <Label>Your Soft Skills ({softSkills.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {softSkills.map((skill) => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label>Career Progression (Optional)</Label>
              <p className="text-sm text-gray-500 mb-3">Add your promotions and job changes</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="progressionDate">Date</Label>
              <Input
                id="progressionDate"
                type="month"
                value={newProgressionDate}
                onChange={(e) => setNewProgressionDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="progressionTitle">Job Title</Label>
              <Input
                id="progressionTitle"
                type="text"
                placeholder="Senior Developer"
                value={newProgressionTitle}
                onChange={(e) => setNewProgressionTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="progressionCompany">Company</Label>
              <Input
                id="progressionCompany"
                type="text"
                placeholder="Tech Corp"
                value={newProgressionCompany}
                onChange={(e) => setNewProgressionCompany(e.target.value)}
              />
            </div>
            
            <Button type="button" onClick={addCareerProgression} variant="outline" className="w-full">
              Add Career Entry
            </Button>
            
            {careerProgression.length > 0 && (
              <div className="space-y-2">
                <Label>Your Career Timeline</Label>
                {careerProgression.sort((a, b) => b.date.localeCompare(a.date)).map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{entry.title}</p>
                      <p className="text-sm text-gray-600">{entry.company}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCareerProgression(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salaryPackage">Annual Salary Package (USD)</Label>
              <Input
                id="salaryPackage"
                type="number"
                placeholder="80000"
                value={salaryPackage}
                onChange={(e) => setSalaryPackage(e.target.value)}
                min="0"
              />
              <p className="text-sm text-gray-500">This information is kept completely confidential and is used only for benchmarking</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help us understand your career to provide personalized insights</p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {STEPS.length}</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {renderStep()}
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
              >
                {currentStep === STEPS.length ? 'Complete Profile' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
