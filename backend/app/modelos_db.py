from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, LargeBinary, String, false
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.database import Base


class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    correo: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    salt: Mapped[bytes] = mapped_column(LargeBinary(16), nullable=False)
    password_hash: Mapped[bytes] = mapped_column(LargeBinary(32), nullable=False)
    notificacion_bateria_baja: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=false(), nullable=False
    )
    notificacion_actualizaciones: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=false(), nullable=False
    )
    fecha_creacion: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=True
    )

    mascotas: Mapped[list[MascotaDB]] = relationship(
        back_populates="usuario", cascade="all, delete-orphan"
    )
    dispositivos: Mapped[list[DispositivoDB]] = relationship(
        back_populates="usuario", cascade="all, delete-orphan"
    )
    tokens: Mapped[list[TokenDB]] = relationship(
        back_populates="usuario", cascade="all, delete-orphan"
    )


class MascotaDB(Base):
    __tablename__ = "mascotas"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    usuario_id: Mapped[str] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), index=True, nullable=False
    )
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    especie: Mapped[str] = mapped_column(String(20), nullable=False)
    raza: Mapped[str] = mapped_column(String(100), nullable=False)
    peso_kg: Mapped[float] = mapped_column(Float, nullable=False)

    usuario: Mapped[UsuarioDB] = relationship(back_populates="mascotas")
    dispositivos: Mapped[list[DispositivoDB]] = relationship(
        back_populates="mascota", cascade="all, delete-orphan"
    )
    horarios: Mapped[list[HorarioDB]] = relationship(
        back_populates="mascota", cascade="all, delete-orphan"
    )
    dispensaciones: Mapped[list[DispensacionDB]] = relationship(
        back_populates="mascota", cascade="all, delete-orphan"
    )


class DispositivoDB(Base):
    __tablename__ = "dispositivos"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    usuario_id: Mapped[str] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), index=True, nullable=False
    )
    mascota_id: Mapped[str] = mapped_column(
        ForeignKey("mascotas.id", ondelete="CASCADE"), index=True, nullable=False
    )
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    estado_conexion: Mapped[str] = mapped_column(String(30), nullable=False)
    nivel_alimento_porcentaje: Mapped[int] = mapped_column(Integer, nullable=False)

    usuario: Mapped[UsuarioDB] = relationship(back_populates="dispositivos")
    mascota: Mapped[MascotaDB] = relationship(back_populates="dispositivos")
    horarios: Mapped[list[HorarioDB]] = relationship(
        back_populates="dispositivo", cascade="all, delete-orphan"
    )
    dispensaciones: Mapped[list[DispensacionDB]] = relationship(
        back_populates="dispositivo", cascade="all, delete-orphan"
    )


class HorarioDB(Base):
    __tablename__ = "horarios"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    dispositivo_id: Mapped[str] = mapped_column(
        ForeignKey("dispositivos.id", ondelete="CASCADE"), index=True, nullable=False
    )
    mascota_id: Mapped[str] = mapped_column(
        ForeignKey("mascotas.id", ondelete="CASCADE"), index=True, nullable=False
    )
    hora: Mapped[str] = mapped_column(String(5), nullable=False)
    gramos: Mapped[float] = mapped_column(Float, nullable=False)
    dias: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False)

    dispositivo: Mapped[DispositivoDB] = relationship(back_populates="horarios")
    mascota: Mapped[MascotaDB] = relationship(back_populates="horarios")


class DispensacionDB(Base):
    __tablename__ = "dispensaciones"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    dispositivo_id: Mapped[str] = mapped_column(
        ForeignKey("dispositivos.id", ondelete="CASCADE"), index=True, nullable=False
    )
    mascota_id: Mapped[str] = mapped_column(
        ForeignKey("mascotas.id", ondelete="CASCADE"), index=True, nullable=False
    )
    horario_id: Mapped[str | None] = mapped_column(
        ForeignKey("horarios.id", ondelete="SET NULL"), nullable=True
    )
    fecha_hora: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    gramos: Mapped[float] = mapped_column(Float, nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)
    estado: Mapped[str] = mapped_column(String(20), nullable=False)

    dispositivo: Mapped[DispositivoDB] = relationship(back_populates="dispensaciones")
    mascota: Mapped[MascotaDB] = relationship(back_populates="dispensaciones")


class TokenDB(Base):
    __tablename__ = "tokens_sesion"

    token: Mapped[str] = mapped_column(String(128), primary_key=True)
    usuario_id: Mapped[str] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), index=True, nullable=False
    )

    usuario: Mapped[UsuarioDB] = relationship(back_populates="tokens")


class TokenRecuperacionDB(Base):
    __tablename__ = "tokens_recuperacion"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    usuario_id: Mapped[str] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), index=True, nullable=False
    )
    expira_en: Mapped[float] = mapped_column(Float, nullable=False)


class VerificacionCorreoDB(Base):
    __tablename__ = "verificaciones_correo"

    usuario_id: Mapped[str] = mapped_column(
        ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True
    )
    correo_nuevo: Mapped[str] = mapped_column(String(255), nullable=False)
    salt: Mapped[bytes] = mapped_column(LargeBinary(16), nullable=False)
    codigo_hash: Mapped[bytes] = mapped_column(LargeBinary(32), nullable=False)
    expira_en: Mapped[float] = mapped_column(Float, nullable=False)
    intentos: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
