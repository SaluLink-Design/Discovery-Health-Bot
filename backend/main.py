from __future__ import annotations

from pathlib import Path
from typing import Any
import re

import fitz
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.cdl_indexes import (
    build_medicine_index,
    build_treatment_index,
    discover_cdl_conditions_from_medicine_pdf,
)

ROOT = Path(__file__).resolve().parent.parent

PDF_SOURCES = [
    {
        "id": "treatment_basket",
        "label": "Treatment Baskets for the Chronic Disease List Conditions 2026",
        "file_name": "treatment-baskets-for-the-pmb-cdl-conditions.pdf",
    },
    {
        "id": "medicine_list",
        "label": "Chronic Illness Benefit Medicine List 2026",
        "file_name": "chronic-illness-benefit-medicine-list.pdf",
    },
    {
        "id": "hospital_network",
        "label": "Quality Care in Our Hospital Network 2026",
        "file_name": "dhms-hospital-network-list.pdf",
    },
]

KNOWLEDGE_BASE = {
    "conditions": {
        "diabetes": {
            "title": "Diabetes support",
            "summary": "Authi can help members understand treatment basket items, chronic medicine cover, and how to prepare for ongoing care.",
            "treatment": {
                "diagnostic": [
                    {"code": "123", "desc": "HbA1c test", "count": 2},
                    {"code": "DIA-101", "desc": "GP or specialist assessment", "count": 2},
                ],
                "ongoing": [
                    {"code": "456", "desc": "GP consultation", "count": 4},
                    {"code": "DIA-202", "desc": "Follow-up pathology monitoring", "count": 2},
                ],
            },
            "medications": [
                "Metformin",
                "Insulin analogues",
                "Glucose monitoring supplies",
            ],
            "guidance": [
                "Check whether your plan requires a network hospital for planned admissions.",
                "Confirm chronic medicine approval before collecting recurring scripts.",
            ],
        },
        "asthma": {
            "title": "Asthma support",
            "summary": "Authi can point members to likely benefit areas for diagnosis, medicine cover, and network treatment options.",
            "treatment": {
                "diagnostic": [
                    {"code": "AST-101", "desc": "Lung function testing", "count": 1},
                    {"code": "AST-102", "desc": "Initial GP or specialist consultation", "count": 2},
                ],
                "ongoing": [
                    {"code": "AST-201", "desc": "Routine review consultation", "count": 2},
                    {"code": "AST-202", "desc": "Peak flow or symptom monitoring support", "count": 2},
                ],
            },
            "medications": [
                "Inhaled corticosteroids",
                "Combination controller inhalers",
                "Reliever inhalers",
            ],
            "guidance": [
                "Use approved medicine lists first to avoid unnecessary copayments.",
                "Emergency care rules can differ from planned admissions.",
            ],
        },
    },
    "hospital_networks": [
        {
            "name": "KeyCare Hospital Network",
            "code": "KH",
            "description": "Planned admissions on KeyCare Plus and KeyCare Core should use a hospital in the network.",
        },
        {
            "name": "KeyCare Casualty Hospitals",
            "code": "KC",
            "description": "KeyCare Plus members can access any network casualty unit with authorisation and a stated upfront contribution.",
        },
        {
            "name": "Delta Hospital Network",
            "code": "D",
            "description": "Applies to select Delta plans and may trigger an upfront amount when planned admissions happen outside the network.",
        },
        {
            "name": "Smart Hospital Network",
            "code": "S",
            "description": "Smart plan members should use the specified network hospitals for planned care.",
        },
    ],
}

INTENT_MATCHERS = {
    "treatment": ["treatment", "benefit", "diagnosis", "care", "basket"],
    "medication": ["medicine", "medication", "drug", "formulary", "script"],
    "hospital": ["hospital", "network", "admission", "facility", "casualty"],
}

CONDITION_MATCHERS = {
    "diabetes": ["diabetes", "insulin", "glucose", "hba1c"],
    "asthma": ["asthma", "inhaler", "wheeze", "bronchodilator"],
}


class AskRequest(BaseModel):
    query: str = ""


def normalize_whitespace(value: str) -> str:
    return " ".join(value.split())


def create_snippet(text: str, keywords: list[str]) -> str:
    lowered = text.lower()
    keyword = next((item for item in keywords if item in lowered), None)

    if keyword is None:
        return normalize_whitespace(text[:420])

    match_index = lowered.find(keyword)
    start = max(0, match_index - 180)
    end = min(len(text), match_index + 280)
    return normalize_whitespace(text[start:end])


def get_match(query: str, matchers: dict[str, list[str]], fallback: str | None) -> str | None:
    for key, keywords in matchers.items():
        if any(keyword in query for keyword in keywords):
            return key
    return fallback


def load_pdf_index() -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []

    for source in PDF_SOURCES:
        file_path = ROOT / source["file_name"]
        document = fitz.open(file_path)
        text = "".join(page.get_text() for page in document)
        document.close()
        entries.append({**source, "text": text})

    return entries


PDF_INDEX = load_pdf_index()

# Build structured per-condition indexes from the PDFs so we can answer
# "what's covered" for the full PMB Chronic Disease List (not only hard-coded examples).
_medicine_pdf_path = ROOT / next(src["file_name"] for src in PDF_SOURCES if src["id"] == "medicine_list")
_treatment_pdf_path = ROOT / next(src["file_name"] for src in PDF_SOURCES if src["id"] == "treatment_basket")

CDL_CONDITIONS_DISPLAY = discover_cdl_conditions_from_medicine_pdf(_medicine_pdf_path)
CDL_MEDICINE_INDEX = build_medicine_index(_medicine_pdf_path)
CDL_TREATMENT_INDEX = build_treatment_index(_treatment_pdf_path, CDL_CONDITIONS_DISPLAY)


def get_document_snippet(document_id: str, keywords: list[str]) -> dict[str, str] | None:
    document = next((entry for entry in PDF_INDEX if entry["id"] == document_id), None)
    if document is None:
        return None

    return {
        "documentId": document["id"],
        "source": document["label"],
        "excerpt": create_snippet(document["text"], keywords),
    }


def detect_condition_from_pdfs(query: str) -> str | None:
    """
    Best-effort condition detection for any PMB chronic disease by checking
    query tokens against the Treatment Basket PDF text.

    This allows support for the full Chronic Disease List without needing
    to hard-code every condition up front.
    """
    # Extract reasonably long word tokens from the query
    tokens = [token for token in re.findall(r"[a-zA-Z]+", query.lower()) if len(token) >= 5]
    if not tokens:
        return None

    treatment_doc = next((entry for entry in PDF_INDEX if entry["id"] == "treatment_basket"), None)
    if treatment_doc is None:
        return None

    text = treatment_doc["text"].lower()

    for token in tokens:
        if token in text:
            return token

    return None


def detect_condition_from_cdl_catalog(query: str) -> str | None:
    normalized = query.lower().replace("’", "'").replace("–", "-").replace("‑", "-")
    # Prefer longer, multi-word matches first.
    for key in sorted(CDL_CONDITIONS_DISPLAY.keys(), key=len, reverse=True):
        if key in normalized:
            return key
    return None


def create_items(items: list[str], detail: str) -> list[dict[str, str]]:
    return [{"label": item, "detail": detail} for item in items]


def ask_authi(input_query: str) -> dict[str, Any]:
    query = input_query.strip().lower()

    if not query:
        return {
            "intent": "general",
            "condition": None,
            "headline": "Ask about treatment, medication, or hospital networks",
            "summary": "Try a question about diabetes, asthma, formulary cover, or which hospital network applies to planned care.",
            "sections": [],
            "sources": [],
        }

    condition = get_match(query, CONDITION_MATCHERS, None)
    if condition is None:
        # Prefer exact condition-name matches from the CDL catalog.
        condition = detect_condition_from_cdl_catalog(query)
    if condition is None:
        # Final fallback: token-level detection against the treatment PDF.
        condition = detect_condition_from_pdfs(query)
    intent = get_match(query, INTENT_MATCHERS, "general")
    condition_data = KNOWLEDGE_BASE["conditions"].get(condition) if condition else None
    sections: list[dict[str, Any]] = []
    source_snippets: list[dict[str, str]] = []

    display_condition = (
        CDL_CONDITIONS_DISPLAY.get(condition, condition.title()) if condition else "chronic conditions"
    )

    if intent in ("general", "treatment"):
        if condition and condition in CDL_TREATMENT_INDEX and CDL_TREATMENT_INDEX[condition]:
            sections.append(
                {
                    "title": f"Treatment basket items – {display_condition}",
                    "items": CDL_TREATMENT_INDEX[condition],
                }
            )
        elif condition_data:
            sections.append(
                {
                    "title": "Treatment basket",
                    "items": [
                        *[
                            {
                                "label": f"{item['desc']} ({item['code']})",
                                "detail": f"Diagnostic cover guidance: up to {item['count']} item(s).",
                            }
                            for item in condition_data["treatment"]["diagnostic"]
                        ],
                        *[
                            {
                                "label": f"{item['desc']} ({item['code']})",
                                "detail": f"Ongoing care guidance: up to {item['count']} item(s).",
                            }
                            for item in condition_data["treatment"]["ongoing"]
                        ],
                    ],
                }
            )
        else:
            sections.append(
                {
                    "title": f"Treatment basket for {display_condition}",
                    "items": create_items(
                        [
                            "Review the PMB Chronic Disease List basket items for your condition.",
                            "Check which diagnostics and follow-up visits are typically included.",
                            "Confirm whether any limits or frequencies apply to your benefits.",
                        ],
                        "Use this as a starting point before confirming final plan rules.",
                    ),
                }
            )

        treatment_keywords = ["chronic disease list", "ongoing management"]
        if condition:
            treatment_keywords.insert(0, condition)

        snippet = get_document_snippet("treatment_basket", treatment_keywords)
        if snippet:
            source_snippets.append(snippet)

    if intent in ("general", "medication"):
        if condition and condition in CDL_MEDICINE_INDEX and CDL_MEDICINE_INDEX[condition]:
            sections.append(
                {
                    "title": f"Formulary medicines – {display_condition}",
                    "items": CDL_MEDICINE_INDEX[condition],
                }
            )
        elif condition_data:
            sections.append(
                {
                    "title": "Medicine support",
                    "items": create_items(
                        condition_data["medications"],
                        "Check plan approval, formulary status, and chronic medicine rules before collection.",
                    ),
                }
            )
        else:
            sections.append(
                {
                    "title": f"Chronic medicine for {display_condition}",
                    "items": create_items(
                        [
                            "Check if your medicines are on the Chronic Illness Benefit medicine list.",
                            "Ask whether generic alternatives are required to avoid co-payments.",
                            "Confirm that your scripts are registered under the correct chronic condition.",
                        ],
                        "Use the medicine list and plan rules to confirm final cover.",
                    ),
                }
            )

        medicine_keywords = ["formulary", "medicine list"]
        if condition:
            medicine_keywords.insert(0, condition)

        snippet = get_document_snippet("medicine_list", medicine_keywords)
        if snippet:
            source_snippets.append(snippet)

    if intent == "hospital" or (not condition_data and intent == "general"):
        sections.append(
            {
                "title": "Hospital networks",
                "items": [
                    {
                        "label": f"{network['code']} - {network['name']}",
                        "detail": network["description"],
                    }
                    for network in KNOWLEDGE_BASE["hospital_networks"]
                ],
            }
        )
        snippet = get_document_snippet("hospital_network", ["hospital network", "planned admission"])
        if snippet:
            source_snippets.append(snippet)

    if condition_data:
        sections.append(
            {
                "title": "Next guidance",
                "items": create_items(
                    condition_data["guidance"],
                    "Use this as a starting point before checking final plan-specific rules.",
                ),
            }
        )

    return {
        "intent": intent,
        "condition": condition,
        "headline": condition_data["title"] if condition_data else f"Support for {display_condition}",
        "summary": (
            condition_data["summary"]
            if condition_data
            else "Authi uses the full PMB Chronic Disease List and benefit PDFs to guide members towards treatment baskets, formulary cover, and hospital-network information."
        ),
        "sections": sections,
        "sources": source_snippets,
    }


app = FastAPI(title="Authi Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "documents": [
            {"id": entry["id"], "label": entry["label"], "fileName": entry["file_name"]}
            for entry in PDF_INDEX
        ],
    }


@app.post("/api/ask")
def ask(request: AskRequest) -> dict[str, Any]:
    return ask_authi(request.query)
