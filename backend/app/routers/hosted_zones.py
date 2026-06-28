from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user
from app.schemas import (
    BindImportRequest,
    BindImportResponse,
    BulkDeleteRequest,
    BulkDeleteResponse,
    HostedZoneCreate,
    HostedZoneResponse,
    HostedZoneUpdate,
    PaginatedResponse,
    ZoneExportJson,
)
from app.services import DnsRecordService, HostedZoneService

router = APIRouter(prefix="/hosted-zones", tags=["hosted-zones"])


@router.get("", response_model=PaginatedResponse[HostedZoneResponse])
def list_hosted_zones(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_by: str = Query("name"),
    sort_order: str = Query("asc"),
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HostedZoneService(db)
    return service.list_zones(page, page_size, search, sort_by, sort_order)


@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone(
    zone_id: int,
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HostedZoneService(db)
    zone = service.get_zone(zone_id)
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return zone


@router.post("", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    body: HostedZoneCreate,
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HostedZoneService(db)
    return service.create_zone(body)


@router.put("/{zone_id}", response_model=HostedZoneResponse)
def update_hosted_zone(
    zone_id: int,
    body: HostedZoneUpdate,
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HostedZoneService(db)
    zone = service.update_zone(zone_id, body)
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return zone


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(
    zone_id: int,
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HostedZoneService(db)
    if not service.delete_zone(zone_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return None


@router.get("/{zone_id}/export")
def export_hosted_zone(
    zone_id: int,
    export_format: str = Query("json", alias="format", pattern="^(json|bind)$"),
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    zone_service = HostedZoneService(db)
    if export_format == "bind":
        content = zone_service.export_bind(zone_id)
        if content is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
        zone = zone_service.get_zone(zone_id)
        filename = f"{zone.name.rstrip('.')}.zone"
        return PlainTextResponse(
            content=content,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    data = zone_service.export_json(zone_id)
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return ZoneExportJson(hosted_zone=data["hosted_zone"], records=data["records"])


@router.post("/{zone_id}/import/bind", response_model=BindImportResponse)
def import_bind_zone(
    zone_id: int,
    body: BindImportRequest,
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DnsRecordService(db)
    result = service.import_bind(zone_id, body.content)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return BindImportResponse(**result)


@router.post("/{zone_id}/records/bulk-delete", response_model=BulkDeleteResponse)
def bulk_delete_records(
    zone_id: int,
    body: BulkDeleteRequest,
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DnsRecordService(db)
    try:
        deleted = service.bulk_delete_records(zone_id, body.record_ids)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return BulkDeleteResponse(deleted=deleted)
