from __future__ import annotations

import math
from typing import List, Optional

from sqlalchemy.orm import Session

from app.auth_utils import hash_password as hash_pw, verify_password as check_pw
from app.models.dns_record import RECORD_TYPES
from app.repositories.dns_record_repository import DnsRecordRepository
from app.repositories.hosted_zone_repository import HostedZoneRepository
from app.repositories.user_repository import UserRepository
from app.schemas import (
    DnsRecordCreate,
    DnsRecordResponse,
    DnsRecordUpdate,
    HostedZoneCreate,
    HostedZoneResponse,
    HostedZoneUpdate,
    PaginatedResponse,
)


def normalize_zone_name(name: str) -> str:
    name = name.strip()
    if name and not name.endswith("."):
        name = name + "."
    return name


def normalize_record_name(name: str) -> str:
    return name.strip()


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def verify_password(self, plain: str, hashed: str) -> bool:
        return check_pw(plain, hashed)

    def hash_password(self, password: str) -> str:
        return hash_pw(password)

    def authenticate(self, username: str, password: str) -> Optional[str]:
        user = self.repo.get_by_username(username)
        if not user or not self.verify_password(password, user.password_hash):
            return None
        return user.username


class HostedZoneService:
    def __init__(self, db: Session):
        self.repo = HostedZoneRepository(db)

    def list_zones(
        self,
        page: int,
        page_size: int,
        search: Optional[str],
        sort_by: str,
        sort_order: str,
    ) -> PaginatedResponse[HostedZoneResponse]:
        items, total = self.repo.list(page, page_size, search, sort_by, sort_order)
        responses = [
            HostedZoneResponse(
                id=zone.id,
                name=zone.name,
                comment=zone.comment,
                record_count=count,
                created_at=zone.created_at,
                updated_at=zone.updated_at,
            )
            for zone, count in items
        ]
        return PaginatedResponse(
            items=responses,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=max(1, math.ceil(total / page_size)) if total else 1,
        )

    def get_zone(self, zone_id: int) -> Optional[HostedZoneResponse]:
        zone = self.repo.get_by_id(zone_id)
        if not zone:
            return None
        return HostedZoneResponse(
            id=zone.id,
            name=zone.name,
            comment=zone.comment,
            record_count=self.repo.get_record_count(zone_id),
            created_at=zone.created_at,
            updated_at=zone.updated_at,
        )

    def create_zone(self, data: HostedZoneCreate) -> HostedZoneResponse:
        zone = self.repo.create(normalize_zone_name(data.name), data.comment)
        return HostedZoneResponse(
            id=zone.id,
            name=zone.name,
            comment=zone.comment,
            record_count=0,
            created_at=zone.created_at,
            updated_at=zone.updated_at,
        )

    def update_zone(
        self, zone_id: int, data: HostedZoneUpdate
    ) -> Optional[HostedZoneResponse]:
        zone = self.repo.get_by_id(zone_id)
        if not zone:
            return None
        name = normalize_zone_name(data.name) if data.name is not None else None
        updated = self.repo.update(zone, name, data.comment)
        return HostedZoneResponse(
            id=updated.id,
            name=updated.name,
            comment=updated.comment,
            record_count=self.repo.get_record_count(zone_id),
            created_at=updated.created_at,
            updated_at=updated.updated_at,
        )

    def delete_zone(self, zone_id: int) -> bool:
        zone = self.repo.get_by_id(zone_id)
        if not zone:
            return False
        self.repo.delete(zone)
        return True

    def export_json(self, zone_id: int) -> Optional[dict]:
        zone = self.get_zone(zone_id)
        if not zone:
            return None
        from app.repositories.dns_record_repository import DnsRecordRepository

        record_repo = DnsRecordRepository(self.repo.db)
        records = record_repo.get_all_by_zone_id(zone_id)
        return {
            "hosted_zone": zone,
            "records": [DnsRecordResponse.model_validate(r) for r in records],
        }

    def export_bind(self, zone_id: int) -> Optional[str]:
        zone = self.repo.get_by_id(zone_id)
        if not zone:
            return None
        from app.repositories.dns_record_repository import DnsRecordRepository
        from app.services.bind import export_bind_zone

        record_repo = DnsRecordRepository(self.repo.db)
        records = record_repo.get_all_by_zone_id(zone_id)
        return export_bind_zone(zone.name, records)


class DnsRecordService:
    def __init__(self, db: Session):
        self.repo = DnsRecordRepository(db)
        self.zone_repo = HostedZoneRepository(db)

    def _validate_type(self, record_type: str) -> str:
        upper = record_type.upper()
        if upper not in RECORD_TYPES:
            raise ValueError(
                f"Invalid record type. Must be one of: {', '.join(sorted(RECORD_TYPES))}"
            )
        return upper

    def list_records(
        self,
        zone_id: int,
        page: int,
        page_size: int,
        search: Optional[str],
        record_type: Optional[str],
        sort_by: str,
        sort_order: str,
    ) -> Optional[PaginatedResponse[DnsRecordResponse]]:
        if not self.zone_repo.get_by_id(zone_id):
            return None
        items, total = self.repo.list(
            zone_id, page, page_size, search, record_type, sort_by, sort_order
        )
        return PaginatedResponse(
            items=[DnsRecordResponse.model_validate(r) for r in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=max(1, math.ceil(total / page_size)) if total else 1,
        )

    def create_record(
        self, zone_id: int, data: DnsRecordCreate
    ) -> Optional[DnsRecordResponse]:
        if not self.zone_repo.get_by_id(zone_id):
            return None
        record_type = self._validate_type(data.type)
        record = self.repo.create(
            zone_id,
            normalize_record_name(data.name),
            record_type,
            data.ttl,
            data.value,
            data.routing_policy,
            data.comment,
        )
        return DnsRecordResponse.model_validate(record)

    def update_record(
        self, record_id: int, data: DnsRecordUpdate
    ) -> Optional[DnsRecordResponse]:
        record = self.repo.get_by_id(record_id)
        if not record:
            return None
        record_type = self._validate_type(data.type) if data.type is not None else None
        name = normalize_record_name(data.name) if data.name is not None else None
        updated = self.repo.update(
            record, name, record_type, data.ttl, data.value, data.routing_policy, data.comment
        )
        return DnsRecordResponse.model_validate(updated)

    def delete_record(self, record_id: int) -> bool:
        record = self.repo.get_by_id(record_id)
        if not record:
            return False
        self.repo.delete(record)
        return True

    def bulk_delete_records(self, zone_id: int, record_ids: List[int]) -> Optional[int]:
        if not self.zone_repo.get_by_id(zone_id):
            return None
        matching = self.repo.count_by_ids_in_zone(record_ids, zone_id)
        if matching != len(record_ids):
            raise ValueError("One or more record IDs are invalid or do not belong to this zone")
        return self.repo.delete_many(record_ids, zone_id)

    def import_bind(self, zone_id: int, content: str) -> Optional[dict]:
        zone = self.zone_repo.get_by_id(zone_id)
        if not zone:
            return None

        from app.services.bind import parse_bind_zone

        parsed = parse_bind_zone(content, zone.name)
        imported = 0
        skipped = 0
        errors: List[str] = []

        for entry in parsed:
            try:
                record_type = self._validate_type(entry["type"])
                self.repo.create(
                    zone_id,
                    normalize_record_name(entry["name"]),
                    record_type,
                    entry["ttl"],
                    entry["value"],
                    "Simple",
                    None,
                )
                imported += 1
            except ValueError as e:
                skipped += 1
                errors.append(f"{entry['name']} {entry['type']}: {e}")
            except Exception as e:
                skipped += 1
                errors.append(f"{entry['name']} {entry['type']}: {str(e)}")

        return {"imported": imported, "skipped": skipped, "errors": errors}

    def get_all_records(self, zone_id: int) -> Optional[List[DnsRecordResponse]]:
        if not self.zone_repo.get_by_id(zone_id):
            return None
        records = self.repo.get_all_by_zone_id(zone_id)
        return [DnsRecordResponse.model_validate(r) for r in records]
