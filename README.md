# SkillSync AI

**SkillSync AI** is a full-stack AI-powered Resume Intelligence Platform designed to analyze resumes, extract candidate skills, compare them with job requirements, and provide intelligent recommendations for career growth.

The project is built using a production-style architecture with **React**, **FastAPI**, **PostgreSQL**, **Redis**, **Docker**, and future-ready **MLOps workflows**.

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios

### Backend

* FastAPI
* Python
* Pydantic
* REST APIs

### Database & Cache

* PostgreSQL
* Redis

### DevOps / MLOps

* Docker
* Docker Compose
* Environment-based configuration
* Health-check APIs
* Production-ready project structure

---

## Day 1 Completed

* Created React frontend foundation
* Created FastAPI backend foundation
* Designed Docker Compose setup
* Integrated PostgreSQL service
* Integrated Redis service
* Added backend health-check APIs
* Built professional frontend UI shell
* Structured project for future AI, MLOps, and deployment workflows

---

## System Architecture

```text
User
 ↓
React Frontend
 ↓
FastAPI Backend
 ↓
PostgreSQL Database
 ↓
Redis Cache
 ↓
AI / ML Resume Intelligence Layer
```

---

## Current Features

* Full-stack project setup
* Backend API server using FastAPI
* Frontend application using React
* PostgreSQL database service
* Redis cache service
* Docker-based local development
* Health endpoint for backend validation
* Clean and scalable folder structure

---

## Run Locally

### Backend

```bash
cd backend
uvicorn app.main:app --reload
```

Backend will run on:

```text
http://127.0.0.1:8000
```

API docs:

```text
http://127.0.0.1:8000/docs
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

### Docker Compose

```bash
docker compose up --build
```

To stop services:

```bash
docker compose down
```

---

## Planned Features

* Resume upload and parsing
* Skill extraction using NLP
* Job description matching
* Candidate-job similarity scoring
* AI-powered resume feedback
* PostgreSQL persistence layer
* Redis-based caching
* Authentication system
* CI/CD pipeline
* Dockerized production deployment
* Cloud deployment using AWS services

---

## Project Goal

The goal of SkillSync AI is to build a production-level AI platform that demonstrates strong skills in:

* Full-stack development
* Backend API design
* Database integration
* Docker-based deployment
* MLOps fundamentals
* AI/NLP system design
* Scalable software engineering

---

## Status

Day 1 foundation completed successfully.
The project is now ready for Day 2 development, including API expansion, database models, resume upload flow, and production-level backend structure.

uvicorn app.main:app --reload

Frontend:

```bash
cd frontend
npm run dev
