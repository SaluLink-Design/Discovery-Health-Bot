"""Hospital and town coordinates for distance sorting."""
from __future__ import annotations

import json
import math
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

from backend.hospital_network_index import _split_hospital_name

ROOT = Path(__file__).resolve().parent.parent
COORDS_JSON = Path(__file__).resolve().parent / "data" / "hospital_coordinates.json"

PROVINCE_CENTROIDS: dict[str, tuple[float, float]] = {
    "GAUTENG": (-26.2708, 28.1123),
    "KWAZULU-NATAL": (-29.6006, 30.3794),
    "WESTERN CAPE": (-33.9249, 18.4241),
    "EASTERN CAPE": (-32.2968, 26.4194),
    "FREE STATE": (-29.0852, 26.1596),
    "MPUMALANGA": (-25.5653, 30.5279),
    "LIMPOPO": (-23.9045, 29.4689),
    "NORTH WEST": (-26.6639, 25.2837),
    "NORTHERN CAPE": (-28.7282, 24.7499),
}

TOWN_COORDS: dict[tuple[str, str], tuple[float, float]] = {
    ("EASTERN CAPE", "east london"): (-33.0153, 27.9116),
    ("EASTERN CAPE", "mthatha"): (-31.5889, 28.7844),
    ("EASTERN CAPE", "port elizabeth"): (-33.9608, 25.6022),
    ("EASTERN CAPE", "queenstown"): (-31.8976, 26.8753),
    ("EASTERN CAPE", "uitenhage"): (-33.7576, 25.3971),
    ("FREE STATE", "bethlehem"): (-28.2308, 28.3071),
    ("FREE STATE", "bloemfontein"): (-29.0852, 26.1596),
    ("FREE STATE", "harrismith"): (-28.2723, 29.1295),
    ("FREE STATE", "kroonstad"): (-27.6506, 27.2340),
    ("FREE STATE", "sasolburg"): (-26.8136, 27.8172),
    ("FREE STATE", "welkom"): (-27.9774, 26.7351),
    ("GAUTENG", "alberton"): (-26.2678, 28.1222),
    ("GAUTENG", "benoni"): (-26.1885, 28.3206),
    ("GAUTENG", "brakpan"): (-26.2365, 28.3696),
    ("GAUTENG", "centurion"): (-25.8601, 28.1881),
    ("GAUTENG", "germiston"): (-26.2309, 28.1696),
    ("GAUTENG", "heidelberg"): (-26.5056, 28.3610),
    ("GAUTENG", "johannesburg"): (-26.2041, 28.0473),
    ("GAUTENG", "kempton park"): (-26.1006, 28.2301),
    ("GAUTENG", "krugersdorp"): (-26.0856, 27.7750),
    ("GAUTENG", "lenasia"): (-26.3328, 27.8544),
    ("GAUTENG", "mabopane"): (-25.4981, 28.0997),
    ("GAUTENG", "midrand"): (-25.9992, 28.1262),
    ("GAUTENG", "pretoria"): (-25.7479, 28.2293),
    ("GAUTENG", "randburg"): (-26.0938, 28.0061),
    ("GAUTENG", "randfontein"): (-26.1772, 27.7028),
    ("GAUTENG", "roodepoort"): (-26.1625, 27.8725),
    ("GAUTENG", "saxonwold"): (-26.1486, 28.0397),
    ("GAUTENG", "soshanguve"): (-25.4729, 28.1065),
    ("GAUTENG", "soweto"): (-26.2678, 27.8585),
    ("GAUTENG", "springs"): (-26.2548, 28.4421),
    ("GAUTENG", "tembisa"): (-25.9969, 28.2268),
    ("GAUTENG", "vanderbijlpark"): (-26.7118, 27.8376),
    ("GAUTENG", "vereeniging"): (-26.6731, 27.9265),
    ("GAUTENG", "vosloorus"): (-26.3347, 28.1816),
    ("KWAZULU-NATAL", "amanzimtoti"): (-30.0527, 30.8837),
    ("KWAZULU-NATAL", "ballito"): (-29.5391, 31.2130),
    ("KWAZULU-NATAL", "chatsworth"): (-29.9181, 30.8734),
    ("KWAZULU-NATAL", "durban"): (-29.8587, 31.0218),
    ("KWAZULU-NATAL", "empangeni"): (-28.7615, 31.8987),
    ("KWAZULU-NATAL", "isipingo"): (-30.0012, 30.9433),
    ("KWAZULU-NATAL", "kokstad"): (-30.5474, 29.4241),
    ("KWAZULU-NATAL", "ladysmith"): (-28.5615, 29.7795),
    ("KWAZULU-NATAL", "newcastle"): (-27.7574, 29.9321),
    ("KWAZULU-NATAL", "phoenix"): (-29.6924, 31.0052),
    ("KWAZULU-NATAL", "pietermaritzburg"): (-29.6006, 30.3794),
    ("KWAZULU-NATAL", "pinetown"): (-29.8136, 30.8615),
    ("KWAZULU-NATAL", "port shepstone"): (-30.7414, 30.4551),
    ("KWAZULU-NATAL", "richards bay"): (-28.7830, 32.0377),
    ("KWAZULU-NATAL", "sydenham"): (-29.8428, 30.9983),
    ("KWAZULU-NATAL", "tongaat"): (-29.5736, 31.1064),
    ("KWAZULU-NATAL", "umhlanga"): (-29.7263, 31.0879),
    ("LIMPOPO", "lephalale"): (-23.6783, 27.7486),
    ("LIMPOPO", "polokwane"): (-23.9045, 29.4689),
    ("LIMPOPO", "thabazimbi"): (-24.5917, 27.4115),
    ("LIMPOPO", "tzaneen"): (-23.8335, 30.1635),
    ("MPUMALANGA", "barberton"): (-25.7881, 31.0539),
    ("MPUMALANGA", "emalahleni"): (-25.8728, 29.2332),
    ("MPUMALANGA", "ermelo"): (-26.5333, 29.9833),
    ("MPUMALANGA", "mbombela"): (-25.4753, 30.9694),
    ("MPUMALANGA", "middelburg"): (-25.7751, 29.4648),
    ("MPUMALANGA", "piet retief"): (-27.0167, 30.8167),
    ("MPUMALANGA", "trichardt"): (-26.4833, 29.2000),
    ("NORTH WEST", "brits"): (-25.6344, 27.7802),
    ("NORTH WEST", "carletonville"): (-26.3603, 27.3967),
    ("NORTH WEST", "klerksdorp"): (-26.8525, 26.6630),
    ("NORTH WEST", "mahikeng"): (-25.8652, 25.6442),
    ("NORTH WEST", "potchefstroom"): (-26.7136, 27.0970),
    ("NORTH WEST", "rustenburg"): (-25.6672, 27.2423),
    ("NORTH WEST", "vryburg"): (-26.9570, 24.7284),
    ("NORTHERN CAPE", "kathu"): (-27.6937, 23.0493),
    ("NORTHERN CAPE", "kimberley"): (-28.7282, 24.7499),
    ("NORTHERN CAPE", "kuruman"): (-27.4524, 23.4325),
    ("NORTHERN CAPE", "upington"): (-28.4478, 21.2561),
    ("WESTERN CAPE", "bellville"): (-33.9000, 18.6292),
    ("WESTERN CAPE", "blouberg"): (-33.8167, 18.4833),
    ("WESTERN CAPE", "cape town"): (-33.9249, 18.4241),
    ("WESTERN CAPE", "claremont"): (-33.9806, 18.4653),
    ("WESTERN CAPE", "gatesville"): (-33.9500, 18.5167),
    ("WESTERN CAPE", "george"): (-33.9648, 22.4614),
    ("WESTERN CAPE", "hermanus"): (-34.4187, 19.2345),
    ("WESTERN CAPE", "kuils river"): (-34.0333, 18.8000),
    ("WESTERN CAPE", "milnerton"): (-33.8806, 18.4903),
    ("WESTERN CAPE", "mitchells plain"): (-34.0381, 18.6061),
    ("WESTERN CAPE", "mossel bay"): (-34.1830, 22.1460),
    ("WESTERN CAPE", "oudtshoorn"): (-33.5892, 22.2075),
    ("WESTERN CAPE", "paarl"): (-33.7342, 18.9612),
    ("WESTERN CAPE", "somerset west"): (-34.0781, 18.8436),
    ("WESTERN CAPE", "stellenbosch"): (-33.9321, 18.8602),
    ("WESTERN CAPE", "tokai"): (-34.0667, 18.4333),
    ("WESTERN CAPE", "west coast"): (-32.9767, 17.8756),
    ("WESTERN CAPE", "worcester"): (-33.6464, 19.4483),
}

# Suburb / facility keywords in hospital names → facility-level coordinates.
SUBURB_FROM_NAME: list[tuple[re.Pattern[str], tuple[float, float]]] = [
    (re.compile(r"fourways", re.I), (-25.9760, 28.0107)),
    (re.compile(r"sunninghill", re.I), (-26.0334, 28.0593)),
    (re.compile(r"milpark", re.I), (-26.1786, 28.0265)),
    (re.compile(r"morningside", re.I), (-26.0788, 28.0565)),
    (re.compile(r"park\s*lane", re.I), (-26.1495, 28.0412)),
    (re.compile(r"garden city", re.I), (-26.1830, 28.0055)),
    (re.compile(r"selby", re.I), (-26.2109, 28.0530)),
    (re.compile(r"brenthurst", re.I), (-26.1938, 28.0426)),
    (re.compile(r"donald gordon", re.I), (-26.1864, 28.0378)),
    (re.compile(r"linkwood", re.I), (-26.1453, 28.0710)),
    (re.compile(r"nelson mandela", re.I), (-26.1856, 28.0397)),
    (re.compile(r"waterfall", re.I), (-25.9120, 28.1280)),
    (re.compile(r"olivedale", re.I), (-26.0890, 28.0070)),
    (re.compile(r"unitas", re.I), (-25.8590, 28.1890)),
    (re.compile(r"midstream", re.I), (-25.9210, 28.1990)),
    (re.compile(r"faerie glen", re.I), (-25.7920, 28.3080)),
    (re.compile(r"groenkloof", re.I), (-25.7780, 28.2180)),
    (re.compile(r"wilgers", re.I), (-25.7520, 28.3180)),
    (re.compile(r"jakaranda", re.I), (-25.7280, 28.2280)),
    (re.compile(r"muelmed", re.I), (-25.7410, 28.2420)),
    (re.compile(r"medforum", re.I), (-25.7350, 28.1880)),
    (re.compile(r"femina", re.I), (-25.7380, 28.1950)),
    (re.compile(r"wilgeheuwel", re.I), (-26.1010, 27.8650)),
    (re.compile(r"flora", re.I), (-26.1480, 27.8720)),
    (re.compile(r"pinehaven", re.I), (-26.0880, 27.7680)),
    (re.compile(r"arwyp", re.I), (-26.1080, 28.2280)),
    (re.compile(r"umhlanga", re.I), (-29.7263, 31.0879)),
    (re.compile(r"gateway", re.I), (-29.7230, 31.0750)),
    (re.compile(r"st augustine", re.I), (-29.8550, 31.0120)),
    (re.compile(r"hillcrest", re.I), (-29.7780, 30.7580)),
    (re.compile(r"entabeni", re.I), (-29.8380, 31.0120)),
    (re.compile(r"westville", re.I), (-29.8380, 30.9280)),
    (re.compile(r"greenacres", re.I), (-33.9700, 25.5480)),
    (re.compile(r"christiaan barnard", re.I), (-33.9160, 18.4210)),
    (re.compile(r"kingsbury", re.I), (-33.9820, 18.4680)),
    (re.compile(r"vincent pallotti", re.I), (-33.9380, 18.4680)),
]

_JUNK_TOWN_RE = re.compile(
    r"keycare start|contact us|complaint|dispute|principal officer|take your query|rck_|view other",
    re.I,
)


def hospital_coord_key(province: str, hospital: str) -> str:
    name, _ = _split_hospital_name(hospital)
    slug = re.sub(r"[^a-z0-9]+", " ", name.lower()).strip()
    return f"{province.upper()}|{slug}"


@lru_cache(maxsize=1)
def _load_built_coords() -> dict[str, tuple[float, float]]:
    if not COORDS_JSON.is_file():
        return {}
    data = json.loads(COORDS_JSON.read_text())
    out: dict[str, tuple[float, float]] = {}
    for key, entry in data.get("hospitals", {}).items():
        out[key] = (float(entry["lat"]), float(entry["lng"]))
    return out


def resolve_town_coords(province: str | None, town: str | None) -> tuple[float, float] | None:
    if not province or not town:
        return None
    prov = province.upper()
    town_key = town.strip().lower()
    if _JUNK_TOWN_RE.search(town_key):
        return None
    direct = TOWN_COORDS.get((prov, town_key))
    if direct:
        return direct
    return PROVINCE_CENTROIDS.get(prov)


def _coords_from_name(hospital: str) -> tuple[float, float] | None:
    for pattern, coords in SUBURB_FROM_NAME:
        if pattern.search(hospital):
            return coords
    return None


def resolve_hospital_coords(record: dict[str, Any]) -> tuple[float, float, str] | None:
    province = record.get("province") or ""
    hospital = record.get("hospital") or ""
    town = record.get("town") or ""

    key = hospital_coord_key(province, hospital)
    built = _load_built_coords().get(key)
    if built:
        return built[0], built[1], "facility"

    from_name = _coords_from_name(hospital)
    if from_name:
        return from_name[0], from_name[1], "facility"

    town_coords = resolve_town_coords(province, town)
    if town_coords:
        return town_coords[0], town_coords[1], "town"

    pc = PROVINCE_CENTROIDS.get(province.upper())
    if pc:
        return pc[0], pc[1], "province"
    return None


def resolve_user_location(
    *,
    lat: float | None,
    lng: float | None,
    province: str | None,
    town: str | None,
) -> tuple[float, float, str] | None:
    if lat is not None and lng is not None:
        return lat, lng, "device"
    coords = resolve_town_coords(province, town)
    if coords:
        source = "profile_town" if town else "province"
        return coords[0], coords[1], source
    if province:
        pc = PROVINCE_CENTROIDS.get(province.upper())
        if pc:
            return pc[0], pc[1], "province"
    return None


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def record_distance_km(record: dict[str, Any], user_lat: float, user_lng: float) -> float:
    coords = resolve_hospital_coords(record)
    if not coords:
        return float("inf")
    return haversine_km(user_lat, user_lng, coords[0], coords[1])


def is_on_plan(record: dict[str, Any], plan_networks: frozenset[str] | None) -> bool:
    if plan_networks is None:
        return True
    return bool(plan_networks.intersection(record.get("networks") or []))


def _hospital_list_item(
    record: dict[str, Any],
    *,
    distance_km: float,
    on_plan: bool,
) -> dict[str, Any]:
    from backend.hospital_network_index import format_network_detail

    clean_name, qualifier = _split_hospital_name(record["hospital"])
    network_detail = format_network_detail(record["networks"])
    detail = f"{network_detail} · {qualifier}" if qualifier else network_detail
    town = record.get("town", "")
    return {
        "label": clean_name,
        "detail": detail,
        "address": f"{clean_name}, {town}, South Africa",
        "town": town,
        "distanceKm": round(distance_km, 1) if math.isfinite(distance_km) else None,
        "onPlan": on_plan,
    }


def build_nearby_hospital_results(
    records: list[dict[str, Any]],
    *,
    user_lat: float,
    user_lng: float,
    plan_networks: frozenset[str] | None,
    unrestricted: bool,
    limit_on: int = 3,
    limit_off: int = 3,
) -> dict[str, Any]:
    on_plan_rows: list[tuple[dict[str, Any], float]] = []
    off_plan_rows: list[tuple[dict[str, Any], float]] = []

    for record in records:
        if _JUNK_TOWN_RE.search(record.get("town") or ""):
            continue
        distance = record_distance_km(record, user_lat, user_lng)
        if not math.isfinite(distance):
            continue
        on_plan = unrestricted or is_on_plan(record, plan_networks)
        if on_plan:
            on_plan_rows.append((record, distance))
        elif plan_networks is not None and not unrestricted:
            off_plan_rows.append((record, distance))

    on_plan_rows.sort(key=lambda row: row[1])
    off_plan_rows.sort(key=lambda row: row[1])

    on_plan_items = [
        _hospital_list_item(r, distance_km=d, on_plan=True) for r, d in on_plan_rows[:limit_on]
    ]
    off_plan_items = [
        _hospital_list_item(r, distance_km=d, on_plan=False) for r, d in off_plan_rows[:limit_off]
    ]

    return {
        "onPlan": {
            "total": len(on_plan_rows),
            "count": len(on_plan_items),
            "items": on_plan_items,
        },
        "offPlan": {
            "total": len(off_plan_rows),
            "count": len(off_plan_items),
            "items": off_plan_items,
        },
    }
