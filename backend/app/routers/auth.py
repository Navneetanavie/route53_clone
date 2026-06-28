from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.schemas import LoginRequest, SessionResponse
from app.services import AuthService

router = APIRouter(tags=["auth"])


def get_current_user(request: Request) -> str:
    username = request.session.get("username")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return username


@router.post("/login", response_model=SessionResponse)
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    service = AuthService(db)
    username = service.authenticate(body.username, body.password)
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    request.session["username"] = username
    return SessionResponse(username=username)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request):
    request.session.clear()
    return None


@router.get("/session", response_model=SessionResponse)
def get_session(request: Request):
    username = request.session.get("username")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return SessionResponse(username=username)
