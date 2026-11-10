from __future__ import annotations

import os
from collections.abc import Generator
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("Configura DATABASE_URL en backend/.env.")


class Base(DeclarativeBase):
    pass


def crear_engine(url: str) -> Engine:
    opciones = {"pool_pre_ping": True}
    if url.startswith("sqlite"):
        opciones["connect_args"] = {"check_same_thread": False}
        if ":memory:" in url:
            opciones["poolclass"] = StaticPool
    engine = create_engine(url, **opciones)
    if engine.dialect.name == "sqlite":
        @event.listens_for(engine, "connect")
        def activar_claves_foraneas(dbapi_connection, _connection_record) -> None:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
    return engine


engine = crear_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session
