# SkillSync AI

AI-powered Resume Intelligence Platform for candidates and recruiters.

SkillSync AI helps candidates upload resumes, extract skills, generate ATS-style analysis reports, identify missing skills, and receive AI-powered improvement recommendations. It also provides recruiters with a dashboard to search, filter, rank, and analyze candidates using resume intelligence and ATS scores.

---

## Features

### Candidate Portal

- Role-based signup and login
- Resume upload and PDF parsing
- Automatic skill extraction
- Resume vs Job Description analysis
- ATS-style score generation
- Matched skills and missing skills detection
- RAG-style resume evidence retrieval
- AI-powered recommendations using NVIDIA LLM
- Previous analysis reports and dashboard insights

### Recruiter Portal

- Recruiter signup and login
- Candidate search and filtering
- Candidate ranking using ATS score, skill match, resume completeness, and activity score
- Candidate profile view with resume and report details
- Recruiter analytics dashboard
- Solr-based candidate indexing and search foundation

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Framer Motion

### Backend

- FastAPI
- Python
- SQLAlchemy
- Pydantic
- JWT Authentication
- Passlib
- REST APIs

### AI / Search

- LangGraph
- LangChain
- NVIDIA LLM
- ATS scoring engine
- Resume chunking
- RAG-style evidence retrieval
- Solr candidate search

### Infrastructure

- PostgreSQL
- Redis
- Docker
- Docker Compose
- Nginx

---

## System Architecture

```text
React + TypeScript Frontend
        |
        v
Nginx Reverse Proxy
        |
        v
FastAPI Backend
        |
        |---------------- PostgreSQL
        |---------------- Redis
        |---------------- Solr
        |
        v
LangGraph ATS Workflow
        |
        v
NVIDIA LLM Recommendations
```

---

## User Flows

### Candidate Flow

```text
/register
Select "Candidate looking for roles"
/login
/dashboard
/resumes
/reports
```

### Recruiter Flow

```text
/register
Select "Recruiter looking for talent"
/login
/recruiter
```

---

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/saumyasrivastava21/Skill-Sync-AI.git
cd Skill-Sync-AI
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Update `.env` with your real values:

```env
POSTGRES_PASSWORD=your_secure_password
SECRET_KEY=your_secure_secret_key
NVIDIA_API_KEY=your_nvidia_api_key
```

### 3. Run Full Application

```bash
docker compose up --build -d
```

### 4. Check Services

```bash
docker compose ps
```

Expected services:

```text
skillsync-backend
skillsync-frontend
skillsync-postgres
skillsync-redis
skillsync-solr
```

---

## Application URLs

```text
Frontend:     http://localhost:3000
Backend API:  http://localhost:8000
API Docs:     http://localhost:8000/docs
Solr:         http://localhost:8983
```

---

## Important API Modules

```text
Auth APIs
Resume Upload and Parsing APIs
ATS Report APIs
Recruiter Search APIs
Recruiter Analytics APIs
Solr Candidate Indexing API
```

---

## Useful Commands

View logs:

```bash
docker compose logs backend --tail 100
docker compose logs frontend --tail 100
```

Restart services:

```bash
docker compose restart backend frontend
```

Stop services:

```bash
docker compose down
```

Rebuild services:

```bash
docker compose up --build -d
```

---

## Project Status

```text
Full-stack foundation completed
JWT authentication completed
Role-based candidate and recruiter signup completed
Resume upload and parsing completed
LangGraph ATS analysis completed
NVIDIA LLM recommendations completed
Candidate dashboard completed
Recruiter dashboard completed
Solr indexing/search foundation completed
Docker production setup completed
AWS EC2 deployment ready
```

---

## Security Notes

- Do not commit `.env`
- Commit only `.env.example`
- Rotate exposed API keys before deployment
- Use strong production passwords
- Keep Solr private in production
- Frontend uses Nginx and proxies backend requests through `/api`

---

## Author

Saumya Srivastava  
AI Engineer | Machine Learning Engineer | Full-Stack AI Developer