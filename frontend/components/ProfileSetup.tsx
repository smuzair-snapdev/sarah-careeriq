"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { 
  profileService, 
  Profile, 
  INDUSTRIES, 
  DEV_ROLES,
  LANGUAGES,
  DATABASES,
  PLATFORMS,
  FRAMEWORKS,
  COUNTRIES,
  SUGGESTED_SOFT_SKILLS, 
  CareerProgression 
} from '@/lib/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Basics', description: 'Background & location' },
  { id: 2, title: 'Current Role', description: 'Position details' },
  { id: 3, title: 'Tech Stack', description: 'Languages & frameworks' },
  { id: 4, title: 'Tools', description: 'Databases & platforms' },
  { id: 5, title: 'Soft Skills', description: 'Professional attributes' },
  { id: 6, title: 'Compensation', description: 'Salary information' },
];

export default function ProfileSetup() {
  const { user, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Form state
  // Step 1: Basics
  const [graduationYear, setGraduationYear] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');

  // Step 2: Current Role
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [devRole, setDevRole] = useState('');
  
  // Step 3: Tech Stack
  const [languages, setLanguages] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>([]);
  
  // Step 4: Tools
  const [databases, setDatabases] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  
  // Step 5: Soft Skills
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [customSoftSkill, setCustomSoftSkill] = useState('');
  const [careerProgression, setCareerProgression] = useState<CareerProgression[]>([]);

  // Step 6: Compensation
  const [salaryPackage, setSalaryPackage] = useState('');

  // Search/Filter states
  const [roleSearch, setRoleSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const token = await getToken();
          if (!token) return;

          const existingProfile = await profileService.getProfileAsync(token);
          if (existingProfile) {
            setGraduationYear(existingProfile.graduation_year?.toString() || '');
            setFieldOfStudy(existingProfile.field_of_study || '');
            setAge(existingProfile.age?.toString() || '');
            setCountry(existingProfile.country || '');
            setYearsExperience(existingProfile.years_experience?.toString() || '');
            
            setCurrentCompany(existingProfile.current_company || '');
            setCurrentTitle(existingProfile.current_title || '');
            setIndustry(existingProfile.industry || '');
            setDevRole(existingProfile.dev_role || '');
            
            setLanguages(existingProfile.languages || []);
            setFrameworks(existingProfile.frameworks || []);
            setDatabases(existingProfile.databases || []);
            setPlatforms(existingProfile.platforms || []);
            
            setSoftSkills(existingProfile.soft_skills || []);
            setCareerProgression(existingProfile.career_progression || []);
            setSalaryPackage(existingProfile.salary_package?.toString() || '');
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user, getToken]);

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setError('');
    if (validateCurrentStep()) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!graduationYear || !fieldOfStudy || !age || !country || !yearsExperience) {
          setError('Please fill in all basic fields');
          return false;
        }
        const gradYear = parseInt(graduationYear);
        if (gradYear < 1960 || gradYear > new Date().getFullYear()) {
          setError('Please enter a valid graduation year');
          return false;
        }
        return true;
      case 2:
        if (!currentCompany || !currentTitle || !industry || !devRole) {
          setError('Please fill in all role information');
          return false;
        }
        return true;
      case 3:
        if (languages.length === 0) {
          setError('Please select at least one language');
          return false;
        }
        return true;
      case 4:
        return true;
      case 5:
        if (softSkills.length === 0) {
          setError('Please select at least one soft skill');
          return false;
        }
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

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const token = await getToken();
      if (!token) {
        setError("Authentication failed. Please try again.");
        return;
      }

      const technicalSkills = [
          ...languages, 
          ...frameworks, 
          ...databases, 
          ...platforms
      ];

      const profileData: Partial<Profile> = {
        graduation_year: parseInt(graduationYear),
        field_of_study: fieldOfStudy,
        age: parseInt(age),
        country,
        years_experience: parseFloat(yearsExperience),
        current_company: currentCompany,
        current_title: currentTitle,
        industry,
        dev_role: devRole,
        languages,
        frameworks,
        databases,
        platforms,
        technical_skills: technicalSkills,
        soft_skills: softSkills,
        career_progression: careerProgression,
        salary_package: parseInt(salaryPackage),
      };

      await profileService.updateProfileAsync(token, profileData);
      router.push('/dashboard/benchmark');
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    }
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustomSoftSkill = () => {
    if (customSoftSkill.trim() && !softSkills.includes(customSoftSkill.trim())) {
      setSoftSkills([...softSkills, customSoftSkill.trim()]);
      setCustomSoftSkill('');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  placeholder="e.g. 2018"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy">Field of Study</Label>
              <Input
                id="fieldOfStudy"
                type="text"
                placeholder="e.g. Computer Science"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                step="0.5"
                placeholder="e.g. 5.5"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                   <div className="p-2">
                      <Input 
                        placeholder="Search..." 
                        value={countrySearch} 
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="mb-2 h-8"
                        onKeyDown={(e) => e.stopPropagation()} 
                      />
                   </div>
                   <ScrollArea className="h-[200px]">
                    {COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentCompany">Current Company</Label>
              <Input
                id="currentCompany"
                type="text"
                placeholder="e.g. Tech Corp"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentTitle">Job Title</Label>
              <Input
                id="currentTitle"
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="devRole">Role Type</Label>
              <Select value={devRole} onValueChange={setDevRole}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select closest role" />
                </SelectTrigger>
                <SelectContent>
                   <div className="p-2">
                      <Input 
                        placeholder="Search roles..." 
                        value={roleSearch} 
                        onChange={(e) => setRoleSearch(e.target.value)}
                        className="mb-2 h-8"
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                   </div>
                   <ScrollArea className="h-[200px]">
                    {DEV_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())).map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Used for market benchmarking.</p>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Languages</Label>
              <ScrollArea className="h-[240px] border rounded-md p-4 bg-background">
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <Badge
                      key={lang}
                      variant={languages.includes(lang) ? 'default' : 'outline'}
                      className={cn(
                        "cursor-pointer hover:bg-primary/90 transition-all",
                        languages.includes(lang) ? "border-primary" : "text-muted-foreground"
                      )}
                      onClick={() => toggleSelection(lang, languages, setLanguages)}
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Frameworks</Label>
              <ScrollArea className="h-[240px] border rounded-md p-4 bg-background">
                <div className="flex flex-wrap gap-2">
                  {FRAMEWORKS.map((fw) => (
                    <Badge
                      key={fw}
                      variant={frameworks.includes(fw) ? 'default' : 'outline'}
                      className={cn(
                        "cursor-pointer hover:bg-primary/90 transition-all",
                        frameworks.includes(fw) ? "border-primary" : "text-muted-foreground"
                      )}
                      onClick={() => toggleSelection(fw, frameworks, setFrameworks)}
                    >
                      {fw}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Databases</Label>
              <ScrollArea className="h-[240px] border rounded-md p-4 bg-background">
                <div className="flex flex-wrap gap-2">
                  {DATABASES.map((db) => (
                    <Badge
                      key={db}
                      variant={databases.includes(db) ? 'default' : 'outline'}
                      className={cn(
                        "cursor-pointer hover:bg-primary/90 transition-all",
                        databases.includes(db) ? "border-primary" : "text-muted-foreground"
                      )}
                      onClick={() => toggleSelection(db, databases, setDatabases)}
                    >
                      {db}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Platforms & Tools</Label>
              <ScrollArea className="h-[240px] border rounded-md p-4 bg-background">
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((pl) => (
                    <Badge
                      key={pl}
                      variant={platforms.includes(pl) ? 'default' : 'outline'}
                      className={cn(
                        "cursor-pointer hover:bg-primary/90 transition-all",
                        platforms.includes(pl) ? "border-primary" : "text-muted-foreground"
                      )}
                      onClick={() => toggleSelection(pl, platforms, setPlatforms)}
                    >
                      {pl}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Soft Skills</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SOFT_SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={softSkills.includes(skill) ? 'default' : 'outline'}
                    className={cn(
                      "cursor-pointer transition-all",
                      softSkills.includes(skill) ? "border-primary" : "text-muted-foreground"
                    )}
                    onClick={() => toggleSelection(skill, softSkills, setSoftSkills)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label htmlFor="customSoftSkill">Add Custom Skill</Label>
              <div className="flex gap-2">
                <Input
                  id="customSoftSkill"
                  type="text"
                  placeholder="Enter a skill..."
                  value={customSoftSkill}
                  onChange={(e) => setCustomSoftSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSoftSkill()}
                  className="bg-background"
                />
                <Button type="button" variant="secondary" onClick={addCustomSoftSkill}>Add</Button>
              </div>
            </div>
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="salaryPackage">Annual Salary Package (USD)</Label>
              <Input
                id="salaryPackage"
                type="number"
                placeholder="e.g. 120000"
                value={salaryPackage}
                onChange={(e) => setSalaryPackage(e.target.value)}
                min="0"
                className="bg-background text-lg"
              />
              <p className="text-sm text-muted-foreground">Confidential. Used for aggregate benchmarking only.</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Stepper */}
      <div className="w-full md:w-64 lg:w-80 border-r border-border bg-muted/10 p-6 md:p-8 flex flex-col shrink-0">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
             <div className="h-6 w-6 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-xs">IQ</div>
             <h1 className="text-xl font-bold tracking-tight">Setup Profile</h1>
          </div>
          <p className="text-sm text-muted-foreground">Complete your profile to unlock personalized career insights.</p>
        </div>
        
        <nav className="space-y-1 relative">
          {/* Connecting Line (visual only, simplified) */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-border -z-10 hidden md:block" />

          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div 
                key={step.id} 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md transition-all duration-200",
                  isActive ? "bg-background shadow-sm border border-border" : "hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium transition-colors z-10 bg-background",
                  isActive ? "border-primary text-primary ring-2 ring-primary/20" : 
                  isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-sm font-medium truncate", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate hidden lg:block">
                    {step.description}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-[calc(100vh-theme(spacing.20))] md:h-screen overflow-y-auto">
         <div className="max-w-3xl mx-auto p-6 md:p-12 pb-24">
            {/* Step Header */}
            <div className="mb-8 pb-4 border-b border-border/50">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{STEPS[currentStep-1].title}</h2>
                <p className="text-muted-foreground mt-1">{STEPS[currentStep-1].description}</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step Form Content */}
            <div className="min-h-[300px]">
                {renderStep()}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between pt-8 mt-12 border-t border-border">
                 <Button 
                    variant="outline" 
                    onClick={handleBack} 
                    disabled={currentStep === 1}
                    className="w-24"
                 >
                    Back
                 </Button>
                 <Button 
                    onClick={handleNext}
                    className="min-w-[120px]"
                 >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (currentStep === STEPS.length ? 'Complete' : 'Next Step')}
                 </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
