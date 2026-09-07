"""Authi LLM layer — gpt-oss via Hugging Face router, grounded in retrieved scheme data."""

from __future__ import annotations

import os
from typing import Any

HF_BASE_URL = "https://router.huggingface.co/v1"
DEFAULT_MODEL = "openai/gpt-oss-20b:groq"

SYSTEM_PROMPT = """You are Authi, a Discovery Health member guide inside SaluLink.

Rules:
- Answer ONLY from MEMBER PROFILE and RETRIEVED SCHEME DATA below.
- If the retrieved data does not contain the answer, say you cannot confirm it from the 2026 Discovery Health guides. Do not guess.
- Never invent medicine cover, hospital network membership, contribution amounts, or treatment basket counts.
- Use plain South African English. Be concise: short paragraphs or bullets.
- Speak to the member by name when you have it.
- End with a one-line reminder that this is guidance from 2026 member guides, not a guarantee of cover, and they should confirm with Discovery Health.
- If listing hospitals, include town and whether they are on-plan when that is in the data.
- If listing medicines, say which chronic condition list they appear under, and mention KeyCare / Executive-Comprehensive restrictions when present.
"""


def llm_is_configured() -> bool:
    return bool(os.getenv("HF_TOKEN", "").strip())


def llm_model_name() -> str:
    return os.getenv("AUTHI_LLM_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL


def compact_retrieval(result: dict[str, Any], extra_sections: list[dict[str, Any]] | None = None) -> str:
    """Turn structured Authi retrieval into a bounded context block for the LLM."""
    lines: list[str] = [
        f"Intent: {result.get('intent') or 'general'}",
        f"Matched condition: {result.get('condition') or 'none'}",
        f"Headline: {result.get('headline') or ''}",
        f"Summary: {result.get('summary') or ''}",
    ]

    sections = list(result.get("sections") or [])
    if extra_sections:
        sections = extra_sections + sections

    for section in sections:
        title = section.get("title") or "Section"
        items = section.get("items") or []
        lines.append(f"\n## {title}")
        shown = items[:18]
        for item in shown:
            if isinstance(item, dict):
                label = item.get("label") or item.get("desc") or item.get("name") or ""
                detail = item.get("detail") or ""
                extras: list[str] = []
                if item.get("code"):
                    extras.append(f"code {item['code']}")
                if item.get("count") not in (None, ""):
                    extras.append(f"up to {item['count']}")
                if item.get("town"):
                    extras.append(str(item["town"]))
                if item.get("distanceKm") is not None:
                    extras.append(f"{item['distanceKm']} km")
                if item.get("onPlan") is True:
                    extras.append("on plan")
                if item.get("onPlan") is False:
                    extras.append("off plan")
                suffix = f" ({'; '.join(extras)})" if extras else ""
                if detail:
                    lines.append(f"- {label}{suffix}: {detail}")
                else:
                    lines.append(f"- {label}{suffix}")
            else:
                lines.append(f"- {item}")
        if len(items) > 18:
            lines.append(f"- … {len(items) - 18} more omitted; tell the member to use the Hospitals / Medicines tabs for the full list.")

    for src in result.get("sources") or []:
        excerpt = (src.get("excerpt") or "")[:450]
        if excerpt:
            lines.append(f"\nSource excerpt ({src.get('source')}): {excerpt}")

    hints = result.get("hints") or []
    if hints:
        lines.append("\nHints:")
        for hint in hints[:6]:
            lines.append(f"- {hint}")

    text = "\n".join(lines)
    return text[:14000]


def format_member_profile(profile: dict[str, Any] | None) -> str:
    if not profile:
        return "No member profile was supplied."

    lines = [
        f"Name: {profile.get('name') or 'unknown'}",
        f"Plan: {profile.get('planLabel') or profile.get('planId') or 'unknown'}",
        f"Option: {profile.get('subThemeLabel') or 'unknown'}",
        f"Town: {profile.get('town') or 'unknown'}",
        f"Province: {profile.get('province') or 'unknown'}",
    ]
    labels = profile.get("conditionLabels") or []
    if labels:
        lines.append(f"Chronic conditions: {', '.join(labels)}")
    codes = profile.get("networkCodes") or []
    if codes:
        lines.append(f"Hospital network codes: {', '.join(codes)}")
    if profile.get("contributionMonthly"):
        lines.append(f"Monthly contribution (from plan tables): {profile['contributionMonthly']}")
    if profile.get("contributionNotes"):
        lines.append(f"Contribution notes: {profile['contributionNotes']}")
    return "\n".join(lines)


def fallback_answer(result: dict[str, Any]) -> str:
    parts = [
        result.get("headline") or "Here is what Authi found.",
        result.get("summary") or "",
    ]
    for section in (result.get("sections") or [])[:3]:
        title = section.get("title")
        items = section.get("items") or []
        if title:
            parts.append(f"{title}:")
        for item in items[:8]:
            if isinstance(item, dict):
                label = item.get("label") or item.get("desc") or ""
                detail = item.get("detail") or ""
                parts.append(f"- {label}" + (f" — {detail}" if detail else ""))
            else:
                parts.append(f"- {item}")
        if len(items) > 8:
            parts.append(f"- … {len(items) - 8} more in the retrieved list.")
    parts.append(
        "This is guidance from Discovery Health 2026 member guides, not a guarantee of cover. Confirm with Discovery Health."
    )
    return "\n".join(part for part in parts if part).strip()


def _message_text(message: Any) -> str:
    content = getattr(message, "content", None)
    if isinstance(content, str) and content.strip():
        return content.strip()
    if isinstance(content, list):
        chunks: list[str] = []
        for part in content:
            if isinstance(part, str):
                chunks.append(part)
            elif isinstance(part, dict) and part.get("text"):
                chunks.append(str(part["text"]))
            else:
                text = getattr(part, "text", None)
                if text:
                    chunks.append(str(text))
        joined = "\n".join(chunks).strip()
        if joined:
            return joined
    reasoning = getattr(message, "reasoning", None) or getattr(message, "reasoning_content", None)
    if isinstance(reasoning, str) and reasoning.strip():
        return reasoning.strip()
    return ""


def generate_authi_answer(
    *,
    query: str,
    profile: dict[str, Any] | None,
    retrieval: dict[str, Any],
    history: list[dict[str, str]] | None = None,
    extra_sections: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Call gpt-oss. Always returns an answer string; falls back if the LLM is down."""
    context = compact_retrieval(retrieval, extra_sections)
    member = format_member_profile(profile)

    if not llm_is_configured():
        return {
            "ok": False,
            "reason": "missing_hf_token",
            "model": llm_model_name(),
            "answer": fallback_answer(retrieval),
        }

    user_block = (
        f"MEMBER QUESTION:\n{query.strip()}\n\n"
        f"MEMBER PROFILE:\n{member}\n\n"
        f"RETRIEVED SCHEME DATA:\n{context}"
    )

    messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in (history or [])[-6:]:
        role = turn.get("role")
        content = (turn.get("content") or "").strip()
        if role in {"user", "assistant"} and content:
            messages.append({"role": role, "content": content[:2000]})
    messages.append({"role": "user", "content": user_block})

    try:
        from openai import OpenAI

        client = OpenAI(
            base_url=os.getenv("HF_BASE_URL", HF_BASE_URL).rstrip("/"),
            api_key=os.getenv("HF_TOKEN", "").strip(),
            timeout=45.0,
        )
        completion = client.chat.completions.create(
            model=llm_model_name(),
            messages=messages,
            temperature=0.2,
            max_tokens=900,
        )
        choice = completion.choices[0] if completion.choices else None
        answer = _message_text(choice.message) if choice else ""
        if not answer:
            return {
                "ok": False,
                "reason": "empty_llm_response",
                "model": llm_model_name(),
                "answer": fallback_answer(retrieval),
            }
        return {
            "ok": True,
            "reason": "gpt_oss",
            "model": llm_model_name(),
            "answer": answer,
        }
    except Exception as exc:
        return {
            "ok": False,
            "reason": f"llm_error:{exc.__class__.__name__}",
            "model": llm_model_name(),
            "answer": fallback_answer(retrieval),
        }
