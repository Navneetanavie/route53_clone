from __future__ import annotations

from typing import List, Optional, Tuple

from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.models.dns_record import DnsRecord


class DnsRecordRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(
        self,
        zone_id: int,
        page: int,
        page_size: int,
        search: Optional[str],
        record_type: Optional[str],
        sort_by: str,
        sort_order: str,
    ) -> Tuple[List[DnsRecord], int]:
        query = self.db.query(DnsRecord).filter(DnsRecord.hosted_zone_id == zone_id)

        if search:
            query = query.filter(DnsRecord.name.ilike(f"%{search}%"))

        if record_type:
            query = query.filter(DnsRecord.type == record_type.upper())

        total = query.count()

        sort_column = {
            "name": DnsRecord.name,
            "type": DnsRecord.type,
            "ttl": DnsRecord.ttl,
            "created_at": DnsRecord.created_at,
        }.get(sort_by, DnsRecord.name)

        order_fn = desc if sort_order == "desc" else asc
        query = query.order_by(order_fn(sort_column))

        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
        return items, total

    def get_by_id(self, record_id: int) -> Optional[DnsRecord]:
        return self.db.query(DnsRecord).filter(DnsRecord.id == record_id).first()

    def create(
        self,
        zone_id: int,
        name: str,
        record_type: str,
        ttl: int,
        value: str,
        routing_policy: str,
        comment: Optional[str],
    ) -> DnsRecord:
        record = DnsRecord(
            hosted_zone_id=zone_id,
            name=name,
            type=record_type,
            ttl=ttl,
            value=value,
            routing_policy=routing_policy,
            comment=comment,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def update(
        self,
        record: DnsRecord,
        name: Optional[str],
        record_type: Optional[str],
        ttl: Optional[int],
        value: Optional[str],
        routing_policy: Optional[str],
        comment: Optional[str],
    ) -> DnsRecord:
        if name is not None:
            record.name = name
        if record_type is not None:
            record.type = record_type
        if ttl is not None:
            record.ttl = ttl
        if value is not None:
            record.value = value
        if routing_policy is not None:
            record.routing_policy = routing_policy
        if comment is not None:
            record.comment = comment
        self.db.commit()
        self.db.refresh(record)
        return record

    def delete(self, record: DnsRecord) -> None:
        self.db.delete(record)
        self.db.commit()

    def get_all_by_zone_id(self, zone_id: int) -> List[DnsRecord]:
        return (
            self.db.query(DnsRecord)
            .filter(DnsRecord.hosted_zone_id == zone_id)
            .order_by(DnsRecord.name.asc())
            .all()
        )

    def delete_many(self, record_ids: List[int], zone_id: int) -> int:
        count = (
            self.db.query(DnsRecord)
            .filter(
                DnsRecord.id.in_(record_ids),
                DnsRecord.hosted_zone_id == zone_id,
            )
            .delete(synchronize_session=False)
        )
        self.db.commit()
        return count

    def count_by_ids_in_zone(self, record_ids: List[int], zone_id: int) -> int:
        return (
            self.db.query(DnsRecord)
            .filter(
                DnsRecord.id.in_(record_ids),
                DnsRecord.hosted_zone_id == zone_id,
            )
            .count()
        )
