from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.auth import get_current_user
from app.schemas import DnsRecordCreate, DnsRecordResponse, DnsRecordUpdate, PaginatedResponse
from app.services import DnsRecordService

router = APIRouter(tags=["records"])


@router.get("/hosted-zones/{zone_id}/records", response_model=PaginatedResponse[DnsRecordResponse])
def list_records(
    zone_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    type: Optional[str] = Query(None, alias="type"),
    sort_by: str = Query("name"),
    sort_order: str = Query("asc"),
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DnsRecordService(db)
    result = service.list_records(zone_id, page, page_size, search, type, sort_by, sort_order)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return result


@router.post(
    "/hosted-zones/{zone_id}/records",
    response_model=DnsRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_record(
    zone_id: int,
    body: DnsRecordCreate,
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DnsRecordService(db)
    try:
        record = service.create_record(zone_id, body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return record


@router.put("/records/{record_id}", response_model=DnsRecordResponse)
def update_record(
    record_id: int,
    body: DnsRecordUpdate,
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DnsRecordService(db)
    try:
        record = service.update_record(record_id, body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return record


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DnsRecordService(db)
    if not service.delete_record(record_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return None
