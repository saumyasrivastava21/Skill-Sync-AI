
# SkillSync AI

> Full-Stack AI Resume Intelligence Platform for resume parsing, skill extraction, job-role matching, ATS scoring, and career recommendations.

---

## Overview

**SkillSync AI** is a production-style AI platform that helps candidates and recruiters analyze resumes intelligently.

The platform allows users to register, log in securely, upload resumes, extract resume text, identify technical skills, manage resume history, and prepare for future ATS-style job matching and AI-powered career recommendations.

This project is being built as a full-stack AI engineering system using a modern production-ready architecture.

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
- Framer Motion
- Lucide React Icons

### Backend

- FastAPI
- Python
- Pydantic
- SQLAlchemy
- Alembic
- JWT Authentication
- Passlib password hashing
- Python Multipart
- PyMuPDF
- python-docx

### Database & Cache

- PostgreSQL
- Redis

### DevOps / MLOps

- Docker
- Docker Compose
- Environment-based configuration
- Health-check APIs
- Database migrations
- Production-style folder structure
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
 Resume Metadata + Parsed Resume Data
        |
        v
 AI / ML Resume Intelligence Layer
        |
        v
 Resume Parsing | Skill Extraction | ATS Score
 Job Matching   | Gap Analysis     | Recommendations
````

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
* Frontend routing and protected layout foundation

### Day 2 Completed

* JWT authentication backend
* User registration API
* User login API
* Current authenticated user API
* Password hashing
* SQLAlchemy user model
* Alembic migration setup
* PostgreSQL users table
* Frontend login connected with FastAPI backend
* Bearer token authentication verified
* Axios request interceptor added for authenticated APIs

### Day 3 Completed

* Authenticated resume upload API
* Resume metadata storage in PostgreSQL
* Resume model and schema added
* Alembic migration for resumes table
* PDF, DOCX, and TXT upload support
* File validation for type and size
* Local file storage system
* Background resume parsing using FastAPI BackgroundTasks
* Resume text extraction using PyMuPDF and python-docx
* Skill extraction engine added
* Resume word count extraction
* Resume listing API with pagination and search
* Resume detail API
* Resume download API
* Resume delete API
* React resume upload page connected with real FastAPI backend
* Upload progress UI added
* Resume status tracking added
* Download and delete actions connected from frontend
* Full frontend-backend-database workflow verified using Dockerized PostgreSQL

---

## Core Features

### Completed

* Full-stack project setup
* Backend health APIs
* PostgreSQL database connection
* Redis service connection
* JWT-based authentication
* Register user API
* Login user API
* Get current authenticated user API
* Frontend login integration
* Authenticated resume upload
* Resume metadata persistence
* Resume parsing
* Skill extraction
* Resume listing
* Resume search
* Resume download
* Resume delete
* Upload status tracking

### Upcoming

* Job description upload/input
* Resume vs job description matching
* ATS score generation
* Missing skills analysis
* AI-powered resume improvement suggestions
* Career recommendation engine
* Reports dashboard
* Recruiter candidate search
* Semantic resume search
* Vector database integration
* MLflow experiment tracking
* AWS S3 resume storage
* Dockerized production deployment
* CI/CD pipeline

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

## Resume Upload Flow

```text
Candidate Login
     |
     v
JWT Token Stored in Frontend
     |
     v
Upload Resume from React UI
     |
     v
FastAPI Receives UploadFile
     |
     v
Validate File Type and Size
     |
     v
Store File Locally
     |
     v
Save Resume Metadata in PostgreSQL
     |
     v
Run Background Parser
     |
     v
Extract Text from PDF / DOCX / TXT
     |
     v
Clean and Normalize Text
     |
     v
Extract Technical Skills
     |
     v
Update Resume Status as Parsed
     |
     v
Show Resume in Frontend Dashboard
```

---

## Resume Intelligence Flow

```text
Upload Resume
     |
     v
Extract Text
     |
     v
Clean and Normalize Text
     |
     v
Extract Skills
     |
     v
Compare with Job Description
     |
     v
Generate ATS Score
     |
     v
Find Missing Skills
     |
     v
Recommend Learning Path
```

---

## Project Structure

```text
skillsync-ai/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
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
│   ├── uploads/
│   │   └── resumes/
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/
├── docker-compose.yml
├── README.md
├── .gitignore
└── .env.example
```

---

## Local Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd skillsync-ai
```

---

### 2. Start Infrastructure

```bash
docker compose up -d postgres redis
```

Or start the full Docker setup:

```bash
docker compose up --build -d
```

---

### 3. Run Backend Locally

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

Swagger Docs:

```text
http://127.0.0.1:8000/docs
```

---

### 4. Run Frontend Locally

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

## Docker Setup

Start backend, frontend, PostgreSQL, and Redis:

```bash
docker compose up --build -d
```

Check running containers:

```bash
docker compose ps
```

View backend logs:

```bash
docker compose logs backend --tail 100
```

Stop all services:

```bash
docker compose down
```

---

## Database Migration

Generate migration:

```bash
docker compose exec backend alembic revision --autogenerate -m "init users and resumes tables"
```

Apply migration:

```bash
docker compose exec backend alembic upgrade head
```

Check PostgreSQL tables:

```bash
docker exec -it skillsync-postgres psql -U skillsync_user -d skillsync_db
```

Inside psql:

```sql
\dt
SELECT id, email, role FROM users;
SELECT id, original_file_name, status, word_count, extracted_skills FROM resumes;
\q
```

---

## Important APIs

### Health Check

```http
GET /api/v1/health/
```

### Dependency Health Check

```http
GET /api/v1/health/dependencies
```

### Register User

```http
POST /api/v1/auth/register
```

Example body:

```json
{
  "name": "Saumya Srivastava",
  "email": "saumya@example.com",
  "password": "password123",
  "role": "candidate"
}
```

### Login User

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "saumya@example.com",
  "password": "password123"
}
```

### Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Upload Resume

```http
POST /api/v1/resumes/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### List Resumes

```http
GET /api/v1/resumes?page=1&page_size=10
Authorization: Bearer <token>
```

### Search Resumes

```http
GET /api/v1/resumes?page=1&page_size=10&search=python
Authorization: Bearer <token>
```

### Get Resume Detail

```http
GET /api/v1/resumes/{resume_id}
Authorization: Bearer <token>
```

### Download Resume

```http
GET /api/v1/resumes/{resume_id}/download
Authorization: Bearer <token>
```

### Delete Resume

```http
DELETE /api/v1/resumes/{resume_id}
Authorization: Bearer <token>
```

---

## Environment Variables

Create `.env` in the project root for Docker-based setup:

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

JWT_SECRET_KEY=change_this_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

UPLOAD_DIR=uploads/resumes
MAX_UPLOAD_MB=5
STORAGE_BACKEND=local
```

For local backend without Docker, use:

```env
PROJECT_NAME=SkillSync AI
ENVIRONMENT=development
API_V1_PREFIX=/api/v1

POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=skillsync_db
POSTGRES_USER=skillsync_user
POSTGRES_PASSWORD=skillsync_password

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET_KEY=change_this_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

UPLOAD_DIR=uploads/resumes
MAX_UPLOAD_MB=5
STORAGE_BACKEND=local
```

---

## Verified Working Flow

```text
1. Start PostgreSQL, Redis, and FastAPI backend
2. Open Swagger docs at http://127.0.0.1:8000/docs
3. Register a candidate user
4. Login from React frontend
5. JWT token is saved in localStorage
6. Frontend sends authenticated API requests using Axios interceptor
7. Candidate uploads resume from frontend
8. Backend stores file and metadata
9. Background parser extracts resume text
10. Backend extracts technical skills
11. Resume status becomes parsed
12. Frontend displays parsed resume, word count, and extracted skills
13. Download and delete actions work from UI
```

---

## Example Extracted Skills

```text
Python
FastAPI
Docker
PostgreSQL
Redis
React
Redux
TypeScript
AWS
S3
EC2
Apache Spark
Solr
Machine Learning
Deep Learning
Computer Vision
NLP
PyTorch
TensorFlow
```

---

## Production Vision

SkillSync AI is designed as a production-level AI system, not just a basic CRUD app.

Future production components:

```text
Frontend Dashboard
        |
FastAPI Backend
        |
PostgreSQL + Redis
        |
Resume Parser Service
        |
Embedding Service
        |
Vector Database
        |
LLM Recommendation Engine
        |
MLflow Tracking
        |
Docker + AWS Deployment
        |
Monitoring + CI/CD
```

---

## Future MLOps Roadmap

* Dockerize frontend and backend
* Add GitHub Actions CI/CD
* Add MLflow for experiment tracking
* Add ChromaDB / FAISS for semantic resume search
* Add AWS S3 for resume storage
* Add AWS RDS for PostgreSQL
* Add AWS ECR for Docker images
* Deploy backend on AWS ECS / EC2
* Add Redis Queue / Celery for async processing
* Add monitoring with Prometheus and Grafana
* Add centralized logging
* Add production error handling
* Add API rate limiting
* Add model evaluation pipeline

---

## Interview-Level Explanation

SkillSync AI is a full-stack AI-powered resume intelligence platform built using React, TypeScript, FastAPI, PostgreSQL, Redis, Docker, and JWT authentication.

The frontend communicates with the FastAPI backend using Axios. The backend exposes REST APIs for authentication, resume upload, resume parsing, skill extraction, and future job matching. PostgreSQL stores users, resumes, metadata, parsed text, extracted skills, and future analysis results. Redis is integrated for caching and future background task optimization.

The resume upload system uses authenticated APIs. A candidate uploads a PDF, DOCX, or TXT file from the React frontend. FastAPI validates the file, stores it locally, saves metadata in PostgreSQL, and runs a background parsing task. The parser extracts text, cleans it, calculates word count, identifies technical skills, and updates the resume status.

The AI layer will compare resumes with job descriptions, calculate ATS scores, identify missing skills, and generate personalized career recommendations.

The project follows production-style engineering practices such as modular backend services, schema validation, database migrations, Docker-based infrastructure, environment configuration, JWT security, logging middleware, and future MLOps deployment support.

---

## Current Status

```text
Day 1: Full-stack foundation completed
Day 2: JWT authentication completed
Day 3: Resume upload, parsing, CRUD APIs, and frontend integration completed
Day 4: AI Resume Intelligence / ATS Analyzer planned
```

---

## Author

**Saumya Srivastava**

Machine Learning Engineer | AI Engineer | Full-Stack AI Developer

---

## License

This project is for learning, portfolio, and production-level AI engineering practice.

````

After paste:

```powershell
git add README.md
git commit -m "Update README for Day 3 resume intelligence workflow"
git push
````
