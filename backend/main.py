from __future__ import annotations

from pathlib import Path
from typing import Any
import re

import fitz
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.cdl_indexes import (
    build_medicine_index,
    build_treatment_index,
    discover_cdl_conditions_from_medicine_pdf,
)
from backend.hospital_network_index import (
    NETWORK_LABELS,
    HospitalSearchParams,
    build_hospital_sections,
    canonical_province,
    filter_hospital_records,
    is_broad_keycare_network_filter,
    keycare_broad_hint_section,
    keycare_broad_hint_strings,
    parse_hospital_network_pdf,
    parse_hospital_search_params,
    merge_network_filters,
    wants_hospital_directory,
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
    "hospital": [
        "hospital",
        "hospitals",
        "network",
        "admission",
        "facility",
        "facilities",
        "casualty",
        "keycare",
        "delta",
        "smart",
        "coastal",
        "gauteng",
        "pretoria",
        "johannesburg",
        "durban",
        "cape town",
        "which hospitals",
        "list hospitals",
        "find hospitals",
    ],
    "treatment": ["treatment", "benefit", "diagnosis", "care", "basket"],
    "medication": ["medicine", "medication", "drug", "formulary", "script"],
}

CONDITION_MATCHERS = {
    "diabetes": ["diabetes", "insulin", "glucose", "hba1c"],
    "asthma": ["asthma", "inhaler", "wheeze", "bronchodilator"],
}

# Tokens that appear in benefit PDF boilerplate but are not chronic conditions.
_FALSE_POSITIVE_CONDITION_TOKENS = frozenset(
    {
        "hospital",
        "hospitals",
        "management",
        "benefits",
        "members",
        "member",
        "discovery",
        "scheme",
        "cover",
        "claims",
        "claim",
        "payment",
        "payments",
        "services",
        "service",
        "treatment",
        "diagnosis",
        "health",
        "medical",
        "conditions",
        "condition",
        "network",
        "networks",
        "facility",
        "facilities",
        "keycare",
        "delta",
        "smart",
        "coastal",
    }
)


class AskRequest(BaseModel):
    query: str = ""
    networkCodes: list[str] | None = None
    planId: str | None = None


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

_hospital_pdf_path = ROOT / next(src["file_name"] for src in PDF_SOURCES if src["id"] == "hospital_network")
HOSPITAL_RECORDS = parse_hospital_network_pdf(_hospital_pdf_path)


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
        if token in _FALSE_POSITIVE_CONDITION_TOKENS:
            continue
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


def _network_display_names(codes: frozenset[str]) -> str:
    """Return a human-readable joined string for a set of network codes."""
    names = [NETWORK_LABELS.get(c, c) for c in sorted(codes)]
    if len(names) == 1:
        return names[0]
    return ", ".join(names[:-1]) + " and " + names[-1]


def ask_authi(input_query: str, explicit_network_codes: list[str] | None = None) -> dict[str, Any]:
    query = input_query.strip().lower()

    if not query:
        return {
            "intent": "general",
            "condition": None,
            "headline": "Ask about treatment, medication, or hospital networks",
            "summary": "Try a question about diabetes, asthma, formulary cover, or which hospital network applies to planned care.",
            "sections": [],
            "sources": [],
            "hints": [],
        }

    condition = get_match(query, CONDITION_MATCHERS, None)
    if condition is None:
        # Prefer exact condition-name matches from the CDL catalog.
        condition = detect_condition_from_cdl_catalog(query)
    if condition is None:
        # Final fallback: token-level detection against the treatment PDF.
        condition = detect_condition_from_pdfs(query)

    # Hospital-override: if the query clearly asks about hospitals/networks alongside
    # plan keywords, force hospital intent before the general matcher runs.
    _q_lower = query
    _has_hospital_signal = any(w in _q_lower for w in ("hospital", "hospitals", "network", "which hospitals", "list hospitals"))
    if _has_hospital_signal and ("plan" in _q_lower or "plan" in input_query.lower()):
        intent: str | None = "hospital"
    else:
        intent = get_match(query, INTENT_MATCHERS, "general")

    condition_data = KNOWLEDGE_BASE["conditions"].get(condition) if condition else None
    sections: list[dict[str, Any]] = []
    source_snippets: list[dict[str, str]] = []

    display_condition = (
        CDL_CONDITIONS_DISPLAY.get(condition, condition.title()) if condition else "chronic conditions"
    )

    hospital_directory_province: str | None = None
    hospital_directory_prompt = False
    hospital_params_networks: frozenset[str] | None = None
    response_hints: list[str] = []

    if wants_hospital_directory(query) or intent == "hospital":
        hospital_params = parse_hospital_search_params(input_query)

        # Explicit network codes from the frontend always win over text resolution.
        if explicit_network_codes:
            hospital_params = HospitalSearchParams(
                province=hospital_params.province,
                networks=frozenset(explicit_network_codes),
                town=hospital_params.town,
                name_query=hospital_params.name_query,
            )

        hospital_params_networks = hospital_params.networks

        if hospital_params.province:
            filtered_hospitals = filter_hospital_records(
                HOSPITAL_RECORDS,
                province=hospital_params.province,
                networks=hospital_params.networks,
                town_substring=hospital_params.town,
                name_substring=hospital_params.name_query,
            )
            if is_broad_keycare_network_filter(hospital_params.networks):
                sections.append(keycare_broad_hint_section())
                response_hints.extend(keycare_broad_hint_strings())
            title = f"Hospitals in {hospital_params.province.title()}"
            if hospital_params.networks:
                title += f" (matching {', '.join(sorted(hospital_params.networks))})"
            if hospital_params.town:
                title += f" – {hospital_params.town.title()}"
            flat = "flat list" in query or "single list" in query
            sections.extend(build_hospital_sections(filtered_hospitals, title=title, flat=flat))
            sections.append(
                {
                    "title": "Network codes (from the list)",
                    "items": [
                        {"label": f"{code} – {label}", "detail": "Codes appear next to each facility in the DHMS network PDF."}
                        for code, label in sorted(NETWORK_LABELS.items())
                    ],
                }
            )
            snippet = get_document_snippet(
                "hospital_network",
                [hospital_params.province.lower(), "hospital", "network"],
            )
            if snippet:
                source_snippets.append(snippet)
            hospital_directory_province = hospital_params.province
        else:
            hospital_directory_prompt = True
            provinces = sorted({row["province"] for row in HOSPITAL_RECORDS})

            # When specific networks are known, show their overview before the province picker.
            if hospital_params.networks:
                relevant_networks = [
                    n for n in KNOWLEDGE_BASE["hospital_networks"]
                    if n["code"] in hospital_params.networks
                ]
                if relevant_networks:
                    sections.append(
                        {
                            "title": "Your plan's hospital networks",
                            "items": [
                                {"label": f"{n['code']} – {n['name']}", "detail": n["description"]}
                                for n in relevant_networks
                            ],
                        }
                    )
                net_names = _network_display_names(hospital_params.networks)
                sections.append(
                    {
                        "title": "Select a province to list hospitals",
                        "items": [
                            {
                                "label": prov.title(),
                                "detail": f'Try: "{net_names} hospitals in {prov.lower()}"',
                            }
                            for prov in provinces
                        ],
                    }
                )
            else:
                sections.append(
                    {
                        "title": "Hospital directory – choose a province",
                        "items": [
                            {
                                "label": prov.title(),
                                "detail": f'Try: "list all hospitals in {prov.lower()}" or "KeyCare hospitals in {prov.lower()}".',
                            }
                            for prov in provinces
                        ],
                    }
                )

            snippet = get_document_snippet("hospital_network", ["hospital", "network", "province"])
            if snippet:
                source_snippets.append(snippet)

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

    if intent == "hospital" and hospital_directory_province is None and not hospital_directory_prompt:
        sections.append(
            {
                "title": "Hospital networks (overview)",
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

    if hospital_directory_province:
        headline = (
            f"DHMS hospitals ({hospital_directory_province.title()}) · {display_condition}"
            if condition
            else f"DHMS hospital network directory – {hospital_directory_province.title()}"
        )
        summary = f"Facilities are parsed from the 2026 DHMS hospital network list for {hospital_directory_province.title()}."
    elif hospital_directory_prompt:
        if hospital_params_networks:
            net_names_str = _network_display_names(hospital_params_networks)
            headline = f"{net_names_str} – select a province"
            summary = (
                f"Your plan uses the {net_names_str}. "
                "Pick a province below to list all facilities, or include a province in your question above."
            )
        else:
            headline = "DHMS hospital directory"
            summary = "Ask with a province (for example Gauteng or Western Cape) to list facilities from the 2026 DHMS network PDF."
    else:
        headline = condition_data["title"] if condition_data else f"Support for {display_condition}"
        summary = (
            condition_data["summary"]
            if condition_data
            else "Authi uses the full PMB Chronic Disease List and benefit PDFs to guide members towards treatment baskets, formulary cover, and hospital-network information."
        )

    return {
        "intent": intent,
        "condition": condition,
        "headline": headline,
        "summary": summary,
        "sections": sections,
        "sources": source_snippets,
        "hints": response_hints,
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
    return ask_authi(request.query, explicit_network_codes=request.networkCodes or None)


@app.get("/api/hospitals/search")
def search_hospitals(
    province: str,
    network: str | None = None,
    networks: str | None = Query(
        None,
        description="Comma-separated network codes, e.g. S,D for Smart and Delta.",
    ),
    town: str | None = None,
    q: str | None = None,
    flat: bool = Query(False, description="If true, return one flat list instead of per-town sections."),
) -> dict[str, Any]:
    prov = canonical_province(province)
    if not prov:
        return {
            "error": "unknown_province",
            "message": "Pass a province such as gauteng, western cape, or kzn.",
            "knownProvinces": sorted({row["province"] for row in HOSPITAL_RECORDS}),
        }

    nets = merge_network_filters(networks, network)
    filtered = filter_hospital_records(
        HOSPITAL_RECORDS,
        province=prov,
        networks=nets,
        town_substring=town,
        name_substring=q,
    )
    title = f"Hospitals in {prov.title()}"
    if nets:
        title += f" (matching {', '.join(sorted(nets))})"
    if town:
        title += f" – {town.title()}"

    sections = build_hospital_sections(filtered, title=title, flat=flat)
    hints: list[str] = []
    if is_broad_keycare_network_filter(nets):
        sections = [keycare_broad_hint_section(), *sections]
        hints = keycare_broad_hint_strings()
    return {
        "province": prov,
        "networks": sorted(nets) if nets else None,
        "town": town,
        "nameQuery": q,
        "count": len(filtered),
        "sections": sections,
        "hints": hints,
    }
