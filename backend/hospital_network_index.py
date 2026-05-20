from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import fitz


PROVINCES: frozenset[str] = frozenset(
    {
        "GAUTENG",
        "EASTERN CAPE",
        "FREE STATE",
        "KWAZULU-NATAL",
        "LIMPOPO",
        "MPUMALANGA",
        "NORTH WEST",
        "NORTHERN CAPE",
        "WESTERN CAPE",
    }
)

# Short codes as printed next to each facility in the PDF.
NETWORK_LABELS: dict[str, str] = {
    "KH": "KeyCare Hospital Network",
    "KC": "KeyCare Casualty Hospitals",
    "KS": "KeyCare Start Hospital Network",
    "KR": "KeyCare Start Regional Hospital Network",
    "D": "Delta Hospital Network",
    "S": "Smart Hospital Network",
    "DS": "Dynamic Smart Hospital Network",
    "C": "Coastal Hospital Network",
}

# Broad “KeyCare” searches (plain “keycare” or `?network=keycare`) use all KeyCare-related codes on the list.
KEYCARE_BROAD_CODES: frozenset[str] = frozenset({"KH", "KC", "KS", "KR"})

_CODE_LINE_RE = re.compile(r"^[A-Z]{1,4}\*?$")

_PROVINCE_ALIASES: list[tuple[str, str]] = [
    ("kwazulu-natal", "KWAZULU-NATAL"),
    ("kwazulu natal", "KWAZULU-NATAL"),
    ("kzn", "KWAZULU-NATAL"),
    ("eastern cape", "EASTERN CAPE"),
    ("free state", "FREE STATE"),
    ("western cape", "WESTERN CAPE"),
    ("northern cape", "NORTHERN CAPE"),
    ("north west", "NORTH WEST"),
    ("mpumalanga", "MPUMALANGA"),
    ("limpopo", "LIMPOPO"),
    ("gauteng", "GAUTENG"),
]

_PROVINCE_QUERY_WORDS: frozenset[str] = frozenset(
    {alias for alias, _ in _PROVINCE_ALIASES}
    | {prov.lower() for prov in PROVINCES}
    | {"kzn", "kwa-zulu", "natal"}
)


def _clean_line(line: str) -> str:
    return line.replace("\u0007", "").replace("\x07", "").strip()


def _split_hospital_name(name: str) -> tuple[str, str]:
    """Separate a hospital name from its trailing parenthetical qualifier.

    "Netcare Milpark (cardiac electrophysiology centre – arrhythmia conditions only)"
    → ("Netcare Milpark", "cardiac electrophysiology centre – arrhythmia conditions only")

    Names with no qualifying parenthetical are returned unchanged with an empty qualifier.
    """
    m = re.match(r"^(.*?)\s*\(([^(]+)\)\s*$", name.strip())
    if m:
        base = m.group(1).strip()
        qualifier = m.group(2).strip()
        if base:
            return base, qualifier
    return name.strip(), ""


def _looks_like_hospital_name(line: str) -> bool:
    if len(line) >= 42:
        return True
    lowered = line.lower()
    if re.match(
        r"(?i)^(mediclinic|netcare|life|lenmed|busamed|clinix|jmh|melomed|arwyp|medic|optimed)\b",
        line,
    ):
        return True
    needles = (
        "hospital",
        "clinic",
        "centre",
        "center",
        "medical",
        "memorial",
        "maternity",
        "private",
        "pasteur",
        "laser",
        "eye",
        "academy",
        "glynnwood",
        "waterfall",
        "pinehaven",
        "donald gordon",
        "wits ",
        "oxford",
        "matseke",
        "themba",
        "naledi",
        "botshelong",
        "pholoso",
    )
    return any(n in lowered for n in needles)


def _iter_pdf_lines(pdf_path: Path) -> list[str]:
    doc = fitz.open(pdf_path)
    lines: list[str] = []
    for page in doc:
        for raw in page.get_text("text").splitlines():
            s = _clean_line(raw)
            if s:
                lines.append(s)
    doc.close()
    return lines


def parse_hospital_network_pdf(pdf_path: Path) -> list[dict[str, Any]]:
    """
    Parse DHMS hospital network list PDF into rows:
    { province, town, hospital, networks: [codes], network_labels: [...] }
    """
    lines = _iter_pdf_lines(pdf_path)
    try:
        start = next(i for i, line in enumerate(lines) if line in PROVINCES)
    except StopIteration:
        return []

    records: list[dict[str, Any]] = []
    current_province: str | None = None
    current_town: str | None = None
    i = start

    def is_code(value: str) -> bool:
        return bool(_CODE_LINE_RE.match(value))

    while i < len(lines):
        line = lines[i]

        if line in PROVINCES:
            current_province = line
            current_town = None
            i += 1
            continue

        if current_province is None:
            i += 1
            continue

        if current_town is None:
            if is_code(line):
                i += 1
                continue
            current_town = line
            i += 1
            continue

        if line in PROVINCES:
            current_province = line
            current_town = None
            i += 1
            continue

        if _looks_like_hospital_name(line):
            hospital = line
            i += 1
            # Join continuation lines when the PDF wraps a long name with an
            # unclosed parenthesis across two lines, e.g.:
            #   "Netcare Milpark (cardiac electrophysiology"
            #   "centre – arrhythmia conditions only)"
            while (
                i < len(lines)
                and not is_code(lines[i])
                and lines[i] not in PROVINCES
                and hospital.count("(") > hospital.count(")")
            ):
                hospital = hospital + " " + lines[i]
                i += 1
            codes: list[str] = []
            while i < len(lines) and is_code(lines[i]):
                codes.append(lines[i].replace("*", ""))
                i += 1
            labels = [NETWORK_LABELS.get(c, c) for c in codes]
            records.append(
                {
                    "province": current_province,
                    "town": current_town,
                    "hospital": hospital,
                    "networks": codes,
                    "network_labels": labels,
                }
            )
            continue

        if is_code(line):
            i += 1
            continue

        current_town = line
        i += 1

    return records


def _normalize_query(value: str) -> str:
    return " ".join(value.lower().split())


def resolve_province_from_query(query: str) -> str | None:
    q = _normalize_query(query)
    for alias, canonical in _PROVINCE_ALIASES:
        if alias in q:
            return canonical
    for prov in sorted(PROVINCES, key=len, reverse=True):
        if prov.lower() in q:
            return prov
    return None


def resolve_network_codes_from_query(query: str) -> frozenset[str] | None:
    """
    Return a set of network codes to filter by, or None for no network filter.

    None means: show all networks for each hospital in the result set.
    Accumulates ALL matched networks so that queries mentioning both Smart and
    Delta (for example) return {S, D} rather than stopping at the first match.
    """
    q = _normalize_query(query)
    matched: set[str] = set()

    # Specific multi-word phrases take precedence over their single-word parents.
    if "dynamic smart" in q or "ds network" in q:
        matched.add("DS")
    if "keycare start regional" in q or "start regional" in q:
        matched.add("KR")
    if "keycare casualty" in q or ("casualty" in q and "keycare" in q):
        matched.add("KC")
    if "keycare hospital" in q or ("keycare" in q and "planned" in q):
        matched.add("KH")
    # "keycare start" without "regional" → KS only
    if "keycare start" in q and "keycare start regional" not in q and "start regional" not in q:
        matched.add("KS")
    # Bare "keycare" without any specific sub-type → all KeyCare codes
    if "keycare" in q and not matched.intersection({"KH", "KC", "KS", "KR"}):
        matched.update({"KH", "KC", "KS", "KR"})
    if "delta" in q:
        matched.add("D")
    if "coastal" in q:
        matched.add("C")
    # "smart" without "dynamic smart" → S
    if "smart" in q and "dynamic smart" not in q:
        matched.add("S")

    # Explicit uppercase code tokens like "KH", "DS"
    for code in NETWORK_LABELS:
        if re.search(rf"\b{re.escape(code.lower())}\b", q):
            matched.add(code)

    return frozenset(matched) if matched else None


def is_broad_keycare_network_filter(networks: frozenset[str] | None) -> bool:
    return networks is not None and networks == KEYCARE_BROAD_CODES


def keycare_broad_hint_section() -> dict[str, Any]:
    return {
        "title": "About this KeyCare search",
        "items": [
            {
                "label": "Why you see KH, KC, KS, and KR together",
                "detail": (
                    "When you only say “KeyCare”, we match any KeyCare-related code that appears on the DHMS list: "
                    "KH (KeyCare Hospital / planned network hospitals), KC (KeyCare casualty where listed), "
                    "KS (KeyCare Start), and KR (KeyCare Start Regional). "
                    'For only planned hospital-network facilities, ask for the “KeyCare hospital network” (KH only).'
                ),
            },
            {
                "label": "How to read each row",
                "detail": (
                    "Each facility lists every network code printed beside it in the PDF; one hospital can show several codes. "
                    "Always confirm your plan option and the latest PDF before a planned admission."
                ),
            },
        ],
    }


def keycare_broad_hint_strings() -> list[str]:
    """Short strings for clients that render a hint strip instead of sections."""
    sec = keycare_broad_hint_section()
    return [item["label"] + ": " + item["detail"] for item in sec["items"]]


def resolve_town_filter(query: str) -> str | None:
    q = _normalize_query(query)
    # Very light town extraction: "in johannesburg", "in pretoria"
    matches = list(re.finditer(r"\bin\s+([a-z][a-z\s'-]{2,40})\b", q))
    if not matches:
        return None
    noise = ("the", "a", "hospital", "hospitals", "network", "networks", "list", "show", "find", "which", "where")
    for m in reversed(matches):
        town = m.group(1).strip()
        if town in noise:
            continue
        if town in _PROVINCE_QUERY_WORDS:
            continue
        parts = town.split()
        if parts and parts[0] in _PROVINCE_QUERY_WORDS:
            # Avoid capturing "gauteng flat list" after "in ...".
            continue
        if len(parts) > 3:
            continue
        return " ".join(parts)
    return None


def wants_hospital_directory(query: str) -> bool:
    q = _normalize_query(query)
    if any(w in q for w in ("hospital", "hospitals", "facility", "facilities", "network list", "network hospitals")):
        return True
    if resolve_province_from_query(query) and any(w in q for w in ("list", "which", "where", "find", "show", "search")):
        return True
    if resolve_province_from_query(query) and any(w in q for w in ("keycare", "delta", "smart", "coastal", "dynamic")):
        return True
    return False


def canonical_province(value: str | None) -> str | None:
    if not value:
        return None
    trimmed = value.strip()
    if not trimmed:
        return None
    q = _normalize_query(trimmed)
    for alias, canonical in _PROVINCE_ALIASES:
        if q == alias:
            return canonical
    for prov in PROVINCES:
        if prov.lower() == q:
            return prov
    return resolve_province_from_query(trimmed)


def parse_network_filter(value: str | None) -> frozenset[str] | None:
    if not value:
        return None
    token = value.strip()
    if not token:
        return None
    upper = token.upper()
    if upper in NETWORK_LABELS:
        return frozenset({upper})
    return resolve_network_codes_from_query(token)


def parse_networks_filter(value: str | None) -> frozenset[str] | None:
    """Parse comma-separated network codes (e.g. S,D or KH,KC)."""
    if not value:
        return None
    tokens = [t.strip() for t in value.split(",") if t.strip()]
    if not tokens:
        return None
    matched: set[str] = set()
    for token in tokens:
        upper = token.upper()
        if upper in NETWORK_LABELS:
            matched.add(upper)
            continue
        resolved = resolve_network_codes_from_query(token)
        if resolved:
            matched.update(resolved)
    return frozenset(matched) if matched else None


def merge_network_filters(
    networks_param: str | None,
    network_param: str | None,
) -> frozenset[str] | None:
    """Combine `networks` (comma-separated) and legacy single `network` query params."""
    from_networks = parse_networks_filter(networks_param)
    from_network = parse_network_filter(network_param)
    if from_networks is None and from_network is None:
        return None
    if from_networks is None:
        return from_network
    if from_network is None:
        return from_networks
    return from_networks | from_network


def filter_hospital_records(
    records: list[dict[str, Any]],
    *,
    province: str | None,
    networks: frozenset[str] | None,
    town_substring: str | None,
    name_substring: str | None,
) -> list[dict[str, Any]]:
    out = list(records)
    if province:
        out = [r for r in out if r["province"] == province]
    if town_substring:
        needle = town_substring.lower()
        out = [r for r in out if needle in r["town"].lower()]
    if name_substring:
        needle = name_substring.lower()
        out = [r for r in out if needle in r["hospital"].lower()]
    if networks is not None:
        out = [r for r in out if networks.intersection(r["networks"])]
    return out


def format_network_detail(codes: list[str]) -> str:
    parts: list[str] = []
    for code in codes:
        label = NETWORK_LABELS.get(code, code)
        parts.append(f"{label} ({code})")
    return "; ".join(parts)


def build_hospital_sections(
    records: list[dict[str, Any]],
    *,
    title: str,
    max_items: int = 400,
    flat: bool = False,
) -> list[dict[str, Any]]:
    if not records:
        return [
            {
                "title": title,
                "items": [
                    {
                        "label": "No matching hospitals",
                        "detail": "Try another province, network, or town — or check spelling.",
                    }
                ],
            }
        ]

    def _make_item(r: dict[str, Any], label_prefix: str = "") -> dict[str, Any]:
        clean_name, qualifier = _split_hospital_name(r["hospital"])
        network_detail = format_network_detail(r["networks"])
        detail = f"{network_detail} · {qualifier}" if qualifier else network_detail
        label = f"{label_prefix}{clean_name}" if label_prefix else clean_name
        return {
            "label": label,
            "detail": detail,
            "address": f"{clean_name}, {r['town']}, South Africa",
        }

    trimmed = records[:max_items]
    if flat:
        return [
            {
                "title": title,
                "items": [
                    _make_item(r, label_prefix=f"{r['town']} – ")
                    for r in sorted(trimmed, key=lambda r: (r["town"].lower(), r["hospital"].lower()))
                ],
            }
        ]

    towns: dict[str, list[dict[str, Any]]] = {}
    for r in trimmed:
        towns.setdefault(r["town"], []).append(r)

    sections: list[dict[str, Any]] = []
    for town in sorted(towns.keys(), key=lambda s: s.lower()):
        items = [
            _make_item(r)
            for r in sorted(towns[town], key=lambda x: x["hospital"].lower())
        ]
        sections.append({"title": f"{title} – {town}", "items": items})

    return sections


@dataclass(frozen=True)
class HospitalSearchParams:
    province: str | None
    networks: frozenset[str] | None
    town: str | None
    name_query: str | None


def parse_hospital_search_params(query: str) -> HospitalSearchParams:
    q = _normalize_query(query)
    province = resolve_province_from_query(query)
    networks = resolve_network_codes_from_query(query)
    town = resolve_town_filter(query)

    name_query: str | None = None
    # If user didn't specify a structured town filter, allow trailing free text as hospital name search.
    # (Mostly useful for /api/hospitals/search?q=Netcare)
    if len(q.split()) >= 2 and not town:
        # keep conservative: only when they say "called" / "named" / "netcare" brand etc.
        m = re.search(r"\b(called|named)\s+(.{3,60})$", q)
        if m:
            name_query = m.group(2).strip()

    return HospitalSearchParams(
        province=province,
        networks=networks,
        town=town,
        name_query=name_query,
    )
