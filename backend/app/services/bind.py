from __future__ import annotations

from typing import List, Optional, TypedDict

from app.models.dns_record import RECORD_TYPES


class ParsedRecord(TypedDict):
    name: str
    type: str
    ttl: int
    value: str


def _strip_comment(line: str) -> str:
    if ";" in line:
        return line[: line.index(";")].strip()
    return line.strip()


def parse_bind_zone(content: str, zone_name: str = "") -> List[ParsedRecord]:
    """Parse a BIND zone file into record dicts."""
    records: List[ParsedRecord] = []
    origin = zone_name if zone_name.endswith(".") else f"{zone_name}." if zone_name else ""
    default_ttl = 300

    for raw_line in content.splitlines():
        line = _strip_comment(raw_line)
        if not line:
            continue

        upper = line.upper()
        if upper.startswith("$ORIGIN"):
            parts = line.split(None, 1)
            if len(parts) > 1:
                origin = parts[1].strip()
                if not origin.endswith("."):
                    origin += "."
            continue
        if upper.startswith("$TTL"):
            parts = line.split(None, 1)
            if len(parts) > 1 and parts[1].strip().isdigit():
                default_ttl = int(parts[1].strip())
            continue
        if line.startswith("$"):
            continue

        parts = line.split()
        if len(parts) < 3:
            continue

        idx = 0
        name = parts[idx]
        idx += 1

        ttl = default_ttl
        if idx < len(parts) and parts[idx].isdigit():
            ttl = int(parts[idx])
            idx += 1

        if idx < len(parts) and parts[idx].upper() == "IN":
            idx += 1

        if idx >= len(parts):
            continue

        record_type = parts[idx].upper()
        idx += 1
        value = " ".join(parts[idx:]).strip()

        if not value:
            continue

        if name == "@":
            name = origin.rstrip(".") if origin else zone_name.rstrip(".")
        elif name.endswith("."):
            name = name.rstrip(".")
        elif origin:
            name = f"{name}.{origin.rstrip('.')}"

        if record_type not in RECORD_TYPES:
            continue

        records.append({"name": name, "type": record_type, "ttl": ttl, "value": value})

    return records


def export_bind_zone(zone_name: str, records: list, default_ttl: int = 300) -> str:
    """Generate BIND zone file content from records."""
    origin = zone_name if zone_name.endswith(".") else f"{zone_name}."
    lines = [
        "; Exported from Route53 Clone",
        f"$ORIGIN {origin}",
        f"$TTL {default_ttl}",
        "",
    ]

    zone_base = origin.rstrip(".")
    for record in records:
        name = record.name if hasattr(record, "name") else record["name"]
        ttl = record.ttl if hasattr(record, "ttl") else record["ttl"]
        rtype = record.type if hasattr(record, "type") else record["type"]
        value = record.value if hasattr(record, "value") else record["value"]

        display_name = name
        if name == zone_base or name == zone_base + ".":
            display_name = "@"
        elif name.endswith(f".{zone_base}"):
            display_name = name[: -(len(zone_base) + 1)]
        elif name.endswith("."):
            display_name = name

        lines.append(f"{display_name}\t{ttl}\tIN\t{rtype}\t{value}")

    return "\n".join(lines) + "\n"
