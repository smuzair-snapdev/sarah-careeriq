# PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY

**Product Vision:** A career intelligence platform for mid-career professionals (ages 30-50) that analyzes their current position through comprehensive skill and career metrics, benchmarks them against industry standards, and provides actionable, personalized career advancement plans based on real-time labour market research.

**Core Purpose:** Helps mid-career professionals understand where they stand in their industry, identify gaps holding them back, and receive concrete action plans to advance to higher compensation and position quartiles.

**Target Users:** Mid-career professionals aged 30-50 across various industries seeking data-driven career advancement guidance.

**Key Features:**
- Professional Profile Assessment (User-Generated Content) - Comprehensive skill and career data collection
- Industry Benchmark Report (System Data) - Comparative analysis showing user's position on industry curves
- Personalized Career Advancement Plan (User-Generated Content) - Actionable recommendations with progress tracking
- Labour Market Intelligence Integration (System Data) - Real-time insights from consultancy reports, workforce trends, and academic research

**Complexity Assessment:** Moderate
- **State Management:** Local (user profiles and progress tracking)
- **External Integrations:** Multiple data sources (reduces complexity - simple API calls)
- **Business Logic:** Moderate (benchmarking algorithms and recommendation generation)
- **Data Synchronization:** Basic (periodic updates from external sources)

**MVP Success Metrics:**
- Users can complete their professional profile assessment
- Users receive both benchmark and advancement plan reports
- Users can track progress on recommended actions
- System generates relevant recommendations based on user data

## 1. USERS & PERSONAS

**Primary Persona:**
- **Name:** Sarah Chen, 38-year-old Marketing Director
- **Context:** 15 years in marketing, feeling stagnant despite strong performance, unsure if compensation is competitive or what skills to develop next
- **Goals:** Understand market position, identify advancement opportunities, create actionable plan for next career move
- **Needs:** Data-driven insights, clear benchmarking, specific actionable steps, progress tracking

**Secondary Persona:**
- **Name:** Michael Rodriguez, 45-year-old Software Engineering Manager
- **Context:** Strong technical background but limited recent upskilling, concerned about AI disruption and career relevance
- **Goals:** Stay competitive in evolving tech landscape, understand compensation positioning, identify critical skills to develop
- **Needs:** Industry trend insights, skill gap analysis, concrete learning recommendations

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 User-Requested Features (All are Priority 0)

**FR-001: Professional Profile Assessment**
- **Description:** Comprehensive data collection system where users input their career metrics including education (graduation year, field), technical skills (programming languages, tools), demographics (age), current position (company, title, industry), career progression (promotions timeline), compensation (salary package), and soft skills
- **Entity Type:** User-Generated Content
- **User Benefit:** Creates foundation for personalized analysis and benchmarking
- **Primary User:** All mid-career professionals
- **Lifecycle Operations:**
  - **Create:** Users complete initial profile setup through guided form
  - **View:** Users can review their complete profile at any time
  - **Edit:** Users can update any profile information as their career evolves
  - **Delete:** Users can remove their profile (with data export option)
  - **List/Search:** Not applicable (single profile per user)
  - **Additional:** Export profile data, version history to track career progression over time
- **Acceptance Criteria:**
  - [ ] Given new user, when they complete profile setup, then all required fields are captured (graduation year, field, age, company, title, industry, salary, promotions timeline)
  - [ ] Given profile exists, when user views it, then all entered information is displayed in organized sections
  - [ ] Given profile exists, when user edits any field, then changes are saved and reflected immediately
  - [ ] Given profile exists, when user requests deletion, then confirmation is required and data export is offered
  - [ ] Users can add/remove technical skills from their profile
  - [ ] Users can add/remove soft skills from their profile
  - [ ] Profile completion percentage is shown to encourage complete data entry
  - [ ] Profile includes career progression timeline with promotion dates

**FR-002: Industry Benchmark Report Generation**
- **Description:** System generates comprehensive benchmark report showing where user stands compared to industry peers across multiple dimensions: compensation quartile, career progression speed, skill relevance, and position level relative to experience
- **Entity Type:** System Data (generated from user profile + market data)
- **User Benefit:** Provides clear understanding of competitive position in the market
- **Primary User:** All mid-career professionals
- **Lifecycle Operations:**
  - **Create:** Automatically generated when user completes profile or requests update
  - **View:** Users can view current and historical benchmark reports
  - **Edit:** Not allowed (system-generated data integrity)
  - **Delete:** Not allowed (archived for historical comparison)
  - **List/Search:** Users can browse their historical benchmark reports by date
  - **Additional:** Export report as PDF, compare reports over time, share anonymized version
- **Acceptance Criteria:**
  - [ ] Given complete profile, when user requests benchmark, then report is generated within 30 seconds
  - [ ] Given benchmark report, when user views it, then they see compensation quartile position (e.g., "You're in the 45th percentile")
  - [ ] Given benchmark report, when user views it, then they see career progression comparison (promotions vs. peers)
  - [ ] Given benchmark report, when user views it, then they see skill relevance scores
  - [ ] Given benchmark report, when user views it, then they see position level vs. years of experience
  - [ ] Users can view historical benchmark reports to track progress
  - [ ] Users can export benchmark report as PDF
  - [ ] Benchmark data is based on similar profiles (same industry, similar experience, similar role level)

**FR-003: Personalized Career Advancement Plan Generation**
- **Description:** System generates actionable career advancement plan with specific recommendations across three categories: compensation optimization (e.g., "Negotiate salary - peers earn 15% more"), skill development (e.g., "Learn Python - increases promotion probability by 23%"), and strategic growth areas (e.g., "Develop leadership skills - increasingly relevant in your industry")
- **Entity Type:** User-Generated Content (user can modify and track progress)
- **User Benefit:** Provides concrete, data-driven action steps to reach higher quartiles
- **Primary User:** All mid-career professionals
- **Lifecycle Operations:**
  - **Create:** Automatically generated based on benchmark analysis and market trends
  - **View:** Users can view current plan and all recommendations
  - **Edit:** Users can mark recommendations as completed, add notes, set priorities
  - **Delete:** Users can dismiss recommendations they don't want to pursue
  - **List/Search:** Users can filter recommendations by category, priority, or completion status
  - **Additional:** Track completion progress, regenerate plan based on profile updates, export plan
- **Acceptance Criteria:**
  - [ ] Given benchmark report, when plan is generated, then it includes minimum 5 actionable recommendations
  - [ ] Given advancement plan, when user views it, then recommendations are categorized (compensation, skills, strategic growth)
  - [ ] Given recommendation, when user views it, then it includes specific action, expected impact, and data source
  - [ ] Given recommendation, when user marks it complete, then progress is tracked and reflected in dashboard
  - [ ] Given recommendation, when user dismisses it, then it's removed from active plan but archived
  - [ ] Users can filter recommendations by category
  - [ ] Users can set priority levels for recommendations
  - [ ] Users can add personal notes to each recommendation
  - [ ] Plan shows overall completion percentage
  - [ ] Users can regenerate plan after profile updates

**FR-004: Labour Market Intelligence Integration**
- **Description:** System continuously ingests and processes labour market data from multiple sources (consultancy firm reports, workforce trend analyses, AI trend reports, academic papers, CEO insights from LinkedIn) to inform benchmark calculations and recommendation generation
- **Entity Type:** System Data (external data integration)
- **User Benefit:** Ensures recommendations are based on current, authoritative market intelligence
- **Primary User:** System (backend process) / All users benefit indirectly
- **Lifecycle Operations:**
  - **Create:** System automatically ingests new market data from configured sources
  - **View:** Users can see data sources and recency in reports
  - **Edit:** Not allowed (maintains data integrity)
  - **Delete:** Not allowed (archived for historical analysis)
  - **List/Search:** Users can browse insights by source, topic, or date
  - **Additional:** Data freshness indicators, source credibility ratings, trend visualization
- **Acceptance Criteria:**
  - [ ] Given new market data available, when system checks sources, then data is ingested within 24 hours
  - [ ] Given market data, when used in reports, then source and date are clearly cited
  - [ ] Given user viewing report, when they check data sources, then they see list of all sources used
  - [ ] Given market data, when it's older than 90 days, then freshness warning is displayed
  - [ ] System integrates data from minimum 5 different source types
  - [ ] Users can see which insights come from which sources
  - [ ] Data recency is displayed for each insight or recommendation

**FR-005: Progress Tracking Dashboard**
- **Description:** Central dashboard showing user's career advancement progress over time, including benchmark position changes, completed recommendations, skill development progress, and career trajectory visualization
- **Entity Type:** User-Generated Content (tracks user actions and progress)
- **User Benefit:** Provides motivation and clear visibility into career advancement journey
- **Primary User:** All mid-career professionals
- **Lifecycle Operations:**
  - **Create:** Automatically created when user completes first profile
  - **View:** Users can view dashboard at any time with various time ranges
  - **Edit:** Automatically updated as user completes actions; users can add milestones
  - **Delete:** Not allowed (historical data preservation)
  - **List/Search:** Users can filter progress by time period, category, or metric
  - **Additional:** Export progress report, share achievements, set goals
- **Acceptance Criteria:**
  - [ ] Given user profile, when dashboard loads, then it shows current benchmark position
  - [ ] Given completed recommendations, when dashboard loads, then completion percentage is displayed
  - [ ] Given historical data, when user views dashboard, then career trajectory chart is shown
  - [ ] Given progress over time, when user views dashboard, then quartile movement is visualized
  - [ ] Users can view progress over different time periods (30 days, 90 days, 1 year)
  - [ ] Dashboard shows upcoming recommended actions
  - [ ] Dashboard highlights recent achievements
  - [ ] Users can add custom career milestones to track

### 2.2 Essential Market Features

**FR-006: User Authentication**
- **Description:** Secure user login and session management to protect sensitive career and compensation data
- **Entity Type:** Configuration/System
- **User Benefit:** Protects confidential career information and personalizes experience
- **Primary User:** All personas
- **Lifecycle Operations:**
  - **Create:** Register new account with email verification
  - **View:** View profile information and account settings
  - **Edit:** Update email, password, notification preferences
  - **Delete:** Account deletion option with data export
  - **Additional:** Password reset, session management, two-factor authentication option
- **Acceptance Criteria:**
  - [ ] Given valid credentials, when user logs in, then access is granted to their profile
  - [ ] Given invalid credentials, when user attempts login, then access is denied with clear error
  - [ ] Users can reset forgotten passwords via email
  - [ ] Users can update their email address with verification
  - [ ] Users can delete their account with confirmation and data export option
  - [ ] Sessions expire after 30 days of inactivity
  - [ ] Users can enable two-factor authentication for additional security

## 3. USER WORKFLOWS

### 3.1 Primary Workflow: Complete Career Assessment and Receive Advancement Plan

**Trigger:** New user signs up or existing user wants to update their career plan

**Outcome:** User has complete understanding of their market position and actionable plan for advancement

**Steps:**
1. User creates account and logs in
2. System presents guided profile setup wizard
3. User enters education background (graduation year, field of study)
4. User enters demographic information (age)
5. User enters current position details (company, title, industry)
6. User enters technical skills (programming languages, tools, certifications)
7. User enters soft skills (leadership, communication, etc.)
8. User enters career progression history (promotion dates and titles)
9. User enters compensation information (salary package)
10. System validates all required fields are complete
11. System displays profile completion percentage
12. User submits completed profile
13. System processes profile data against labour market intelligence
14. System generates Industry Benchmark Report
15. User views benchmark report showing quartile positions across dimensions
16. System generates Personalized Career Advancement Plan
17. User views advancement plan with categorized recommendations
18. User reviews specific recommendations with impact data
19. User can mark recommendations as priorities or dismiss them
20. System displays Progress Tracking Dashboard
21. User sees their starting position and recommended next steps

**Alternative Paths:**
- If user exits during profile setup, progress is saved and they can resume later
- If user has incomplete profile, system prompts for missing critical fields before generating reports
- If market data is unavailable for specific industry/role combination, system provides general recommendations with disclaimer

### 3.2 Entity Management Workflows

**Professional Profile Management Workflow**

**Create Profile:**
1. User navigates to profile setup from dashboard
2. User clicks "Create Profile" or "Get Started"
3. System presents multi-step form with sections
4. User fills in education information
5. User fills in current position details
6. User adds technical skills from suggestions or custom entries
7. User adds soft skills from suggestions or custom entries
8. User enters career progression timeline
9. User enters compensation details
10. User reviews profile summary
11. User saves profile
12. System confirms creation and triggers benchmark generation

**Edit Profile:**
1. User navigates to "My Profile" from dashboard
2. User clicks "Edit Profile" button
3. System displays editable form with current data
4. User modifies any fields (new skills, updated title, salary change, etc.)
5. User saves changes
6. System confirms update
7. System prompts user to regenerate benchmark and plan with updated data

**Delete Profile:**
1. User navigates to account settings
2. User clicks "Delete Account"
3. System displays warning about data loss
4. System offers data export option
5. User confirms deletion
6. System removes profile and all associated data
7. System confirms deletion and logs user out

**View Profile:**
1. User navigates to "My Profile" from dashboard
2. System displays complete profile in organized sections
3. User can see profile completion percentage
4. User can see last updated date
5. User can access edit or export options

**Benchmark Report Management Workflow**

**Generate Report:**
1. System automatically generates report when profile is complete
2. User can manually trigger regeneration from dashboard
3. System analyzes profile against market data
4. System calculates quartile positions across dimensions
5. System generates visualizations and insights
6. System saves report with timestamp
7. System notifies user that report is ready

**View Report:**
1. User navigates to "Benchmark Report" from dashboard
2. System displays current report with visualizations
3. User sees compensation quartile position
4. User sees career progression comparison
5. User sees skill relevance scores
6. User sees position level vs. experience analysis
7. User can access detailed breakdowns for each dimension

**List/Search Historical Reports:**
1. User navigates to "Report History"
2. System displays list of all generated reports with dates
3. User can filter by date range
4. User can compare two reports side-by-side
5. User can see progress over time visualization

**Export Report:**
1. User views current benchmark report
2. User clicks "Export as PDF"
3. System generates formatted PDF document
4. System downloads PDF to user's device
5. User can share or save PDF externally

**Career Advancement Plan Management Workflow**

**Generate Plan:**
1. System automatically generates plan after benchmark report
2. System analyzes gaps between user's position and higher quartiles
3. System identifies specific recommendations from market data
4. System categorizes recommendations (compensation, skills, strategic)
5. System assigns impact scores to each recommendation
6. System saves plan with timestamp
7. System displays plan to user

**View Plan:**
1. User navigates to "My Career Plan" from dashboard
2. System displays all active recommendations
3. User sees recommendations grouped by category
4. User sees impact data and data sources for each recommendation
5. User sees overall completion progress
6. User can expand recommendations for detailed information

**Edit Plan (Mark Progress):**
1. User views career plan
2. User clicks checkbox next to completed recommendation
3. System marks recommendation as complete
4. System updates progress percentage
5. System updates dashboard with achievement
6. User can add notes about completion
7. System archives completed recommendation

**Delete Recommendation (Dismiss):**
1. User views specific recommendation
2. User clicks "Dismiss" or "Not Relevant"
3. System asks for optional feedback
4. User confirms dismissal
5. System removes from active plan
6. System archives dismissed recommendation
7. System updates plan view

**Filter/Search Recommendations:**
1. User navigates to career plan
2. User applies filters (category, priority, status)
3. System displays filtered recommendations
4. User can sort by impact, date added, or priority
5. User can search recommendations by keyword

**Progress Tracking Dashboard Management Workflow**

**View Dashboard:**
1. User logs in or navigates to home
2. System displays dashboard with key metrics
3. User sees current benchmark position
4. User sees completion progress on recommendations
5. User sees career trajectory visualization
6. User sees upcoming recommended actions
7. User sees recent achievements

**Filter Dashboard by Time Period:**
1. User views dashboard
2. User selects time range (30 days, 90 days, 1 year, all time)
3. System updates all visualizations for selected period
4. User sees progress changes over selected timeframe

**Add Custom Milestone:**
1. User navigates to dashboard
2. User clicks "Add Milestone"
3. User enters milestone description and date
4. User saves milestone
5. System adds milestone to career timeline
6. System displays milestone on dashboard

**Export Progress Report:**
1. User views dashboard
2. User clicks "Export Progress Report"
3. System generates comprehensive report with all metrics
4. System downloads report as PDF
5. User can share or save report

## 4. BUSINESS RULES

### Entity Lifecycle Rules

**Professional Profile (User-Generated Content):**
- **Who can create:** Any authenticated user (one profile per user)
- **Who can view:** Profile owner only
- **Who can edit:** Profile owner only
- **Who can delete:** Profile owner only (with confirmation)
- **What happens on deletion:** Hard delete with mandatory data export offer
- **Related data handling:** Cascade delete all reports, plans, and progress data

**Benchmark Report (System Data):**
- **Who can create:** System automatically (user can trigger regeneration)
- **Who can view:** Profile owner only
- **Who can edit:** No one (maintains data integrity)
- **Who can delete:** No one (archived for historical comparison)
- **What happens on deletion:** Not applicable (archive only)
- **Related data handling:** Linked to profile; archived when new report generated

**Career Advancement Plan (User-Generated Content):**
- **Who can create:** System automatically based on benchmark
- **Who can view:** Profile owner only
- **Who can edit:** Profile owner (mark complete, dismiss, add notes, set priorities)
- **Who can delete:** Profile owner can dismiss individual recommendations
- **What happens on deletion:** Soft delete (archived for historical tracking)
- **Related data handling:** Linked to profile and benchmark report

**Progress Data (User-Generated Content):**
- **Who can create:** System automatically tracks user actions
- **Who can view:** Profile owner only
- **Who can edit:** System automatically (user actions trigger updates)
- **Who can delete:** No one (historical data preservation)
- **What happens on deletion:** Not applicable (permanent record)
- **Related data handling:** Linked to profile; preserved even if recommendations dismissed

**Market Intelligence Data (System Data):**
- **Who can create:** System automatically from external sources
- **Who can view:** All users (in context of their reports)
- **Who can edit:** No one (maintains source integrity)
- **Who can delete:** No one (archived for historical analysis)
- **What happens on deletion:** Not applicable (archive only)
- **Related data handling:** Referenced by reports and plans; never deleted

### Access Control
- Users can only view their own profile, reports, plans, and progress data
- No user can view another user's data (privacy protection for sensitive career/compensation information)
- Administrators can view aggregated, anonymized data for system improvement
- Market intelligence data is accessible to all users but only in context of their personalized reports

### Data Rules

**Profile Validation:**
- Graduation year must be between 1980 and current year
- Age must be between 30 and 50 (target demographic)
- Current year minus graduation year must be ≥ age minus 26 (reasonable career start age)
- Salary must be positive number
- At least one technical skill or soft skill required
- Company and title are required fields
- Industry must be selected from predefined list

**Benchmark Calculation:**
- Minimum 50 comparable profiles required for reliable benchmarking
- Comparable profiles defined as: same industry, ±5 years experience, similar role level
- If insufficient comparable profiles, use broader industry benchmarks with disclaimer
- Quartile calculations updated monthly as new market data arrives
- Historical benchmarks preserved for trend analysis

**Recommendation Generation:**
- Minimum 5 recommendations per plan
- Maximum 15 recommendations per plan (avoid overwhelming user)
- Each recommendation must cite specific data source
- Impact scores calculated from market data correlations
- Recommendations prioritized by: impact potential, feasibility, time to result
- Recommendations refreshed when profile updated or every 90 days

**Progress Tracking:**
- Completion percentage = (completed recommendations / total active recommendations) × 100
- Career trajectory calculated from historical benchmark positions
- Milestones preserved permanently for career history
- Progress metrics updated in real-time as user actions occur

### Process Rules

**Profile Completion:**
- Users must complete minimum 80% of profile fields to generate benchmark
- System prompts for missing critical fields before report generation
- Profile completion percentage displayed prominently to encourage full data entry

**Report Generation:**
- Benchmark reports generated automatically on profile completion
- Users can manually trigger regeneration maximum once per 7 days
- Reports include data freshness indicators for all market intelligence used
- If market data older than 90 days, warning displayed with report

**Recommendation Lifecycle:**
- Recommendations remain active until marked complete or dismissed
- Completed recommendations archived but visible in history
- Dismissed recommendations archived separately with optional user feedback
- Users can "un-dismiss" recommendations within 30 days
- After 30 days, dismissed recommendations permanently archived

**Data Refresh:**
- Market intelligence data checked daily for updates
- User profiles can be updated anytime
- Benchmark recalculation triggered by profile updates
- Plan regeneration offered (not forced) when profile significantly changes

## 5. DATA REQUIREMENTS

### Core Entities

**User**
- **Type:** System/Configuration
- **Attributes:** user_id (identifier), email, password_hash, name, created_date, last_login_date, account_status, notification_preferences
- **Relationships:** has one Profile, has many BenchmarkReports, has one CareerPlan, has one ProgressTracker
- **Lifecycle:** Full CRUD with account deletion option
- **Retention:** User-initiated deletion with mandatory data export offer

**Profile**
- **Type:** User-Generated Content
- **Attributes:** profile_id (identifier), user_id (owner), graduation_year, field_of_study, age, current_company, current_title, industry, technical_skills (array), soft_skills (array), career_progression (array of {date, title, company}), salary_package, created_date, last_modified_date, completion_percentage
- **Relationships:** belongs to User, has many BenchmarkReports, has one CareerPlan
- **Lifecycle:** Full CRUD with cascade delete
- **Retention:** Deleted when user account deleted; historical versions preserved for 90 days

**BenchmarkReport**
- **Type:** System Data
- **Attributes:** report_id (identifier), profile_id, user_id, generation_date, compensation_quartile, career_progression_score, skill_relevance_scores (object), position_level_score, comparable_profiles_count, data_sources_used (array), report_data (JSON with detailed metrics), is_current (boolean)
- **Relationships:** belongs to Profile, belongs to User, references MarketIntelligence
- **Lifecycle:** Create and View only; archived when new report generated
- **Retention:** Archived permanently for historical comparison

**CareerPlan**
- **Type:** User-Generated Content
- **Attributes:** plan_id (identifier), profile_id, user_id, benchmark_report_id, generation_date, last_modified_date, recommendations (array of Recommendation objects), overall_completion_percentage
- **Relationships:** belongs to Profile, belongs to User, linked to BenchmarkReport
- **Lifecycle:** Create, View, Edit (mark progress, dismiss items); soft delete for dismissed items
- **Retention:** Active plan updated in place; historical versions archived

**Recommendation**
- **Type:** User-Generated Content (embedded in CareerPlan)
- **Attributes:** recommendation_id (identifier), category (compensation/skills/strategic), title, description, expected_impact, data_source, priority_level, status (active/completed/dismissed), user_notes, created_date, completed_date, dismissed_date
- **Relationships:** part of CareerPlan
- **Lifecycle:** Create, View, Edit (status, notes, priority); soft delete when dismissed
- **Retention:** Archived when dismissed or completed; preserved for historical analysis

**ProgressTracker**
- **Type:** User-Generated Content
- **Attributes:** tracker_id (identifier), user_id, profile_id, progress_events (array of {date, event_type, description, related_entity_id}), custom_milestones (array of {date, description}), created_date, last_updated_date
- **Relationships:** belongs to User, belongs to Profile
- **Lifecycle:** Create and automatic updates; View only for user; no delete
- **Retention:** Permanent historical record

**MarketIntelligence**
- **Type:** System Data
- **Attributes:** intelligence_id (identifier), source_type (consultancy/workforce_trends/ai_trends/academic/ceo_insights), source_name, publication_date, ingestion_date, content_summary, data_points (JSON), industry_tags (array), skill_tags (array), credibility_score, is_active (boolean)
- **Relationships:** referenced by BenchmarkReports and Recommendations
- **Lifecycle:** Create and View only; archived when superseded
- **Retention:** Archived after 2 years; active data retained indefinitely

**CustomMilestone**
- **Type:** User-Generated Content
- **Attributes:** milestone_id (identifier), user_id, description, milestone_date, created_date
- **Relationships:** belongs to User, tracked in ProgressTracker
- **Lifecycle:** Full CRUD
- **Retention:** Deleted only when user account deleted

### Audit Fields
All user-modifiable entities include:
- created_date (timestamp)
- last_modified_date (timestamp)
- modified_by (user_id)

## 6. INTEGRATION REQUIREMENTS

### External Systems

**Consultancy Firm Reports API**
- **Purpose:** Provides industry benchmark data, compensation trends, and workforce insights from major consulting firms
- **Data Exchange:** Periodic ingestion of published reports, industry statistics, compensation data
- **Frequency:** Weekly checks for new publications; immediate ingestion when available

**Workforce Trends Data Provider**
- **Purpose:** Supplies real-time labour market trends, hiring patterns, skill demand data
- **Data Exchange:** API calls to retrieve trending skills, industry growth rates, role demand metrics
- **Frequency:** Daily updates for trending data; weekly for comprehensive reports

**AI Trends Research Feed**
- **Purpose:** Provides insights on AI impact on various industries and roles, emerging AI skills
- **Data Exchange:** Ingestion of AI trend reports, skill relevance predictions, automation risk assessments
- **Frequency:** Weekly updates; immediate alerts for significant trend shifts

**Academic Research Database**
- **Purpose:** Supplies peer-reviewed research on career development, skill acquisition, compensation studies
- **Data Exchange:** API access to relevant academic papers, research findings, longitudinal studies
- **Frequency:** Monthly ingestion of new relevant publications

**LinkedIn CEO Insights Aggregator**
- **Purpose:** Provides leadership perspectives on industry trends, skill requirements, future of work
- **Data Exchange:** Curated insights from CEO posts, industry leader perspectives, company direction signals
- **Frequency:** Daily monitoring; weekly aggregation and analysis

**Data Quality Service**
- **Purpose:** Validates and normalizes data from multiple sources for consistency
- **Data Exchange:** Raw data sent for validation; cleaned, normalized data returned
- **Frequency:** Real-time processing as new data ingested

## 7. FUNCTIONAL VIEWS/AREAS

### Primary Views

**Dashboard (Landing Page after Login)**
- Core functionality: Central hub showing current benchmark position, progress summary, upcoming actions, recent achievements
- Key elements: Quartile position visualization, completion progress bar, career trajectory chart, quick access to reports and plan
- User actions: Navigate to detailed views, mark recommendations complete, view progress over time

**Profile Setup/Edit View**
- Core functionality: Comprehensive form for entering and updating all career metrics
- Key elements: Multi-section form (education, position, skills, progression, compensation), completion percentage indicator, save/cancel actions
- User actions: Enter/update profile data, add/remove skills, save changes, trigger report regeneration

**Benchmark Report View**
- Core functionality: Detailed visualization of user's position relative to industry peers
- Key elements: Quartile position charts, peer comparison tables, skill relevance scores, data source citations, historical comparison option
- User actions: View detailed breakdowns, compare with historical reports, export as PDF, navigate to advancement plan

**Career Advancement Plan View**
- Core functionality: Display of personalized recommendations with progress tracking
- Key elements: Categorized recommendations (compensation/skills/strategic), impact scores, data sources, completion checkboxes, priority indicators, filter/sort controls
- User actions: Mark recommendations complete, dismiss recommendations, add notes, set priorities, filter by category

**Progress Tracking View**
- Core functionality: Historical view of career advancement journey
- Key elements: Timeline visualization, quartile movement chart, completed recommendations list, custom milestones, achievement highlights
- User actions: View progress over different time periods, add custom milestones, export progress report

**Report History View**
- Core functionality: List and comparison of historical benchmark reports
- Key elements: Chronological list of reports, side-by-side comparison tool, trend visualization
- User actions: Select reports to view, compare two reports, see progress over time

**Account Settings View**
- Core functionality: User account management and preferences
- Key elements: Email/password update, notification preferences, data export, account deletion
- User actions: Update account details, configure notifications, export data, delete account

### Modal/Overlay Needs

**Profile Completion Prompt**
- Appears when user tries to generate report with incomplete profile
- Shows missing required fields
- Provides quick access to complete those fields

**Recommendation Detail Modal**
- Displays full details of a specific recommendation
- Shows impact data, methodology, data sources
- Allows marking complete, dismissing, or adding notes

**Report Regeneration Confirmation**
- Appears when user triggers manual report regeneration
- Explains that new report will be generated based on current profile
- Confirms user wants to proceed

**Account Deletion Confirmation**
- Multi-step confirmation for account deletion
- Offers data export before deletion
- Requires explicit confirmation of data loss understanding

**Milestone Creation Modal**
- Simple form to add custom career milestone
- Date picker and description field
- Save/cancel actions

**Recommendation Dismissal Feedback**
- Optional feedback form when user dismisses recommendation
- Helps improve future recommendations
- Can be skipped

### Navigation Structure

**Persistent Access (Main Navigation):**
- Dashboard (home icon)
- My Profile
- Benchmark Report
- Career Plan
- Progress Tracking
- Account Settings

**Default Landing:**
- Dashboard for returning users
- Profile setup wizard for new users

**Entity Management Navigation:**
- Profile: Edit button on profile view → Edit form → Save returns to view
- Reports: Report History link → List view → Select report → Detail view
- Plan: Career Plan view shows all recommendations → Click recommendation → Detail modal
- Progress: Progress Tracking view → Filter by time period → Detailed timeline

**Contextual Navigation:**
- From Dashboard: Quick links to incomplete profile sections, active recommendations, latest report
- From Benchmark Report: "View Career Plan" button to see recommendations
- From Career Plan: "View Benchmark Report" button to see analysis
- From Profile Edit: "Regenerate Reports" button after saving changes

## 8. MVP SCOPE & CONSTRAINTS

### 8.1 MVP Success Definition
- Mid-career professionals can complete comprehensive profile assessment
- Users receive both industry benchmark report and personalized career advancement plan
- Users can track progress on recommended actions with completion checkboxes
- System generates relevant, data-driven recommendations based on market intelligence
- All entity lifecycles function completely per type (profiles editable, reports viewable, plans trackable)
- Basic features work reliably for target user base

### 8.2 Technical Constraints for MVP
- **Expected concurrent users:** 100-500 mid-career professionals
- **Data volume limits:** Up to 10,000 user profiles, 50,000 benchmark reports, 100,000 recommendations
- **Performance:** Report generation within 30 seconds, dashboard loads within 2 seconds
- **Market data refresh:** Daily checks acceptable for MVP; real-time not required
- **Historical data retention:** Minimum 1 year of historical reports and progress data

### 8.3 Explicitly Excluded from MVP

**Advanced Analytics & Predictions**
- **Description:** Machine learning models for career trajectory prediction, personalized success probability scores
- **Reason for Deferral:** Requires significant training data and complex ML infrastructure; basic benchmarking and recommendations provide sufficient value for MVP validation

**Social/Collaborative Features**
- **Description:** Peer networking, mentor matching, discussion forums, success story sharing
- **Reason for Deferral:** Not essential for core value proposition of individual career assessment and planning; adds complexity to moderation and community management

**Mobile Native Applications**
- **Description:** iOS and Android native apps with offline functionality
- **Reason for Deferral:** Web application provides excellent mobile experience through responsive design; native apps add development complexity without essential value for MVP

**Advanced Skill Assessment Tools**
- **Description:** Interactive skill tests, coding challenges, soft skill assessments, 360-degree feedback integration
- **Reason for Deferral:** Self-reported skills sufficient for MVP benchmarking; automated assessment adds significant complexity and requires validation

**Real-time Market Data Streaming**
- **Description:** Live updates of market trends, instant notification of relevant opportunities, real-time compensation tracking
- **Reason for Deferral:** Daily/weekly data updates sufficient for career planning timeframes; real-time adds infrastructure complexity without proportional value

**Multi-language Support**
- **Description:** Interface and reports in multiple languages for global professionals
- **Reason for Deferral:** English-first approach sufficient for MVP market validation; localization adds significant complexity

**Advanced Visualization & Reporting**
- **Description:** Interactive 3D charts, customizable dashboard widgets, advanced data exploration tools
- **Reason for Deferral:** Standard charts and visualizations sufficient for conveying benchmark and plan information; advanced viz is enhancement not core requirement

**Integration with HR Systems**
- **Description:** Direct integration with company HRIS, performance management systems, learning platforms
- **Reason for Deferral:** Individual user focus for MVP; enterprise integrations add complexity and sales cycle length

**Gamification & Rewards**
- **Description:** Achievement badges, leaderboards, point systems, career advancement challenges
- **Reason for Deferral:** Nice-to-have engagement feature; core value is in insights and recommendations, not gamification

**Video Content & Courses**
- **Description:** Embedded learning videos, skill development courses, expert webinars
- **Reason for Deferral:** Recommendations can link to external learning resources; creating/hosting content adds significant complexity and cost

### 8.4 Post-MVP Roadmap Preview

**Phase 2 (Months 3-6):**
- Advanced skill assessment tools with interactive tests
- Enhanced visualization with customizable dashboards
- Mobile native applications for iOS and Android
- Social features: peer networking and mentor matching

**Phase 3 (Months 6-12):**
- Machine learning-based career trajectory predictions
- Real-time market data streaming and alerts
- Integration with popular learning platforms
- Multi-language support for global expansion

**Phase 4 (Year 2+):**
- Enterprise features and HR system integrations
- Video content library and skill development courses
- Advanced analytics and predictive modeling
- Gamification and engagement features

## 9. ASSUMPTIONS & DECISIONS

### Business Model
- **Freemium Model:** Basic profile and single benchmark report free; advanced features (unlimited reports, detailed recommendations, progress tracking) require subscription
- **Subscription Tiers:** Individual ($29/month), Professional ($49/month with advanced analytics), Enterprise (custom pricing for company-wide access)
- **Revenue Focus:** Individual subscriptions for MVP; enterprise sales deferred to post-MVP

### Access Model
- **Individual Access:** Each user has private, isolated account with their own data
- **No Data Sharing:** User data never shared or visible to other users (privacy-first approach for sensitive career/compensation information)
- **Anonymized Aggregation:** System uses anonymized, aggregated data for benchmarking calculations only

### Entity Lifecycle Decisions

**Profile (User-Generated Content):**
- **Decision:** Full CRUD with cascade delete
- **Reason:** Users need complete control over their sensitive career data; ability to update as career evolves is essential; deletion must be thorough for privacy compliance

**Benchmark Report (System Data):**
- **Decision:** Create and View only; no edit or delete (archive only)
- **Reason:** Maintains data integrity and historical accuracy; users need to see career progression over time; reports are system-generated and should not be manually altered

**Career Plan (User-Generated Content):**
- **Decision:** Create, View, Edit (progress tracking); soft delete for dismissed items
- **Reason:** Users need to interact with plan (mark complete, dismiss); historical tracking of what was recommended and user's response is valuable for system improvement

**Progress Data (User-Generated Content):**
- **Decision:** Create and automatic updates; View only; no delete
- **Reason:** Historical record of career advancement journey; permanent preservation enables long-term trend analysis and user motivation

**Market Intelligence (System Data):**
- **Decision:** Create and View only; archive when superseded
- **Reason:** Maintains source data integrity; historical market data valuable for trend analysis; never deleted to preserve audit trail

### From User's Product Idea

**Product:** Career intelligence platform for mid-career professionals that analyzes current skills and position, benchmarks against industry standards, and provides personalized career advancement plans based on labour market research

**Technical Level:** Not specified; assuming non-technical mid-career professionals as primary users

### Key Assumptions Made

**Market Data Availability:**
- **Assumption:** Sufficient publicly available market data from consultancy reports, academic research, and LinkedIn insights to generate meaningful benchmarks
- **Reasoning:** Large consulting firms regularly publish industry reports; academic research on career development is extensive; LinkedIn provides rich professional insights

**User Willingness to Share Sensitive Data:**
- **Assumption:** Mid-career professionals will provide accurate salary and career progression data in exchange for valuable insights
- **Reasoning:** Privacy-first approach with no data sharing builds trust; value proposition of personalized insights justifies data sharing

**Benchmark Accuracy with Limited Data:**
- **Assumption:** Meaningful benchmarks can be generated with minimum 50 comparable profiles per industry/role combination
- **Reasoning:** Statistical significance achieved with 50+ samples; broader industry benchmarks used when specific role data insufficient

**Self-Reported Skill Accuracy:**
- **Assumption:** Users can accurately self-assess their technical and soft skills for MVP purposes
- **Reasoning:** Mid-career professionals have sufficient self-awareness; automated assessment deferred to post-MVP

**Career Planning Timeframe:**
- **Assumption:** Career advancement plans operate on 3-6 month timeframes, not requiring real-time data
- **Reasoning:** Career changes (promotions, skill development, salary negotiations) occur over months, not days; daily/weekly data updates sufficient

**Target Market Size:**
- **Assumption:** Sufficient market of mid-career professionals (30-50 years old) actively seeking career advancement guidance
- **Reasoning:** Large demographic cohort; career plateau common in mid-career; data-driven approach differentiates from generic career advice

**Recommendation Actionability:**
- **Assumption:** Users can act on recommendations independently without requiring platform-provided resources (courses, job boards, etc.)
- **Reasoning:** Recommendations link to external resources; mid-career professionals have resources to pursue development independently

### Questions Asked & Answers

**Q1: How should the system analyze a user's current skill set and strengths?**
**A:** By the user sharing certain metrics: graduation year, area of graduation, technical skills (programming languages, tools), age, company and title, industry, career progression (promotions timeline), salary package, and soft skills.

**Q2: What does a "tailored career plan" look like in your vision?**
**A:** Two reports: (1) Industry benchmark showing where user lies on the curve, (2) Plan on how to reach higher quartile (e.g., negotiate salary because peers earn more, learn skill that increases promotion probability, insights on growing relevant areas).

**Q3: How should users interact with their career plan once it's generated?**
**A:** They can tick off boxes of things recommended to them (progress tracking through completion checkboxes).

**Q4: What labour market research data should inform the career plans?**
**A:** Industry reports from large consultancy firms, workforce trends, AI trends, academic papers, CEO insights from LinkedIn.

**Q5: Who is the typical mid-career professional you're targeting?**
**A:** 30-50 year olds.

---

PRD Complete - Ready for development