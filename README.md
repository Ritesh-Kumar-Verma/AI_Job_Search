# AI-Powered Job Tracker

An intelligent job hunting platform with AI resume matching, smart filters, and conversational AI assistant(Currently Under Development).

Frontend repo link : https://github.com/Ritesh-Kumar-Verma/AI_Job_Search
Backend repo link : https://github.com/Ritesh-Kumar-Verma/AI-Job-Matcher

## Features

✅ **Authentication System**
- User signup/login with JWT
- Test credentials: `test@gmail.com` / `test@123` (Create new account, this test id is removed)

✅ **Resume Management**
- PDF and TXT file uploads
- Automatic skill extraction
- Resume updates anytime

✅ **Job Feed with Smart Filters**
- Role/Title search
- Skills multi-select
- Date posted filters (24h, 1 week, 1 month, all-time)
- Job type filters (Full-time, Part-time, Contract, Internship)
- Work mode filters (Remote, Hybrid, On-site)
- Location search
- Match score filters (High >70%, Medium 40-70%, All)

✅ **AI Resume Matching**
- Automatic match score calculation
- Skill-based matching algorithm
- Keyword relevance analysis

✅ **Application Tracking**
- Track all job applications
- Update application status (Applied, In-progress, Accepted, Rejected)
- View match scores for each application

✅ **Conversational AI Assistant**
- Real-time chat with AI job hunting assistant
- Natural language filter suggestions
- Career advice and application tips
- Resume improvement suggestions

## Architecture

### Backend (Spring Boot)
```
backend/
├── pom.xml (or build.gradle)       # Equivalent to package.json
├── src/
│   ├── main/
│   │   ├── java/com/AI_Job_Matcher/v2/  # Root Package
│   │   │   ├── config/             # Database & Security configurations
│   │   │   ├── controller/         # Request handlers (@RestController)
│   │   │   ├── exception/          # Global error handling
│   │   │   ├── model/              # MongoDB Documents (@Document)
│   │   │   ├── repository/         # Data access layer (Spring Data Mongo)
│   │   │   └── service/            # Business logic
│   │   └── resources/
│   │       └── application.properties # Database URI and app settings
│   └── test/                       # Unit and integration tests
└── .gitignore
```

### Frontend (React)
```
frontend/
├── src/
│   ├── assets/        # UI Image 
│   ├── components/    # UI components
│   ├── pages/         # Page components
│   ├── context/       # React context
│   ├── services/      # API clients
│   └── styles/        # CSS styling
└── package.json
```

## Setup Instructions

### Prerequisites
- Java 21
- Gemini API key
- GROQ API key
- Adzuna API credentials 

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires token)

### Resume
- `POST /api/resume/upload` - Upload resume (multipart form)
- `GET /api/resume` - Get user's resume

### Jobs
- `GET /api/jobs` - Get filtered jobs
- `POST /api/jobs/fetch` - Fetch fresh jobs from Adzuna
- `POST /api/jobs/search` - Search jobs by criteria

### Applications
- `POST /api/applications/apply` - Apply for a job
- `GET /api/applications` - Get user's applications
- `PUT /api/applications/:id/status` - Update application status

### AI Assistant /*********/
- `POST /api/ai/chat` - Send message to AI assistant(Under Development)

## Usage Guide

### First Time User
1. Sign up with email and password
2. Go to Resume page and upload your resume (PDF or TXT)
3. Return to Dashboard
4. Browse jobs in Job Feed
5. Use filters  for personalized recommendations
6. Apply to jobs - match scores automatically generated
7. Track applications and update status in Applications page


### Using the AI Assistant
Click the 🤖 button in bottom-right corner to chat with AI. Examples:
- "Show me remote Python developer jobs"
- "What skills should I add to my resume?"
- "Tell me about React positions in London"
- "How can I improve my chances of getting hired?"

## Key Technologies

**Backend:**
- Spring Boot - RESTful API development
- JWT - Authentication
- Gemini - AI assistant
- GROQ - AI assistant
- PostgreSQL - NoSQL database  

**Frontend:**
- React - UI library
- React Router - Navigation
- Axios - API client
- Tailwind CSS - Styling

## Match Score Algorithm

The system calculates job match scores based on:
1. **Skill Matching (40%)** - Resume skills found in job description
2. **Keyword Matching (30%)** - Experience/requirement keywords match
3. **Title Relevance (30%)** - Job title words appear in resume

Scores range from 0-100:
- 🟢 High: >70%
- 🟡 Medium: 40-70%
- 🔴 Low: <40%

## Features Implemented

### Core Requirements ✅
- [x] Job feed with all required filters
- [x] Resume upload (PDF/TXT)
- [x] User authentication with test account
- [x] Job type filters (Full-time, Part-time, Contract, Internship)
- [x] Work mode filters (Remote, Hybrid, On-site)
- [x] Date posted filters
- [x] Location search
- [x] Match score display and filtering
- [x] Application tracking with status updates
- [x] Conversational AI assistant
- [x] Smart AI-based filter suggestions

### Advanced Features ✅
- [x] Skill extraction from resume
- [x] AI-powered match algorithm
- [x] Real-time filter suggestions from chat
- [x] Application history and tracking
- [x] Resume text extraction
- [x] Match score calculation for applications
- [x] Persistent authentication with JWT
- [x] Responsive UI design

**AI-Powered Job Tracker v2.0**
