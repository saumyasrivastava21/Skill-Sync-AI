from typing import Any

from pydantic import BaseModel, Field

from app.core.config import get_settings


class NvidiaATSOutput(BaseModel):
    report_summary: str = Field(
        description="Concise ATS-style resume-job fit summary."
    )
    role_readiness: str = Field(
        description="One of: Strong fit, Moderate fit, Needs improvement."
    )
    improvement_plan: list[str] = Field(
        description="Actionable improvement steps for resume alignment."
    )
    interview_focus: list[str] = Field(
        description="Interview preparation focus areas based on matched and missing skills."
    )


def build_fallback_llm_output(
    analysis: dict[str, Any],
    job_title: str | None,
    company_name: str | None,
) -> dict[str, Any]:
    ats_score = analysis.get("ats_score", 0)
    matched_skills = analysis.get("matched_skills", [])
    missing_skills = analysis.get("missing_skills", [])
    improvement_plan = analysis.get("improvement_plan", [])
    interview_focus = analysis.get("interview_focus", [])

    role = job_title or "the target role"
    company = company_name or "the target company"

    if ats_score >= 80:
        readiness = "Strong fit"
    elif ats_score >= 65:
        readiness = "Moderate fit"
    else:
        readiness = "Needs improvement"

    summary = (
        f"The resume is a {readiness.lower()} for {role} at {company}. "
        f"Matched skills include {', '.join(matched_skills[:6]) or 'some relevant skills'}. "
        f"Missing or weaker areas include {', '.join(missing_skills[:6]) or 'no major detected gaps'}."
    )

    return {
        "report_summary": summary,
        "role_readiness": readiness,
        "improvement_plan": improvement_plan,
        "interview_focus": interview_focus,
        "llm_used": False,
        "llm_model": None,
    }


def generate_nvidia_structured_report(
    analysis: dict[str, Any],
    evidence_snippets: list[dict],
    job_title: str | None,
    company_name: str | None,
    job_description: str,
) -> dict[str, Any]:
    settings = get_settings()

    if not settings.NVIDIA_API_KEY:
        fallback = build_fallback_llm_output(analysis, job_title, company_name)
        fallback["llm_error"] = "NVIDIA_API_KEY not configured"
        return fallback

    try:
        from langchain_nvidia_ai_endpoints import ChatNVIDIA

        llm = ChatNVIDIA(
            model=settings.NVIDIA_MODEL,
            api_key=settings.NVIDIA_API_KEY,
            temperature=0.2,
            max_tokens=700,
        )

        structured_llm = llm.with_structured_output(NvidiaATSOutput)

        prompt = f"""
You are an expert ATS and AI career coach.

Generate a structured resume-job fit report.

Job title: {job_title or "Target Role"}
Company: {company_name or "Target Company"}

ATS score: {analysis["ats_score"]}
Skill match score: {analysis["skill_match_score"]}
Keyword coverage score: {analysis["keyword_coverage_score"]}
Resume quality score: {analysis["resume_quality_score"]}

Resume skills:
{analysis["resume_skills"]}

JD skills:
{analysis["jd_skills"]}

Matched skills:
{analysis["matched_skills"]}

Missing skills:
{analysis["missing_skills"]}

Evidence snippets from resume:
{evidence_snippets}

Job description:
{job_description[:2500]}

Rules:
- Keep report_summary concise and professional.
- role_readiness must be one of: Strong fit, Moderate fit, Needs improvement.
- improvement_plan must be practical and resume-focused.
- interview_focus must help the candidate prepare for interviews.
"""

        output = structured_llm.invoke(prompt)

        if isinstance(output, NvidiaATSOutput):
            data = output.model_dump()
        elif isinstance(output, dict):
            data = NvidiaATSOutput(**output).model_dump()
        else:
            data = NvidiaATSOutput.model_validate(output).model_dump()

        data["llm_used"] = True
        data["llm_model"] = settings.NVIDIA_MODEL
        data["llm_error"] = None

        return data

    except Exception as exc:
        fallback = build_fallback_llm_output(analysis, job_title, company_name)
        fallback["llm_error"] = str(exc)
        return fallback