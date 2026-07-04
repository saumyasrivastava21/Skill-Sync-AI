import re
from typing import Any


SKILL_CATALOG: dict[str, list[str]] = {
    "Python": ["python", "py"],
    "Java": ["java"],
    "C++": ["c++", "cpp"],
    "JavaScript": ["javascript", "js"],
    "TypeScript": ["typescript", "ts"],
    "React": ["react", "reactjs", "react.js"],
    "Redux": ["redux", "redux toolkit"],
    "Node.js": ["node.js", "nodejs", "node"],
    "FastAPI": ["fastapi", "fast api"],
    "Flask": ["flask"],
    "Django": ["django"],
    "Spring Boot": ["spring boot", "springboot"],
    "SQL": ["sql"],
    "PostgreSQL": ["postgresql", "postgres"],
    "MySQL": ["mysql"],
    "MongoDB": ["mongodb", "mongo"],
    "Redis": ["redis"],
    "Docker": ["docker", "containerization", "containers"],
    "Kubernetes": ["kubernetes", "k8s"],
    "AWS": ["aws", "amazon web services"],
    "EC2": ["ec2"],
    "S3": ["s3"],
    "RDS": ["rds"],
    "ECS": ["ecs"],
    "ECR": ["ecr"],
    "Elastic Beanstalk": ["elastic beanstalk"],
    "Apache Spark": ["apache spark", "spark", "pyspark"],
    "Spark SQL": ["spark sql"],
    "Solr": ["solr", "apache solr"],
    "Machine Learning": ["machine learning", "ml"],
    "Deep Learning": ["deep learning", "dl"],
    "Computer Vision": ["computer vision", "cv"],
    "NLP": ["nlp", "natural language processing"],
    "LLM": ["llm", "large language model", "large language models"],
    "LangChain": ["langchain", "lang chain"],
    "LangGraph": ["langgraph", "lang graph"],
    "RAG": ["rag", "retrieval augmented generation", "retrieval-augmented generation"],
    "Vector Database": ["vector database", "vector db", "vectordb"],
    "Embeddings": ["embedding", "embeddings"],
    "TensorFlow": ["tensorflow"],
    "PyTorch": ["pytorch", "torch"],
    "Scikit-learn": ["scikit-learn", "sklearn"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "MLflow": ["mlflow"],
    "GitHub Actions": ["github actions", "ci/cd", "cicd"],
    "Prometheus": ["prometheus"],
    "Grafana": ["grafana"],
    "Ansible": ["ansible"],
    "REST API": ["rest api", "restful api", "rest"],
    "Microservices": ["microservices", "microservice"],
    "Linux": ["linux"],
    "Bash": ["bash", "shell scripting"],
    "Data Engineering": ["data engineering", "etl"],
    "Data Pipeline": ["data pipeline", "pipelines"],
    "Redshift": ["redshift", "amazon redshift"],
    "EMR": ["emr", "aws emr"],
    "Airflow": ["airflow", "apache airflow"],
    "Nginx": ["nginx"],
    "JWT": ["jwt", "json web token"],
    "MLOps": ["mlops", "machine learning operations"],
}

STOPWORDS = {
    "the", "and", "for", "with", "that", "this", "from", "are", "you", "your",
    "will", "have", "has", "our", "their", "they", "into", "using", "use",
    "work", "team", "role", "candidate", "experience", "years", "good",
    "strong", "knowledge", "ability", "skills", "skill", "including",
    "such", "etc", "must", "should", "can", "build", "develop", "design",
    "engineering", "engineer", "developer", "software", "system", "systems",
}


def normalize_text(text: str) -> str:
    text = text or ""
    text = text.lower()
    text = re.sub(r"[^a-z0-9+#.\-/\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_skills_from_text(text: str) -> list[str]:
    normalized = normalize_text(text)
    found: list[str] = []

    for display_name, aliases in SKILL_CATALOG.items():
        for alias in aliases:
            alias_norm = normalize_text(alias)
            pattern = r"(?<![a-z0-9])" + re.escape(alias_norm) + r"(?![a-z0-9])"

            if re.search(pattern, normalized):
                found.append(display_name)
                break

    return sorted(set(found), key=lambda item: item.lower())


def merge_resume_skills(parsed_text: str, existing_skills: list[str] | None) -> list[str]:
    extracted = extract_skills_from_text(parsed_text)
    merged = set(extracted)

    if existing_skills:
        for skill in existing_skills:
            if skill:
                merged.add(str(skill).strip())

    return sorted(merged, key=lambda item: item.lower())


def tokenize_keywords(text: str) -> list[str]:
    normalized = normalize_text(text)
    tokens = re.findall(r"[a-z][a-z0-9+#.\-]{2,}", normalized)

    return [
        token
        for token in tokens
        if token not in STOPWORDS and not token.isdigit()
    ]


def calculate_keyword_coverage_score(resume_text: str, jd_text: str) -> float:
    resume_normalized = normalize_text(resume_text)
    jd_keywords = set(tokenize_keywords(jd_text))

    if not jd_keywords:
        return 0.0

    covered = [keyword for keyword in jd_keywords if keyword in resume_normalized]
    return round((len(covered) / len(jd_keywords)) * 100, 2)


def calculate_resume_quality_score(resume_text: str, resume_skills: list[str]) -> float:
    normalized = normalize_text(resume_text)
    word_count = len(normalized.split())

    word_score = min((word_count / 700) * 40, 40)
    skill_score = min((len(resume_skills) / 12) * 25, 25)

    section_keywords = [
        "experience",
        "projects",
        "skills",
        "education",
        "achievements",
        "certifications",
        "internship",
    ]

    section_hits = sum(1 for section in section_keywords if section in normalized)
    section_score = min((section_hits / 5) * 20, 20)

    metric_hits = len(
        re.findall(
            r"(\d+%|\d+\+|\d+x|\d+ users|\d+ images|\d+ records|\d+ projects)",
            normalized,
        )
    )
    metric_score = min(metric_hits * 5, 15)

    return round(min(word_score + skill_score + section_score + metric_score, 100), 2)


def calculate_skill_match_score(resume_skills: list[str], jd_skills: list[str]) -> float:
    if not jd_skills:
        return 0.0

    resume_set = {skill.lower() for skill in resume_skills}
    jd_set = {skill.lower() for skill in jd_skills}
    matched = resume_set.intersection(jd_set)

    return round((len(matched) / len(jd_set)) * 100, 2)


def build_recommendations(
    ats_score: float,
    matched_skills: list[str],
    missing_skills: list[str],
    resume_quality_score: float,
    keyword_coverage_score: float,
) -> list[str]:
    recommendations: list[str] = []

    if missing_skills:
        recommendations.append(
            "Add stronger project or internship evidence for: "
            + ", ".join(missing_skills[:5])
            + "."
        )

    if ats_score < 60:
        recommendations.append(
            "Resume alignment is weak. Add job-specific keywords, measurable impact, and role-focused projects."
        )
    elif ats_score < 75:
        recommendations.append(
            "Resume alignment is moderate. Add missing role skills and improve project bullet impact."
        )
    else:
        recommendations.append(
            "Resume alignment is strong. Focus on making achievements more measurable and interview-ready."
        )

    if resume_quality_score < 70:
        recommendations.append(
            "Improve resume structure with clear Experience, Projects, Skills, Education, and Achievements sections."
        )

    if keyword_coverage_score < 70:
        recommendations.append(
            "Increase keyword coverage by naturally including important terms from the job description."
        )

    if len(matched_skills) >= 5:
        recommendations.append(
            "Move top matched skills near the resume summary and project headings for better ATS visibility."
        )

    return recommendations


def build_improvement_plan(missing_skills: list[str], ats_score: float) -> list[str]:
    plan: list[str] = []

    for skill in missing_skills[:5]:
        plan.append(f"Build or document one resume-worthy project using {skill}.")

    if ats_score < 70:
        plan.append("Rewrite project bullets using action verb + technical method + measurable impact.")
        plan.append("Add a role-specific summary aligned with the target job description.")

    plan.append("Map each major job requirement to at least one resume bullet.")

    return plan


def build_interview_focus(matched_skills: list[str], missing_skills: list[str]) -> list[str]:
    focus: list[str] = []

    for skill in matched_skills[:5]:
        focus.append(f"Prepare a project-based explanation for {skill}.")

    for skill in missing_skills[:3]:
        focus.append(f"Revise fundamentals and practical use cases for {skill}.")

    if not focus:
        focus.append("Prepare resume walkthrough, project architecture, tradeoffs, and impact metrics.")

    return focus


def analyze_resume_against_jd(
    resume_text: str,
    job_description: str,
    existing_resume_skills: list[str] | None = None,
) -> dict[str, Any]:
    resume_text = resume_text or ""
    job_description = job_description or ""

    resume_skills = merge_resume_skills(resume_text, existing_resume_skills)
    jd_skills = extract_skills_from_text(job_description)

    resume_skill_map = {skill.lower(): skill for skill in resume_skills}
    jd_skill_map = {skill.lower(): skill for skill in jd_skills}

    matched_lower = set(resume_skill_map).intersection(set(jd_skill_map))
    missing_lower = set(jd_skill_map).difference(set(resume_skill_map))
    extra_lower = set(resume_skill_map).difference(set(jd_skill_map))

    matched_skills = sorted([resume_skill_map[item] for item in matched_lower])
    missing_skills = sorted([jd_skill_map[item] for item in missing_lower])
    extra_skills = sorted([resume_skill_map[item] for item in extra_lower])

    skill_match_score = calculate_skill_match_score(resume_skills, jd_skills)
    keyword_coverage_score = calculate_keyword_coverage_score(resume_text, job_description)
    resume_quality_score = calculate_resume_quality_score(resume_text, resume_skills)

    ats_score = round(
        (0.60 * skill_match_score)
        + (0.25 * keyword_coverage_score)
        + (0.15 * resume_quality_score),
        2,
    )

    recommendations = build_recommendations(
        ats_score=ats_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        resume_quality_score=resume_quality_score,
        keyword_coverage_score=keyword_coverage_score,
    )

    improvement_plan = build_improvement_plan(missing_skills, ats_score)
    interview_focus = build_interview_focus(matched_skills, missing_skills)

    return {
        "resume_skills": resume_skills,
        "jd_skills": jd_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "extra_skills": extra_skills,
        "ats_score": ats_score,
        "skill_match_score": skill_match_score,
        "keyword_coverage_score": keyword_coverage_score,
        "resume_quality_score": resume_quality_score,
        "recommendations": recommendations,
        "improvement_plan": improvement_plan,
        "interview_focus": interview_focus,
    }