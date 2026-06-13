from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

_ROOT = Path(__file__).resolve().parent
_FALLBACK_PATH = _ROOT / "cdl_bundled_fallback.json"


@lru_cache(maxsize=1)
def load_bundled_cdl() -> dict:
    if not _FALLBACK_PATH.exists():
        return {}
    with _FALLBACK_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


def bundled_treatment(condition_id: str) -> tuple[list[dict], list[dict]]:
    entry = load_bundled_cdl().get(condition_id, {})
    treatment = entry.get("treatment", {})
    return treatment.get("diagnostic", []), treatment.get("ongoing", [])


def bundled_medicines(condition_id: str) -> list[dict]:
    return list(load_bundled_cdl().get(condition_id, {}).get("medications", []))
