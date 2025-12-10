export interface CareerProgression {
  date: string;
  title: string;
  company: string;
}

export interface Profile {
  profile_id: string;
  user_id: string;
  graduation_year: number | null;
  field_of_study: string;
  age: number | null;
  current_company: string;
  current_title: string;
  industry: string;
  technical_skills: string[];
  soft_skills: string[];
  career_progression: CareerProgression[];
  salary_package: number | null;
  created_date: string;
  last_modified_date: string;
  completion_percentage: number;

  // New Fields from Survey Data
  country: string | null;
  years_experience: number | null;
  dev_role: string | null;
  languages: string[];
  databases: string[];
  platforms: string[];
  frameworks: string[];
}

export const INDUSTRIES = [
  'Software Engineering',
  'Marketing',
  'Sales',
  'Product Management',
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Legal',
  'Real Estate',
  'Other',
];

export const SUGGESTED_SOFT_SKILLS = [
  'Leadership',
  'Communication',
  'Problem Solving',
  'Team Collaboration',
  'Critical Thinking',
  'Adaptability',
  'Time Management',
  'Negotiation',
  'Strategic Planning',
  'Conflict Resolution',
  'Emotional Intelligence',
  'Decision Making',
];

export const DEV_ROLES = [
  'AI/ML engineer',
  'Academic researcher',
  'Applied scientist',
  'Architect, software or solutions',
  'Cloud infrastructure engineer',
  'Cybersecurity or InfoSec professional',
  'Data engineer',
  'Data or business analyst',
  'Data scientist',
  'Database administrator or engineer',
  'DevOps engineer or professional',
  'Developer, AI apps or physical AI',
  'Developer, QA or test',
  'Developer, back-end',
  'Developer, desktop or enterprise applications',
  'Developer, embedded applications or devices',
  'Developer, front-end',
  'Developer, full-stack',
  'Developer, game or graphics',
  'Developer, mobile',
  'Engineering manager',
  'Financial analyst or engineer',
  'Founder, technology or otherwise',
  'Other (please specify):',
  'Product manager',
  'Project manager',
  'Retired',
  'Senior executive (C-suite, VP, etc.)',
  'Student',
  'Support engineer or analyst',
  'System administrator',
  'UX, Research Ops or UI design professional'
];

export const LANGUAGES = [
  'Ada',
  'Assembly',
  'Bash/Shell (all shells)',
  'C',
  'C#',
  'C++',
  'COBOL',
  'Dart',
  'Delphi',
  'Elixir',
  'Erlang',
  'F#',
  'Fortran',
  'GDScript',
  'Gleam',
  'Go',
  'Groovy',
  'HTML/CSS',
  'Java',
  'JavaScript',
  'Kotlin',
  'Lisp',
  'Lua',
  'MATLAB',
  'MicroPython',
  'Mojo',
  'OCaml',
  'PHP',
  'Perl',
  'PowerShell',
  'Prolog',
  'Python',
  'R',
  'Ruby',
  'Rust',
  'SQL',
  'Scala',
  'Swift',
  'TypeScript',
  'VBA',
  'Visual Basic (.Net)',
  'Zig'
];

export const DATABASES = [
  'Amazon Redshift',
  'BigQuery',
  'Cassandra',
  'Clickhouse',
  'Cloud Firestore',
  'Cockroachdb',
  'Cosmos DB',
  'Databricks SQL',
  'Datomic',
  'DuckDB',
  'Dynamodb',
  'Elasticsearch',
  'Firebase Realtime Database',
  'H2',
  'IBM DB2',
  'InfluxDB',
  'MariaDB',
  'Microsoft Access',
  'Microsoft SQL Server',
  'MongoDB',
  'MySQL',
  'Neo4J',
  'Oracle',
  'Pocketbase',
  'PostgreSQL',
  'Redis',
  'SQLite',
  'Snowflake',
  'Supabase',
  'Valkey'
];

export const PLATFORMS = [
  'APT',
  'Amazon Web Services (AWS)',
  'Ansible',
  'Bun',
  'Cargo',
  'Chocolatey',
  'Cloudflare',
  'Composer',
  'Datadog',
  'Digital Ocean',
  'Docker',
  'Firebase',
  'Google Cloud',
  'Gradle',
  'Heroku',
  'Homebrew',
  'IBM Cloud',
  'Kubernetes',
  'MSBuild',
  'Make',
  'Maven (build tool)',
  'Microsoft Azure',
  'Netlify',
  'New Relic',
  'Ninja',
  'NuGet',
  'Pacman',
  'Pip',
  'Podman',
  'Poetry',
  'Prometheus',
  'Railway',
  'Splunk',
  'Supabase',
  'Terraform',
  'Vercel',
  'Vite',
  'Webpack',
  'Yandex Cloud',
  'Yarn',
  'npm',
  'pnpm'
];

export const FRAMEWORKS = [
  'ASP.NET',
  'ASP.NET Core',
  'Angular',
  'AngularJS',
  'Astro',
  'Axum',
  'Blazor',
  'Deno',
  'Django',
  'Drupal',
  'Express',
  'FastAPI',
  'Fastify',
  'Flask',
  'Laravel',
  'NestJS',
  'Next.js',
  'Node.js',
  'Nuxt.js',
  'Phoenix',
  'React',
  'Ruby on Rails',
  'Spring Boot',
  'Svelte',
  'Symfony',
  'Vue.js',
  'WordPress',
  'jQuery'
];

export const COUNTRIES = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei Darussalam',
  'Bulgaria',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cape Verde',
  'Chile',
  'China',
  'Colombia',
  'Congo, Republic of the...',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Côte d\'Ivoire',
  'Democratic People\'s Republic of Korea',
  'Democratic Republic of the Congo',
  'Denmark',
  'Djibouti',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Estonia',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hong Kong (S.A.R.)',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran, Islamic Republic of...',
  'Iraq',
  'Ireland',
  'Isle of Man',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kosovo',
  'Kuwait',
  'Kyrgyzstan',
  'Lao People\'s Democratic Republic',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Libyan Arab Jamahiriya',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia, Federated States of...',
  'Moldova',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Nomadic',
  'North Korea',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Republic of Korea',
  'Republic of Moldova',
  'Republic of North Macedonia',
  'Romania',
  'Russian Federation',
  'Rwanda',
  'Saint Lucia',
  'San Marino',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Somalia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Swaziland',
  'Sweden',
  'Switzerland',
  'Syrian Arab Republic',
  'Taiwan',
  'Tajikistan',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom of Great Britain and Northern Ireland',
  'United Republic of Tanzania',
  'United States of America',
  'Uruguay',
  'Uzbekistan',
  'Venezuela, Bolivarian Republic of...',
  'Viet Nam',
  'Yemen',
  'Zambia',
  'Zimbabwe'
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const profileService = {
  createProfile: async (userId: string, data: Partial<Profile>): Promise<Profile> => {
    throw new Error("Use createProfileAsync with token");
  },

  createProfileAsync: async (token: string, data: Partial<Profile>): Promise<Profile> => {
    const response = await fetch(`${API_URL}/api/v1/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create profile');
    }

    const profile = await response.json();
    return mapBackendProfileToFrontend(profile);
  },
  
  getProfile: (userId: string): Profile | null => {
     return null;
  },

  getProfileAsync: async (token: string): Promise<Profile | null> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile = await response.json();
      return mapBackendProfileToFrontend(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },
  
  updateProfile: (userId: string, data: Partial<Profile>): Profile => {
     throw new Error("Use updateProfileAsync with token");
  },

  updateProfileAsync: async (token: string, data: Partial<Profile>): Promise<Profile> => {
    const response = await fetch(`${API_URL}/api/v1/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const profile = await response.json();
    return mapBackendProfileToFrontend(profile);
  },
  
  deleteProfile: (userId: string): void => {
    // Not implemented in backend yet
  },
};

function mapBackendProfileToFrontend(backendProfile: any): Profile {
  const profile: Profile = {
    profile_id: backendProfile.id || backendProfile._id,
    user_id: backendProfile.user_id,
    graduation_year: backendProfile.graduation_year,
    field_of_study: backendProfile.field_of_study,
    age: backendProfile.age,
    current_company: backendProfile.current_company,
    current_title: backendProfile.current_title,
    industry: backendProfile.industry,
    technical_skills: backendProfile.technical_skills || [],
    soft_skills: backendProfile.soft_skills || [],
    career_progression: backendProfile.career_progression || [],
    salary_package: backendProfile.salary_package,
    created_date: backendProfile.updated_at,
    last_modified_date: backendProfile.updated_at,
    completion_percentage: 0,
    
    // New fields
    country: backendProfile.country || null,
    years_experience: backendProfile.years_experience || null,
    dev_role: backendProfile.dev_role || null,
    languages: backendProfile.languages || [],
    databases: backendProfile.databases || [],
    platforms: backendProfile.platforms || [],
    frameworks: backendProfile.frameworks || []
  };
  
  profile.completion_percentage = calculateCompletionPercentage(profile);
  return profile;
}

function calculateCompletionPercentage(profile: Profile): number {
  let completed = 0;
  const total = 15; // Increased count for new fields (approximate)
  
  if (profile.graduation_year) completed++;
  if (profile.field_of_study) completed++;
  // if (profile.age) completed++; // Age might be less relevant now? Keeping it.
  if (profile.current_company) completed++;
  if (profile.current_title) completed++;
  if (profile.industry) completed++;
  if (profile.technical_skills.length > 0) completed++;
  if (profile.soft_skills.length > 0) completed++;
  if (profile.career_progression.length > 0) completed++;
  if (profile.salary_package) completed++;
  
  // New fields completion
  if (profile.country) completed++;
  if (profile.years_experience) completed++;
  if (profile.dev_role) completed++;
  if (profile.languages.length > 0) completed++;
  
  // Bonus/Extra
  if (profile.languages.length >= 2) completed++;
  if (profile.databases.length > 0 || profile.frameworks.length > 0) completed++;
  
  return Math.min(100, Math.round((completed / total) * 100));
}
