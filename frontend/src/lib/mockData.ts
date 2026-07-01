export const mockHealth = {
  status: "ok",
  service: "SkillSync AI",
  environment: "frontend-mock",
  version: "v1"
};

export const mockDependencies = {
  postgres: "healthy",
  redis: "healthy"
};

export const mockUser = {
  id: 1,
  name: "Saumya Srivastava",
  email: "saumya@example.com",
  role: "candidate" as const
};

export const mockRecruiter = {
  id: 2,
  name: "Alex Recruiter",
  email: "alex@example.com",
  role: "recruiter" as const
};

export const mockAdmin = {
  id: 3,
  name: "Admin User",
  email: "admin@example.com",
  role: "admin" as const
};

export const mockResumes = [
  {
    id: 1,
    file_name: "resume_saumya_2026.pdf",
    status: "parsed",
    created_at: "2026-07-01T10:00:00"
  },
  {
    id: 2,
    file_name: "ml_engineer_resume.pdf",
    status: "parsed",
    created_at: "2026-06-15T14:30:00"
  }
];

export const mockAnalysis = {
  id: 1,
  resume_id: 1,
  ats_score: 86,
  matched_skills: ["Python", "FastAPI", "Docker", "React", "TypeScript"],
  missing_skills: ["Apache Spark", "AWS ECS", "Solr"],
  recommendations: [
    "Add deployment metrics",
    "Mention CI/CD experience",
    "Add Spark batch processing project"
  ],
  experience_match: 78,
  education_match: 90,
  project_match: 84,
  keyword_match: 81,
  created_at: "2026-07-01T10:00:00"
};

export const mockCandidates = [
  {
    id: 1,
    name: "Saumya Srivastava",
    email: "saumya@example.com",
    top_skills: ["Python", "FastAPI", "Docker"],
    latest_ats_score: 86,
    resume_count: 2,
    created_at: "2026-07-01T10:00:00"
  },
  {
    id: 4,
    name: "Jane Doe",
    email: "jane@example.com",
    top_skills: ["React", "TypeScript", "Node.js"],
    latest_ats_score: 92,
    resume_count: 1,
    created_at: "2026-06-20T09:15:00"
  }
];

export const mockAnalytics = {
  total_candidates: 120,
  average_ats_score: 74,
  top_skills: [
    { skill: "Python", count: 80 },
    { skill: "React", count: 55 },
    { skill: "Docker", count: 40 },
    { skill: "FastAPI", count: 35 },
    { skill: "TypeScript", count: 30 }
  ],
  score_distribution: [
    { range: "0-40", count: 10 },
    { range: "40-60", count: 25 },
    { range: "60-80", count: 50 },
    { range: "80-100", count: 35 }
  ]
};
