from datetime import datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class SessionResponse(BaseModel):
    username: str


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=255)


class HostedZoneCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    comment: Optional[str] = None


class HostedZoneUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    comment: Optional[str] = None


class HostedZoneResponse(BaseModel):
    id: int
    name: str
    comment: Optional[str]
    record_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DnsRecordCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: str = Field(min_length=1, max_length=10)
    ttl: int = Field(default=300, ge=1, le=2147483647)
    value: str = Field(min_length=1)
    routing_policy: str = Field(default="Simple", max_length=50)
    comment: Optional[str] = None


class DnsRecordUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    type: Optional[str] = Field(default=None, min_length=1, max_length=10)
    ttl: Optional[int] = Field(default=None, ge=1, le=2147483647)
    value: Optional[str] = Field(default=None, min_length=1)
    routing_policy: Optional[str] = Field(default=None, max_length=50)
    comment: Optional[str] = None


class DnsRecordResponse(BaseModel):
    id: int
    hosted_zone_id: int
    name: str
    type: str
    ttl: int
    value: str
    routing_policy: str
    comment: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BindImportRequest(BaseModel):
    content: str = Field(min_length=1)


class BindImportResponse(BaseModel):
    imported: int
    skipped: int
    errors: List[str]


class BulkDeleteRequest(BaseModel):
    record_ids: List[int] = Field(min_length=1)


class BulkDeleteResponse(BaseModel):
    deleted: int


class ZoneExportJson(BaseModel):
    hosted_zone: HostedZoneResponse
    records: List[DnsRecordResponse]
