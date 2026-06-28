from __future__ import annotations

from typing import List, Optional, Tuple

from sqlalchemy import asc, desc, func
from sqlalchemy.orm import Session

from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone


class HostedZoneRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(
        self,
        page: int,
        page_size: int,
        search: Optional[str],
        sort_by: str,
        sort_order: str,
    ) -> Tuple[List[Tuple[HostedZone, int]], int]:
        base_query = self.db.query(HostedZone)
        if search:
            base_query = base_query.filter(HostedZone.name.ilike(f"%{search}%"))

        total = base_query.count()

        sort_column = {
            "name": HostedZone.name,
            "created_at": HostedZone.created_at,
            "updated_at": HostedZone.updated_at,
        }.get(sort_by, HostedZone.name)

        order_fn = desc if sort_order == "desc" else asc
        zone_ids_query = base_query.order_by(order_fn(sort_column))
        offset = (page - 1) * page_size
        zones = zone_ids_query.offset(offset).limit(page_size).all()

        items: List[Tuple[HostedZone, int]] = []
        for zone in zones:
            count = (
                self.db.query(func.count(DnsRecord.id))
                .filter(DnsRecord.hosted_zone_id == zone.id)
                .scalar()
                or 0
            )
            items.append((zone, count))
        return items, total

    def get_by_id(self, zone_id: int) -> Optional[HostedZone]:
        return self.db.query(HostedZone).filter(HostedZone.id == zone_id).first()

    def get_record_count(self, zone_id: int) -> int:
        return (
            self.db.query(func.count(DnsRecord.id))
            .filter(DnsRecord.hosted_zone_id == zone_id)
            .scalar()
            or 0
        )

    def create(self, name: str, comment: Optional[str]) -> HostedZone:
        zone = HostedZone(name=name, comment=comment)
        self.db.add(zone)
        self.db.commit()
        self.db.refresh(zone)
        return zone

    def update(
        self, zone: HostedZone, name: Optional[str], comment: Optional[str]
    ) -> HostedZone:
        if name is not None:
            zone.name = name
        if comment is not None:
            zone.comment = comment
        self.db.commit()
        self.db.refresh(zone)
        return zone

    def delete(self, zone: HostedZone) -> None:
        self.db.delete(zone)
        self.db.commit()
