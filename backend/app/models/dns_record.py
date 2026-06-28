from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

RECORD_TYPES = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"}


class DnsRecord(Base):
    __tablename__ = "dns_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    hosted_zone_id: Mapped[int] = mapped_column(
        ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    ttl: Mapped[int] = mapped_column(Integer, default=300, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    routing_policy: Mapped[str] = mapped_column(String(50), default="Simple", nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    hosted_zone: Mapped["HostedZone"] = relationship(
        "HostedZone", back_populates="records"
    )


from app.models.hosted_zone import HostedZone  # noqa: E402
