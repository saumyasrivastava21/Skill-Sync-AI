@'
# SkillSync AI Deployment Guide

SkillSync AI is a full-stack AI-powered Resume Intelligence Platform with candidate and recruiter workflows.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Nginx
- Backend: FastAPI, Python, SQLAlchemy, JWT Authentication
- AI: LangGraph, LangChain, NVIDIA LLM, RAG-style evidence retrieval
- Database: PostgreSQL
- Cache: Redis
- Search: Solr
- Infrastructure: Docker and Docker Compose

## Local Production Run

### 1. Clone Repository

```bash
git clone https://github.com/saumyasrivastava21/Skill-Sync-AI.git
cd Skill-Sync-AI
2. Create Environment File
cp .env.example .env

Update .env with real values:

POSTGRES_PASSWORD=your_secure_password
SECRET_KEY=your_secure_secret_key
NVIDIA_API_KEY=your_nvidia_api_key
3. Start Services
docker compose up --build -d
4. Check Containers
docker compose ps

Expected services:

skillsync-backend
skillsync-frontend
skillsync-postgres
skillsync-redis
skillsync-solr
Application URLs

Frontend:

http://localhost:3000

Backend API:

http://localhost:8000

API Docs:

http://localhost:8000/docs

Solr:

http://localhost:8983
Candidate Flow
/register
Select Candidate looking for roles
/login
/dashboard
/resumes
/reports
Recruiter Flow
/register
Select Recruiter looking for talent
/login
/recruiter

Recruiter features:

Candidate search
Candidate filtering
ATS score ranking
Candidate profile view
Solr candidate indexing
Useful Commands

View logs:

docker compose logs backend --tail 100
docker compose logs frontend --tail 100

Restart services:

docker compose restart backend frontend

Stop services:

docker compose down

Rebuild services:

docker compose up --build -d
Security Notes
Do not commit .env
Commit only .env.example
Rotate exposed API keys before deployment
Use strong production passwords
Keep Solr private in production
Backend APIs are accessed through Nginx reverse proxy using /api
'@ | Set-Content -Encoding UTF8 DEPLOYMENT.md

---

# Step 5 — Create final test script

```powershell
@'
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "SkillSync AI Production Test Started" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n[1] Docker Containers" -ForegroundColor Yellow
docker compose ps

Write-Host "`n[2] Backend Health" -ForegroundColor Yellow
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health/

Write-Host "`n[3] Frontend Reachability" -ForegroundColor Yellow
Invoke-WebRequest http://127.0.0.1:3000 -UseBasicParsing | Out-Null
Write-Host "Frontend is reachable." -ForegroundColor Green

Write-Host "`n[4] Backend Logs" -ForegroundColor Yellow
docker compose logs backend --tail 30

Write-Host "`n[5] Frontend Logs" -ForegroundColor Yellow
docker compose logs frontend --tail 30

Write-Host "`nProduction test completed." -ForegroundColor Green
'@ | Set-Content -Encoding UTF8 test-production.ps1

Run:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\test-production.ps1