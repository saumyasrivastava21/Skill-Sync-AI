# SkillSync AI

> Full-Stack AI Resume Intelligence Platform for resume parsing, skill extraction, ATS scoring, job-role matching, RAG-style evidence retrieval, and AI-powered career recommendations.

---

## Overview

**SkillSync AI** is a production-style AI Resume Intelligence Platform built for candidates and recruiters.

It allows users to upload resumes, parse resume content, extract skills, compare resumes against job descriptions, calculate ATS-style scores, detect missing skills, retrieve resume-based evidence, and generate AI-powered recommendations.

The project is designed as a full-stack AI engineering system using:

- React + TypeScript frontend
- FastAPI backend
- PostgreSQL database
- Redis cache
- JWT authentication
- Docker-based infrastructure
- LangGraph AI workflow
- NVIDIA LLM integration
- Resume parsing and ATS intelligence layer

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- Recharts
- Framer Motion
- Lucide React

### Backend

- FastAPI
- Python
- Pydantic
- SQLAlchemy
- Alembic
- JWT Authentication
- Passlib password hashing
- Modular service architecture

### AI / LLM Layer

- LangChain
- LangGraph
- NVIDIA LLM API
- Resume skill extraction
- ATS scoring engine
- Resume chunking
- Evidence retrieval
- Missing-skill analysis
- Structured AI recommendations

### Database & Cache

- PostgreSQL
- Redis

### DevOps / MLOps

- Docker
- Docker Compose
- Environment-based configuration
- Health-check APIs
- Production-style project structure
- Future AWS deployment support

---

## System Architecture

```text
                         User
                          |
                          v
                React + TypeScript Frontend
                          |
                          v
                   Axios API Client
                          |
                          v
                 FastAPI Backend APIs
                          |
        -------------------------------------
        |                                   |
        v                                   v
 PostgreSQL Database                  Redis Cache
        |
        v
 Resume Storage + Metadata
        |
        v
 Resume Parser + Skill Extractor
        |
        v
 LangGraph ATS Intelligence Workflow
        |
        -------------------------------------
        |                 |                 |
        v                 v                 v
 ATS Scoring      Evidence Retrieval   NVIDIA LLM
        |                 |                 |
        -------------------------------------
                          |
                          v
        AI Recommendations + Skill Gap Report
````

---

## Core Features

### Authentication

* User registration
* User login
* JWT access token generation
* Current authenticated user API
* Password hashing with Passlib
* Protected routes using Bearer token authentication

### Resume Management

* Resume upload
* Resume metadata storage
* Resume list API
* Resume detail API
* Resume download API
* Resume delete API
* PDF text extraction
* Resume parsing status
* Extracted skills storage
* Word count tracking

### AI Resume Intelligence

* Job description input
* Resume vs job description matching
* ATS score generation
* Skill match score
* Keyword coverage score
* Resume quality score
* Matched skills detection
* Missing skills detection
* Extra resume skills detection
* Resume chunking
* RAG-style evidence retrieval
* LangGraph workflow execution
* NVIDIA LLM-based structured recommendations
* Previous reports history
* Report detail view
* Report delete support

### Frontend Dashboard

* Candidate dashboard
* API health status display
* Resume count display
* Latest ATS score display
* Average ATS score display
* Missing skills count
* Latest report summary
* Matched and missing skills preview
* Real backend-connected analytics
* Reports page with charts and recommendations
* Previous report history

---

## Current Progress

### Day 1 Completed

* React frontend foundation
* FastAPI backend foundation
* Docker Compose setup
* PostgreSQL service integrated
* Redis service integrated
* Backend health-check APIs
* Professional frontend UI shell
* Production-style project structure

### Day 2 Completed

* JWT authentication backend
* User registration API
* User login API
* Current user API
* Password hashing
* SQLAlchemy user model
* Alembic migration setup
* PostgreSQL users table
* Frontend login connected with FastAPI backend
* Bearer token authentication verified

### Day 3 Completed

* Resume upload backend API
* Resume metadata storage in PostgreSQL
* Resume list API
* Resume detail API
* Resume delete API
* Resume download API
* PDF text extraction
* Resume parsing service
* Skill extraction service
* Word count extraction
* Frontend resume upload page connected with backend
* Resume list and parsed status visible on frontend

### Day 4 Completed

* Added AI-powered ATS analysis module
* Created `analysis_reports` database table
* Added Alembic migration for analysis reports
* Built LangGraph-based resume-job matching workflow
* Added deterministic ATS scoring
* Added skill match score
* Added keyword coverage score
* Added resume quality score
* Added missing-skill detection
* Added matched-skill detection
* Added resume chunking service
* Added RAG-style evidence retrieval service
* Integrated NVIDIA LLM support for structured AI recommendations
* Added fallback report generation when LLM is unavailable
* Added report list, detail, delete, missing skills, recommendations, and evidence APIs
* Connected Reports frontend page with real backend APIs
* Replaced mock dashboard data with real resume and report analytics
* Added charts using Recharts
* Added LangGraph workflow trace UI
* Added previous reports section
* Fixed authentication, Docker, config, and TypeScript build issues
* Verified complete frontend-backend integration

---

## Backend API Flow

```text
Register User
     |
     v
Hash Password
     |
     v
Store User in PostgreSQL
     |
     v
Login User
     |
     v
Verify Password
     |
     v
Generate JWT Token
     |
     v
Frontend Stores Token
     |
     v
Authenticated API Requests
```

---

## Resume Intelligence Flow

```text
Upload Resume
     |
     v
Extract Text from PDF
     |
     v
Clean and Normalize Text
     |
     v
Extract Resume Skills
     |
     v
Input Job Description
     |
     v
Extract JD Skills
     |
     v
Run LangGraph ATS Workflow
     |
     v
Calculate ATS Score
     |
     v
Find Matched and Missing Skills
     |
     v
Chunk Resume Text
     |
     v
Retrieve Resume Evidence
     |
     v
Generate AI Recommendations
     |
     v
Store Analysis Report
```

---

## LangGraph ATS Workflow

```text
Start
  |
  v
Load Resume
  |
  v
Extract Job Description Skills
  |
  v
Calculate ATS Score
  |
  v
Chunk Resume Text
  |
  v
Retrieve Evidence
  |
  v
Generate NVIDIA LLM Report
  |
  v
Validate Output
  |
  v
Save Report
  |
  v
End
```

---

## Project Structure

```text
skillsync-ai/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── Dockerfile
│
├── spark_jobs/
│   └── day4_spark_basics.py
│
├── docker-compose.yml
├── README.md
└── .env.example
```

---

## Important Backend APIs

### Health Check

```http
GET /api/v1/health/
```

### Register User

```http
POST /api/v1/auth/register
```

### Login User

```http
POST /api/v1/auth/login
```

### Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Resume APIs

```http
POST /api/v1/resumes/upload
GET /api/v1/resumes
GET /api/v1/resumes/{resume_id}
GET /api/v1/resumes/{resume_id}/download
DELETE /api/v1/resumes/{resume_id}
```

### Report APIs

```http
POST /api/v1/reports/analyze
GET /api/v1/reports
GET /api/v1/reports/{report_id}
DELETE /api/v1/reports/{report_id}
GET /api/v1/reports/{report_id}/missing-skills
GET /api/v1/reports/{report_id}/recommendations
GET /api/v1/reports/{report_id}/evidence
```

---

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/saumyasrivastava21/Skill-Sync-AI.git
cd Skill-Sync-AI
```

---

### 2. Start Docker Services

```bash
docker compose up -d
```

This starts:

* FastAPI backend
* PostgreSQL database
* Redis cache

Backend runs at:

```text
http://127.0.0.1:8000
```

Swagger Docs:

```text
http://127.0.0.1:8000/docs
```

---

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## Environment Variables

Create `.env` inside the backend folder:

```env
PROJECT_NAME=SkillSync AI
ENVIRONMENT=development
API_V1_PREFIX=/api/v1

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=skillsync_db
POSTGRES_USER=skillsync_user
POSTGRES_PASSWORD=skillsync_password

REDIS_HOST=redis
REDIS_PORT=6379

SECRET_KEY=your_secret_key
ALGORITHM=HS256
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

UPLOAD_DIR=uploads/resumes
MAX_UPLOAD_MB=5
STORAGE_BACKEND=local

NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_MODEL=meta/llama-3.3-70b-instruct
```

---

## Frontend Routes

```text
/login
/register
/dashboard
/resumes
/reports
```

---

## Database Tables

```text
users
resumes
analysis_reports
alembic_version
```

---

## Analysis Report Data Stored

Each ATS report stores:

* User ID
* Resume ID
* Job title
* Company name
* Job description
* Resume skills
* Job description skills
* Matched skills
* Missing skills
* Extra skills
* ATS score
* Skill match score
* Keyword coverage score
* Resume quality score
* AI report summary
* Role readiness
* Improvement plan
* Interview focus
* Recommendations
* Evidence snippets
* LLM model
* LLM usage status
* LangGraph workflow trace

---

## Day 4 Demo Explanation

```text
In Day 4, I added the AI intelligence layer of SkillSync AI.

The platform now supports ATS analysis using a LangGraph workflow. It compares parsed resume skills with a job description, calculates ATS score, detects matched and missing skills, retrieves resume evidence, and generates structured AI recommendations using NVIDIA LLM support.

The complete flow is connected with FastAPI, PostgreSQL, Docker, React, TypeScript, and a real frontend dashboard.
```

---

## Interview-Level Explanation

SkillSync AI is a full-stack AI-powered resume intelligence platform built using React, TypeScript, FastAPI, PostgreSQL, Redis, Docker, JWT authentication, LangGraph, and NVIDIA LLM integration.

The frontend communicates with the FastAPI backend using Axios. The backend exposes REST APIs for authentication, resume upload, resume parsing, skill extraction, and ATS analysis. PostgreSQL stores users, resumes, parsed resume metadata, extracted skills, and AI-generated analysis reports. Redis is included for caching and future background task optimization.

The AI layer uses a LangGraph workflow to process job descriptions, compare them with parsed resumes, calculate ATS-style scores, identify missing skills, retrieve resume evidence, and generate structured recommendations. This makes the project closer to a production AI engineering system rather than a simple CRUD application.

The project follows a production-style architecture with modular backend services, database migrations, Docker-based infrastructure, real frontend-backend integration, protected APIs, and future-ready MLOps deployment support.

---

## Production Vision

SkillSync AI is designed as a production-level AI system.

Future production architecture:

```text
Frontend Dashboard
        |
FastAPI Backend
        |
PostgreSQL + Redis
        |
Resume Parser Service
        |
Skill Extraction Engine
        |
LangGraph Workflow
        |
Embedding / Vector Search Layer
        |
LLM Recommendation Engine
        |
MLflow Tracking
        |
Docker + AWS Deployment
```

---

## Future Roadmap

### Day 5 Planned

* Recruiter dashboard
* Candidate search by skills
* Report PDF export
* Downloadable ATS report
* Improved report explanation
* Role-based access polish
* Loading skeletons
* Better error states
* API test cases
* README screenshots
* Deployment preparation

### Future MLOps Roadmap

* Dockerize full frontend + backend production setup
* Add GitHub Actions CI/CD
* Add MLflow experiment tracking
* Add ChromaDB / FAISS for semantic resume search
* Add AWS S3 for resume storage
* Add AWS RDS for PostgreSQL
* Add AWS ECR for Docker images
* Deploy backend on AWS ECS / EC2
* Add monitoring with Prometheus and Grafana
* Add structured logging middleware
* Add production error handling
* Add background jobs with Celery or RQ
* Add email notifications
* Add recruiter analytics dashboard

---

## Current Status

```text
Day 1: Full-stack foundation completed
Day 2: JWT authentication completed
Day 3: Resume upload, parsing, CRUD, and frontend integration completed
Day 4: LangGraph ATS analysis, NVIDIA LLM recommendations, reports UI, and dashboard integration completed
```

---

## Author

**Saumya Srivastava**
Machine Learning Engineer | AI Engineer | Full-Stack AI Developer

---

## License

This project is for learning, portfolio, and production-level AI engineering practice.