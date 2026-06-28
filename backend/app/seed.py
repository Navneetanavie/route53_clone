from __future__ import annotations

from sqlalchemy.orm import Session

from app.auth_utils import hash_password
from app.database import SessionLocal
from app.repositories.user_repository import UserRepository


def seed_default_user():
    db: Session = SessionLocal()
    try:
        repo = UserRepository(db)
        if repo.count() == 0:
            repo.create("admin", hash_password("admin"))
            print("Seeded default user: admin / admin")
    finally:
        db.close()
