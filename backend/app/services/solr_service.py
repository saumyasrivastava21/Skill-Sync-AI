from typing import Any

import requests

SOLR_BASE_URL = "http://solr:8983/solr"
SOLR_CORE = "skillsync_candidates"


def is_solr_available() -> bool:
    try:
        response = requests.get(
            f"{SOLR_BASE_URL}/admin/cores",
            timeout=3,
        )
        return response.status_code == 200
    except Exception:
        return False


def create_core_if_needed() -> bool:
    if not is_solr_available():
        return False

    try:
        response = requests.get(
            f"{SOLR_BASE_URL}/admin/cores",
            params={
                "action": "CREATE",
                "name": SOLR_CORE,
                "configSet": "_default",
            },
            timeout=5,
        )

        return response.status_code in [200, 400]
    except Exception:
        return False


def index_candidate_documents(documents: list[dict[str, Any]]) -> tuple[bool, int]:
    if not documents:
        return True, 0

    create_core_if_needed()

    try:
        response = requests.post(
            f"{SOLR_BASE_URL}/{SOLR_CORE}/update/json/docs",
            params={"commit": "true"},
            json=documents,
            timeout=10,
        )

        if response.status_code in [200, 201]:
            return True, len(documents)

        return False, 0

    except Exception:
        return False, 0


def search_candidates_in_solr(
    query: str = "*:*",
    skill: str | None = None,
    min_score: float | None = None,
    page: int = 1,
    page_size: int = 10,
) -> dict[str, Any] | None:
    if not is_solr_available():
        return None

    filters = []

    if skill:
        filters.append(f"skills:{skill}")

    if min_score is not None:
        filters.append(f"ats_score:[{min_score} TO *]")

    params: dict[str, Any] = {
        "q": query or "*:*",
        "start": (page - 1) * page_size,
        "rows": page_size,
        "wt": "json",
    }

    if filters:
        params["fq"] = filters

    try:
        response = requests.get(
            f"{SOLR_BASE_URL}/{SOLR_CORE}/select",
            params=params,
            timeout=5,
        )

        if response.status_code == 200:
            return response.json()

    except Exception:
        return None

    return None