from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import fitz


_R_AMOUNT_RE = re.compile(r"^R\d+\b", re.IGNORECASE)
_FOUR_DIGIT_RE = re.compile(r"\d{4}")
_FOUR_DIGIT_AT_START_RE = re.compile(r"^\d{4}")
_COUNT_RE = re.compile(r"^\d{1,2}$")
_MED_STRENGTH_RE = re.compile(
    r"\b(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|units)\b|\b\d+\s*dose\b|\b\d+/\d+\s*mg\b|\b\d+/\d+\b)",
    re.IGNORECASE,
)

_MEDICINE_NOISE_WORDS = frozenset({
    "procedure", "description", "number", "code", "test", "basket", "quantity",
    "diagnostic", "ongoing", "management", "formulary", "benefit", "schedule",
    "page", "continued", "table", "contents",
})


def _looks_like_medicine(line: str) -> bool:
    """Return True if a line looks like a medicine name worth capturing."""
    stripped = line.strip()
    if not stripped:
        return False
    if not any(c.isalpha() for c in stripped):
        return False
    if _R_AMOUNT_RE.match(stripped):
        return False
    if re.fullmatch(r"[\d\s\-/]+", stripped):
        return False
    lower = stripped.lower()
    if any(w in lower for w in _MEDICINE_NOISE_WORDS):
        return False
    # Skip very short strings that are likely column headers or noise
    if len(stripped) < 3:
        return False
    return True


@dataclass(frozen=True)
class TreatmentItem:
    desc: str
    code: str
    count: int
    item_type: str = "diagnostic"  # "diagnostic" | "ongoing"


# Exact strings that appear as standalone column-header lines in the treatment PDF.
# We reject these lines when collecting procedure descriptions to avoid mis-classification.
_TREATMENT_HEADER_LINES: frozenset[str] = frozenset({
    "PROCEDURE OR", "TEST DESCRIPTION", "PROCEDURE OR TEST DESCRIPTION",
    "PROCEDURE", "OR TEST CODE", "OR TEST", "OR TEST DESCRIPTION",
    "PROCEDURE OR TEST CODE", "CODE", "NUMBER OF", "PROCEDURES",
    "OR TESTS WE", "COVER", "ONGOING MANAGEMENT BASKET", "DIAGNOSTIC BASKET",
    "CONDITION", "TEST", "DESCRIPTION", "PROCEDURE CODE",
    "NUMBER OF PROCEDURES OR TESTS WE COVER",
})


def _iter_pdf_lines(pdf_path: Path) -> list[str]:
    doc = fitz.open(pdf_path)
    lines: list[str] = []
    for page in doc:
        page_lines = [line.strip() for line in page.get_text("text").splitlines()]
        lines.extend([line for line in page_lines if line])
    doc.close()
    return lines


def _normalize_condition_name(name: str) -> str:
    return (
        name.strip()
        .replace("’", "'")
        .replace("–", "-")
        .replace("‑", "-")
        .lower()
    )


# Official Chronic Disease List (CDL) PMB conditions (27 including HIV and chronic renal disease).
# We keep a canonical key for each condition, plus variants seen in PDFs.
_CDL_CANONICAL: dict[str, list[str]] = {
    "addison's disease": ["Addison's disease", "Addison’s disease"],
    "asthma": ["Asthma"],
    "bipolar mood disorder": ["Bipolar mood disorder", "Bipolar Mood Disorder"],
    "bronchiectasis": ["Bronchiectasis"],
    "cardiac failure": ["Cardiac failure", "Cardiac Failure"],
    "cardiomyopathy": ["Cardiomyopathy"],
    "chronic obstructive pulmonary disease": [
        "Chronic obstructive pulmonary disease",
        "Chronic obstructive pulmonary disorder",
        "disease (COPD)",
        "disease (COPD )",
        "COPD",
    ],
    "chronic renal disease": ["Chronic renal disease", "Chronic Renal Disease"],
    "coronary artery disease": ["Coronary artery disease", "Coronary Artery Disease"],
    "crohn's disease": ["Crohn's disease", "Crohn’s disease"],
    "diabetes insipidus": ["Diabetes insipidus", "Diabetes Insipidus"],
    "diabetes mellitus type 1": ["Diabetes mellitus type 1", "Diabetes Mellitus Type 1"],
    "diabetes mellitus type 2": ["Diabetes mellitus type 2", "Diabetes Mellitus Type 2"],
    # Some documents use a combined heading. We'll expand that into both types.
    "diabetes mellitus types 1 & 2": [
        "Diabetes mellitus types 1 & 2",
        "Diabetes mellitus types 1 and 2",
        "Diabetes mellitus types 1 & 2 ",
    ],
    "dysrhythmias": ["Dysrhythmias", "Dysrhythmia"],
    "epilepsy": ["Epilepsy"],
    "glaucoma": ["Glaucoma"],
    "haemophilia": ["Haemophilia"],
    "hiv": ["HIV", "HIV/AIDS", "HIV/Aids"],
    "hyperlipidaemia": ["Hyperlipidaemia", "Hyperlipidemia"],
    "hypertension": ["Hypertension"],
    "hypothyroidism": ["Hypothyroidism"],
    "multiple sclerosis": ["Multiple sclerosis", "Multiple Sclerosis"],
    "parkinson's disease": ["Parkinson's disease", "Parkinson’s disease"],
    "rheumatoid arthritis": ["Rheumatoid arthritis", "Rheumatoid Arthritis"],
    "schizophrenia": ["Schizophrenia"],
    "systemic lupus erythematosus": ["Systemic lupus erythematosus", "Systemic Lupus Erythematosus"],
    "ulcerative colitis": ["Ulcerative colitis", "Ulcerative Colitis"],
}


def _canonical_condition_keys() -> list[str]:
    keys = sorted(_CDL_CANONICAL.keys())
    return [k for k in keys if k != "diabetes mellitus types 1 & 2"]


_CDL_VARIANTS: dict[str, str] = {}
for key, variants in _CDL_CANONICAL.items():
    for variant in variants:
        _CDL_VARIANTS[_normalize_condition_name(variant)] = key


def _match_cdl_condition_heading(lines: list[str], i: int) -> tuple[list[str], int] | None:
    """
    Attempt to match a canonical CDL condition heading starting at `i`,
    allowing headings split across multiple lines (up to 3).

    Returns (keys, consumed_lines).
    """
    for consumed in (3, 2, 1):
        if i + consumed > len(lines):
            continue
        joined = " ".join(lines[i : i + consumed]).strip()
        joined_norm = _normalize_condition_name(joined)
        if joined_norm in _CDL_VARIANTS:
            key = _CDL_VARIANTS[joined_norm]
            if key == "diabetes mellitus types 1 & 2":
                return (["diabetes mellitus type 1", "diabetes mellitus type 2"], consumed)
            return ([key], consumed)
    return None


def discover_cdl_conditions_from_medicine_pdf(medicine_pdf_path: Path) -> dict[str, str]:
    """
    Discover condition headings from the Medicine List PDF using the official CDL list
    and confirming the table pattern:
    <Condition Heading>
    Rxxx
    Ryyy
    """
    lines = _iter_pdf_lines(medicine_pdf_path)
    discovered: dict[str, str] = {}

    i = 0
    while i < len(lines) - 2:
        match = _match_cdl_condition_heading(lines, i)
        if not match:
            i += 1
            continue

        keys, consumed = match
        r1_idx = i + consumed
        r2_idx = i + consumed + 1
        if r2_idx >= len(lines):
            i += 1
            continue
        if not (_R_AMOUNT_RE.match(lines[r1_idx]) and _R_AMOUNT_RE.match(lines[r2_idx])):
            i += 1
            continue

        display = " ".join(lines[i : i + consumed]).strip()
        for key in keys:
            discovered.setdefault(key, display)

        i += consumed + 2

    # Ensure we always have display labels for all canonical conditions.
    for key in _canonical_condition_keys():
        discovered.setdefault(key, key.title())

    return discovered


def build_medicine_index(medicine_pdf_path: Path) -> dict[str, list[dict[str, str]]]:
    """
    Build a per-condition medicine list from the formulary PDF.

    Output is intentionally lightweight: a list of medicine rows (label/detail).
    This is enough for UI display and avoids brittle table parsing.
    """
    condition_display = discover_cdl_conditions_from_medicine_pdf(medicine_pdf_path)
    condition_keys = set(_canonical_condition_keys())
    lines = _iter_pdf_lines(medicine_pdf_path)

    index: dict[str, list[dict[str, str]]] = {key: [] for key in condition_keys}
    pending_note: str | None = None
    current_keys: list[str] = []

    i = 0
    while i < len(lines):
        match = _match_cdl_condition_heading(lines, i)
        if match:
            keys, consumed = match
            r1_idx = i + consumed
            r2_idx = i + consumed + 1
            if r2_idx < len(lines) and _R_AMOUNT_RE.match(lines[r1_idx]) and _R_AMOUNT_RE.match(lines[r2_idx]):
                current_keys = [k for k in keys if k in condition_keys]
                pending_note = None
                i += consumed + 2
                continue

        if not current_keys:
            i += 1
            continue

        # Notes like "(Not available on KeyCare plans)"
        line = lines[i].strip()
        if line.startswith("(") and line.endswith(")"):
            pending_note = line.strip("()")
            i += 1
            continue

        # Capture medicine-name rows — generic names and strength-bearing lines alike
        if _looks_like_medicine(line):
            detail = "Formulary medicine (from the CIB medicine list)."
            if pending_note:
                detail = f"{detail} Note: {pending_note}."
            for key in current_keys:
                index[key].append({"label": line, "detail": detail})
            pending_note = None

        i += 1

    # De-dupe while preserving order.
    for condition, rows in index.items():
        seen: set[str] = set()
        deduped: list[dict[str, str]] = []
        for row in rows:
            if row["label"] in seen:
                continue
            seen.add(row["label"])
            deduped.append(row)
        index[condition] = deduped

    return index


def build_treatment_index(
    treatment_pdf_path: Path,
    condition_display: dict[str, str],
) -> dict[str, list[dict[str, str]]]:
    """
    Build a per-condition treatment basket index from the treatment baskets PDF.

    The PDF table has paired rows: each treatment appears twice — first with the
    diagnostic count, then with the ongoing management count.  We track occurrence
    order to label each item 'diagnostic' or 'ongoing'.

    Returns {conditionKey: [{label, detail, type, desc, code, count}]}
    """
    condition_keys = set(_canonical_condition_keys())
    lines = _iter_pdf_lines(treatment_pdf_path)

    index: dict[str, list[TreatmentItem]] = {key: [] for key in condition_keys}

    in_table = False
    current: str | None = None
    mirror_keys: list[str] = []
    # Track how many times each (desc, code) pair has appeared per condition
    occurrence_counter: dict[str, dict[tuple[str, str], int]] = {}
    i = 0

    while i < len(lines):
        line = lines[i].strip()
        upper = line.upper()
        header = re.sub(r"^\d+\s+", "", upper)
        if header == "DIAGNOSTIC BASKET":
            in_table = True
            current = None
            mirror_keys = []
            i += 1
            continue

        if in_table:
            match = _match_cdl_condition_heading(lines, i)
            if match:
                keys, consumed = match
                current = keys[0] if keys else None
                mirror_keys = [k for k in keys[1:] if k in condition_keys]
                # Reset occurrence counter when we move to a new condition.
                if current and current not in occurrence_counter:
                    occurrence_counter[current] = {}
                for mk in mirror_keys:
                    if mk not in occurrence_counter:
                        occurrence_counter[mk] = {}
                i += consumed
                continue

        if not in_table or current is None:
            i += 1
            continue

        # Collect description lines until we hit a 4-digit code or a count.
        desc_lines: list[str] = []
        while i < len(lines):
            cur = lines[i].strip()
            if _FOUR_DIGIT_AT_START_RE.match(cur) or _COUNT_RE.match(cur):
                break
            if _normalize_condition_name(cur) in condition_keys:
                break
            # Skip exact table column-header lines.
            if cur.upper() in _TREATMENT_HEADER_LINES:
                i += 1
                continue
            # Skip long boilerplate sentences (page footers / overview text).
            if len(cur) > 120:
                i += 1
                continue
            desc_lines.append(cur)
            i += 1

        if i >= len(lines) or _normalize_condition_name(lines[i]) in condition_keys:
            continue

        desc = " ".join([d for d in desc_lines if d]).strip()
        if not desc:
            i += 1
            continue

        if not _FOUR_DIGIT_AT_START_RE.match(lines[i]):
            i += 1
            continue

        # Collect code lines.
        code_lines: list[str] = []
        while i < len(lines) and not _COUNT_RE.match(lines[i]):
            if _normalize_condition_name(lines[i]) in condition_keys:
                break
            if not _FOUR_DIGIT_AT_START_RE.match(lines[i]) and not _FOUR_DIGIT_RE.search(lines[i]):
                break
            code_lines.append(lines[i].strip())
            i += 1

        if i >= len(lines) or not _COUNT_RE.match(lines[i]):
            continue

        count = int(lines[i])
        if count > 30:
            i += 1
            continue
        i += 1

        code = " ".join(code_lines).strip()

        # Determine type: first occurrence of (desc, code) = diagnostic, second = ongoing.
        pair = (desc, code)
        occ = occurrence_counter.setdefault(current, {})
        n = occ.get(pair, 0)
        occ[pair] = n + 1
        item_type = "diagnostic" if n == 0 else "ongoing"

        index[current].append(TreatmentItem(desc=desc, code=code, count=count, item_type=item_type))
        for mk in mirror_keys:
            mk_occ = occurrence_counter.setdefault(mk, {})
            mn = mk_occ.get(pair, 0)
            mk_occ[pair] = mn + 1
            mk_type = "diagnostic" if mn == 0 else "ongoing"
            index[mk].append(TreatmentItem(desc=desc, code=code, count=count, item_type=mk_type))

    # Convert and de-dupe (keeping both diagnostic and ongoing for the same desc+code).
    result: dict[str, list[dict[str, str]]] = {}
    for condition, items in index.items():
        seen: set[tuple[str, str, int, str]] = set()
        result[condition] = []
        for item in items:
            key_tuple = (item.desc, item.code, item.count, item.item_type)
            if key_tuple in seen:
                continue
            seen.add(key_tuple)
            result[condition].append(
                {
                    "label": f"{item.desc} ({item.code})",
                    "detail": f"Up to {item.count} time(s) per year (per the treatment basket).",
                    "type": item.item_type,
                    "desc": item.desc,
                    "code": item.code,
                    "count": item.count,
                }
            )
    return result

