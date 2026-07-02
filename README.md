# SkillSync AI

> Full-Stack AI Resume Intelligence Platform for resume analysis, skill extraction, job-role matching, ATS scoring, and career recommendations.

---

## Overview

**SkillSync AI** is a production-style AI platform that helps candidates and recruiters analyze resumes intelligently.

It allows users to upload resumes, extract skills, compare them with job descriptions, identify missing skills, generate ATS-style scores, and receive AI-powered career recommendations.

The project is built using a modern full-stack architecture with:

* React + TypeScript frontend
* FastAPI backend
* PostgreSQL database
* Redis caching
* JWT authentication
* Docker-based local infrastructure
* Future-ready AI / ML / MLOps layer

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Redux Toolkit
* React Router
* Tailwind CSS
* Axios

### Backend

* FastAPI
* Python
* Pydantic
* SQLAlchemy
* Alembic
* JWT Authentication
* Passlib password hashing

### Database & Cache

* PostgreSQL
* Redis

### DevOps / MLOps

* Docker
* Docker Compose
* Environment-based configuration
* Health-check APIs
* Production-ready folder structure
* Future AWS deployment support

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
        |                                   |
        -------------------------------------
                          |
                          v
          AI / ML Resume Intelligence Layer
                          |
                          v
       Resume Parsing | Skill Extraction | ATS Score
       Job Matching   | Gap Analysis     | Recommendations
```

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

### Upcoming

* Resume upload system
* Resume metadata storage
* PDF text extraction
* Skill extraction engine
* Job description upload
* Resume vs JD matching
* ATS score generation
* Missing skills analysis
* AI-powered recommendations
* User dashboard
* Resume history
* Recruiter view
* MLflow experiment tracking
* Dockerized production deployment

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
│   │   ├── api/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
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
├── docker-compose.yml
├── README.md
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

### 2. Start PostgreSQL and Redis

```bash
docker compose up -d
```

---

### 3. Run Backend

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

### 4. Run Frontend

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

## Important APIs

### Health Check

```http
GET /health
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

---

## Environment Variables

Create `.env` inside backend:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/skillsync_db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
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
* Add monitoring with Prometheus and Grafana
* Add logging middleware
* Add production error handling

---

## Interview-Level Explanation

SkillSync AI is a full-stack AI-powered resume intelligence platform built using React, FastAPI, PostgreSQL, Redis, Docker, and JWT authentication.

The frontend communicates with the FastAPI backend using Axios. The backend exposes REST APIs for authentication, resume upload, skill extraction, and job matching. PostgreSQL stores users, resumes, job descriptions, and analysis results, while Redis is used for caching and future background task optimization.

The AI layer will extract skills from resumes, compare them with job descriptions, calculate ATS scores, identify skill gaps, and generate career recommendations. The project follows production-style architecture with modular backend services, environment configuration, database migrations, Docker setup, and future MLOps deployment support.

---

## Current Status

```text
Day 1: Full-stack foundation completed
Day 2: JWT authentication completed
Day 3: Resume upload + CRUD APIs in progress
```

---

## Author

**Saumya Srivastava**
Machine Learning Engineer | AI Engineer | Full-Stack AI Developer

---

## License

This project is for learning, portfolio, and production-level AI engineering practice.
