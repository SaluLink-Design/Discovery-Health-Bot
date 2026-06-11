"""Build backend/data/hospital_coordinates.json from suburb patterns + town fallbacks."""
from __future__ import annotations

import json
import re
from pathlib import Path

from backend.hospital_geo import resolve_hospital_coords, hospital_coord_key
from backend.hospital_network_index import parse_hospital_network_pdf, _split_hospital_name

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "dhms-hospital-network-list.pdf"
OUT = ROOT / "backend" / "data" / "hospital_coordinates.json"

_JUNK = re.compile(
    r"keycare start|contact us|complaint|dispute|principal officer|take your query|rck_|view other|"
    r"^\d{2}\s*\||discovery health|financial services|healthcare provider on",
    re.I,
)


def main() -> None:
    records = parse_hospital_network_pdf(PDF)
    hospitals: dict[str, dict] = {}
    for record in records:
        if _JUNK.search(record.get("town") or "") or _JUNK.search(record.get("hospital") or ""):
            continue
        name, _ = _split_hospital_name(record["hospital"])
        if len(name) < 4 or name.startswith("("):
            continue
        key = hospital_coord_key(record["province"], record["hospital"])
        if key in hospitals:
            continue
        coords = resolve_hospital_coords(record)
        if not coords:
            continue
        hospitals[key] = {
            "lat": round(coords[0], 6),
            "lng": round(coords[1], 6),
            "source": coords[2],
            "label": name,
            "town": record["town"],
            "province": record["province"],
        }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"hospitals": hospitals}, indent=2))
    print(f"Wrote {len(hospitals)} hospital coordinates to {OUT}")


if __name__ == "__main__":
    main()
