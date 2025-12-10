# DevCareerIQ - AI-Powered Career Advancement Platform

DevCareerIQ is a comprehensive career development platform that provides personalized career insights, industry benchmarks, and AI-generated career advancement plans.

## Features

- 🎯 **Personalized Profile Setup** - Multi-step wizard to capture your career details
- 📊 **Industry Benchmarking** - Compare your profile against industry standards
- 🤖 **AI Career Planning** - Gemini AI-powered personalized career recommendations
- 📈 **Progress Tracking** - Track your career advancement goals
- 📄 **PDF Export** - Export your benchmark reports and career plans
- 🔐 **Secure Authentication** - Clerk-based authentication system

## Tech Stack

### Frontend
- Next.js 15.5
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Clerk Authentication
- jsPDF for PDF exports

### Backend
- FastAPI
- Python 3.9+
- MongoDB
- Pydantic v2
- Google Gemini AI API

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account
- Clerk account
- Google Gemini API key

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
DB_NAME=careeriq
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CLERK_ISSUER_URL=your_clerk_issuer_url
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=your_backend_url
```

### Installation

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment on Render

### Backend Deployment
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables from Backend .env section

### Frontend Deployment
1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Set root directory to `frontend`
4. Set build command: `npm install && npm run build`
5. Set publish directory: `.next`
6. Add environment variables from Frontend .env.local section

## Features in Detail

### Profile Setup
- 6-step wizard with visual progress indicator
- Captures: Personal info, education, work experience, skills, career goals, preferences

### Benchmark Reports
- Compensation quartile analysis
- Career progression scoring
- Skills gap assessment
- Position level comparison
- Industry data sources

### AI Career Plans
- Personalized recommendations
- Milestone tracking
- Priority-based action items
- Timeline planning
- Progress completion tracking

## License

MIT

## Author

Sarah - First coding project 🚀
