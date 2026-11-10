from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.modelos_db import (
    DispensacionDB,
    DispositivoDB,
    HorarioDB,
    MascotaDB,
    UsuarioDB,
)
from app.seguridad import hash_password


def cargar_demo_si_vacia(db: Session) -> bool:
    tablas = (
        UsuarioDB,
        MascotaDB,
        DispositivoDB,
        HorarioDB,
        DispensacionDB,
    )
    if any(db.scalar(select(func.count()).select_from(tabla)) for tabla in tablas):
        return False

    salt, password_hash = hash_password("dispet123")
    usuario = UsuarioDB(
        id="u1",
        nombre="Alejandro Cardenas",
        correo="alejandro@dispet.test",
        salt=salt,
        password_hash=password_hash,
        fecha_creacion=datetime(2024, 1, 15, 12, tzinfo=timezone.utc),
    )
    luna = MascotaDB(
        id="m1", usuario_id="u1", nombre="Luna", especie="perro",
        raza="Labrador", peso_kg=22,
    )
    simba = MascotaDB(
        id="m2", usuario_id="u1", nombre="Simba", especie="gato",
        raza="Siamés", peso_kg=4.5,
    )
    sala = DispositivoDB(
        id="d1", usuario_id="u1", mascota_id="m1", nombre="Dispensador sala",
        estado_conexion="conectado", nivel_alimento_porcentaje=68,
    )
    cocina = DispositivoDB(
        id="d2", usuario_id="u1", mascota_id="m2", nombre="Dispensador cocina",
        estado_conexion="desconectado", nivel_alimento_porcentaje=12,
    )
    db.add(usuario)
    db.flush()
    db.add_all([luna, simba])
    db.flush()
    db.add_all([sala, cocina])
    db.flush()
    db.add_all(
        [
            HorarioDB(
                id="h1",
                dispositivo_id="d1",
                mascota_id="m1",
                hora="07:30",
                gramos=120,
                dias=["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"],
                activo=True,
            ),
            HorarioDB(
                id="h2",
                dispositivo_id="d2",
                mascota_id="m2",
                hora="20:30",
                gramos=45,
                dias=["lunes", "miercoles", "viernes"],
                activo=True,
            ),
        ]
    )
    db.flush()
    db.add_all(
        [
            DispensacionDB(
                id="disp-demo-1",
                dispositivo_id="d1",
                mascota_id="m1",
                horario_id="h1",
                fecha_hora=datetime.now(timezone.utc) - timedelta(days=1),
                gramos=120,
                tipo="programada",
                estado="exitosa",
            ),
            DispensacionDB(
                id="disp-demo-2",
                dispositivo_id="d2",
                mascota_id="m2",
                horario_id="h2",
                fecha_hora=datetime.now(timezone.utc) - timedelta(days=2),
                gramos=45,
                tipo="programada",
                estado="fallida",
            ),
        ]
    )
    db.commit()
    return True


def main() -> None:
    with SessionLocal() as db:
        creado = cargar_demo_si_vacia(db)
    print("Datos de demostración cargados." if creado else "La base ya tiene datos; no se modificó.")


if __name__ == "__main__":
    main()
