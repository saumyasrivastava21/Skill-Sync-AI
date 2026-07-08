from datetime import datetime, timezone


def calculate_resume_completeness_score(
    word_count: int | None,
    skills_count: int,
    status: str | None,
) -> float:
    score = 0.0

    if status == "parsed":
        score += 35.0

    if word_count:
        score += min((word_count / 700) * 35, 35)

    score += min((skills_count / 12) * 30, 30)

    return round(min(score, 100), 2)


def calculate_recent_activity_score(created_at: datetime | None) -> float:
    if not created_at:
        return 50.0

    now = datetime.now(timezone.utc)

    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    days = (now - created_at).days

    if days <= 1:
        return 100.0

    if days <= 7:
        return 85.0

    if days <= 30:
        return 70.0

    if days <= 90:
        return 55.0

    return 40.0


def calculate_candidate_rank_score(
    ats_score: float,
    skill_match_score: float,
    resume_completeness_score: float,
    recent_activity_score: float,
) -> float:
    rank_score = (
        0.50 * ats_score
        + 0.30 * skill_match_score
        + 0.10 * resume_completeness_score
        + 0.10 * recent_activity_score
    )

    return round(rank_score, 2)