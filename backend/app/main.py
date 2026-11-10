from __future__ import annotations

import hashlib
import hmac
import logging
import os
import secrets
import smtplib
from datetime import date, datetime, time, timedelta, timezone
from enum import Enum
from time import time as ahora_epoch
from typing import Annotated, Literal
from uuid import uuid4
from zoneinfo import ZoneInfo

from fastapi import Depends, FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.correo import (
    configuracion_smtp,
    enviar_codigo_verificacion,
    enviar_correo_recuperacion,
)
from app.exportar import exportar_historial as generar_archivo_historial
from app.modelos_db import (
    DispensacionDB,
    DispositivoDB,
    HorarioDB,
    MascotaDB,
    TokenRecuperacionDB,
    TokenDB,
    VerificacionCorreoDB,
    UsuarioDB,
)
from app.seguridad import hash_password

logger = logging.getLogger(__name__)


class Especie(str, Enum):
    perro = "perro"
    gato = "gato"


class DiaSemana(str, Enum):
    lunes = "lunes"
    martes = "martes"
    miercoles = "miercoles"
    jueves = "jueves"
    viernes = "viernes"
    sabado = "sabado"
    domingo = "domingo"


class EstadoDispensacion(str, Enum):
    exitosa = "exitosa"
    fallida = "fallida"


class TipoDispensacion(str, Enum):
    programada = "programada"
    manual = "manual"


class Modelo(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Credenciales(Modelo):
    correo: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    contrasena: str = Field(min_length=1)

class DatosPerfil(Modelo):
    nombre: str = Field(min_length=5, max_length=20)
    notificacionBateriaBaja: bool = False
    notificacionActualizaciones: bool = False


class SolicitudCodigoCorreo(Modelo):
    correo: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    contrasena: str = Field(min_length=1)


class ConfirmarCodigoCorreo(Modelo):
    codigo: str = Field(pattern=r"^\d{6}$")


class CambioContrasena(Modelo):
    contrasenaActual: str = Field(min_length=1)
    contrasenaNueva: str = Field(min_length=9, max_length=19, pattern=r".*\D.*")


class SolicitudRecuperacion(Modelo):
    correo: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class RestablecerContrasena(Modelo):
    token: str = Field(min_length=1)
    contrasenaNueva: str = Field(min_length=9, max_length=19, pattern=r".*\D.*")


class DatosRegistro(Credenciales):
    nombre: str = Field(min_length=5, max_length=20)
    contrasena: str = Field(min_length=9, max_length=19, pattern=r".*\D.*")


class Usuario(Modelo):
    id: str
    nombre: str
    correo: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    fechaCreacion: datetime | None = None
    notificacionBateriaBaja: bool = False
    notificacionActualizaciones: bool = False


class RespuestaAutenticacion(Modelo):
    usuario: Usuario
    tokenAcceso: str


class DatosMascota(Modelo):
    nombre: str = Field(min_length=1, max_length=100)
    especie: Especie
    raza: str = Field(min_length=1, max_length=100)
    pesoKg: float = Field(gt=0)


class Mascota(DatosMascota):
    id: str
    usuarioId: str


class ActualizarMascota(Modelo):
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    especie: Especie | None = None
    raza: str | None = Field(default=None, min_length=1, max_length=100)
    pesoKg: float | None = Field(default=None, gt=0)


class Dispositivo(Modelo):
    id: str
    usuarioId: str
    mascotaId: str
    nombre: str
    estadoConexion: str
    nivelAlimentoPorcentaje: int


class DatosHorario(Modelo):
    dispositivoId: str
    mascotaId: str
    hora: str = Field(pattern=r"^([01]\d|2[0-3]):([0-5]\d)$")
    gramos: float = Field(gt=0)
    dias: list[DiaSemana] = Field(min_length=1)
    activo: bool


class Horario(DatosHorario):
    id: str


class DatosDispensar(Modelo):
    gramos: float = Field(default=50, gt=0)


class Dispensacion(Modelo):
    id: str
    dispositivoId: str
    mascotaId: str
    horarioId: str | None
    fechaHora: datetime
    gramos: float
    tipo: TipoDispensacion
    estado: EstadoDispensacion


class RespuestaHistorial(Modelo):
    items: list[Dispensacion]
    total: int
    pagina: int
    porPagina: int


def _nuevo_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}"


def _usuario_api(usuario: UsuarioDB) -> Usuario:
    return Usuario(
        id=usuario.id,
        nombre=usuario.nombre,
        correo=usuario.correo,
        fechaCreacion=usuario.fecha_creacion,
        notificacionBateriaBaja=usuario.notificacion_bateria_baja,
        notificacionActualizaciones=usuario.notificacion_actualizaciones,
    )


def _mascota_api(mascota: MascotaDB) -> Mascota:
    return Mascota(
        id=mascota.id,
        usuarioId=mascota.usuario_id,
        nombre=mascota.nombre,
        especie=mascota.especie,
        raza=mascota.raza,
        pesoKg=mascota.peso_kg,
    )


def _dispositivo_api(dispositivo: DispositivoDB) -> Dispositivo:
    return Dispositivo(
        id=dispositivo.id,
        usuarioId=dispositivo.usuario_id,
        mascotaId=dispositivo.mascota_id,
        nombre=dispositivo.nombre,
        estadoConexion=dispositivo.estado_conexion,
        nivelAlimentoPorcentaje=dispositivo.nivel_alimento_porcentaje,
    )


def _horario_api(horario: HorarioDB) -> Horario:
    return Horario(
        id=horario.id,
        dispositivoId=horario.dispositivo_id,
        mascotaId=horario.mascota_id,
        hora=horario.hora,
        gramos=horario.gramos,
        dias=horario.dias,
        activo=horario.activo,
    )


def _dispensacion_api(dispensacion: DispensacionDB) -> Dispensacion:
    fecha_hora = dispensacion.fecha_hora
    if fecha_hora.tzinfo is None:
        fecha_hora = fecha_hora.replace(tzinfo=timezone.utc)
    return Dispensacion(
        id=dispensacion.id,
        dispositivoId=dispensacion.dispositivo_id,
        mascotaId=dispensacion.mascota_id,
        horarioId=dispensacion.horario_id,
        fechaHora=fecha_hora,
        gramos=dispensacion.gramos,
        tipo=dispensacion.tipo,
        estado=dispensacion.estado,
    )


bearer = HTTPBearer(auto_error=False)
app = FastAPI(title="DisPet API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _usuario_actual(
    credenciales: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db: Annotated[Session, Depends(get_db)],
) -> Usuario:
    token = db.get(TokenDB, credenciales.credentials) if credenciales else None
    usuario = db.get(UsuarioDB, token.usuario_id) if token else None
    if usuario is None:
        raise HTTPException(
            status_code=401,
            detail="Autenticación requerida.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _usuario_api(usuario)


UsuarioActual = Annotated[Usuario, Depends(_usuario_actual)]


def _respuesta_auth(db: Session, usuario: UsuarioDB) -> RespuestaAutenticacion:
    token = secrets.token_urlsafe(32)
    db.add(TokenDB(token=token, usuario_id=usuario.id))
    db.commit()
    return RespuestaAutenticacion(usuario=_usuario_api(usuario), tokenAcceso=token)


def _buscar_mascota(db: Session, mascota_id: str, user_id: str) -> MascotaDB | None:
    return db.scalar(
        select(MascotaDB).where(
            MascotaDB.id == mascota_id, MascotaDB.usuario_id == user_id
        )
    )


@app.get("/health")
def health(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    try:
        db.execute(select(1))
    except SQLAlchemyError as error:
        raise HTTPException(status_code=503, detail="La base de datos no responde.") from error
    return {"estado": "ok", "baseDatos": "ok"}


@app.post("/auth/registro", response_model=RespuestaAutenticacion, status_code=201)
def registrar(
    datos: DatosRegistro, db: Annotated[Session, Depends(get_db)]
) -> RespuestaAutenticacion:
    correo = str(datos.correo).lower()
    if db.scalar(select(UsuarioDB.id).where(UsuarioDB.correo == correo)):
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo.")
    salt, password_hash = hash_password(datos.contrasena)
    usuario = UsuarioDB(
        id=_nuevo_id("u"),
        nombre=datos.nombre,
        correo=correo,
        salt=salt,
        password_hash=password_hash,
        fecha_creacion=datetime.now(timezone.utc),
    )
    db.add(usuario)
    try:
        db.flush()
        return _respuesta_auth(db, usuario)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Ya existe una cuenta con ese correo."
        ) from error


@app.post("/auth/login", response_model=RespuestaAutenticacion)
def iniciar_sesion(
    datos: Credenciales, db: Annotated[Session, Depends(get_db)]
) -> RespuestaAutenticacion:
    cuenta = db.scalar(
        select(UsuarioDB).where(UsuarioDB.correo == str(datos.correo).lower())
    )
    if cuenta is None:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas.")
    _, password_hash = hash_password(datos.contrasena, cuenta.salt)
    if not hmac.compare_digest(password_hash, cuenta.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas.")
    return _respuesta_auth(db, cuenta)


@app.put("/auth/perfil", response_model=Usuario)
def actualizar_perfil(
    datos: DatosPerfil,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> Usuario:
    cuenta = db.get(UsuarioDB, usuario.id)
    if cuenta is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada.")
    cuenta.nombre = datos.nombre
    cuenta.notificacion_bateria_baja = datos.notificacionBateriaBaja
    cuenta.notificacion_actualizaciones = datos.notificacionActualizaciones
    db.execute(
        delete(TokenRecuperacionDB).where(TokenRecuperacionDB.usuario_id == cuenta.id)
    )
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Ya existe una cuenta con ese correo."
        ) from error
    return _usuario_api(cuenta)


@app.post("/auth/correo/codigo")
def solicitar_codigo_correo(
    datos: SolicitudCodigoCorreo,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    correo = datos.correo.lower()
    cuenta = db.get(UsuarioDB, usuario.id)
    if cuenta is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada.")
    _, password_hash = hash_password(datos.contrasena, cuenta.salt)
    if not hmac.compare_digest(password_hash, cuenta.password_hash):
        raise HTTPException(status_code=400, detail="La contraseña actual no es correcta.")
    if correo == cuenta.correo:
        raise HTTPException(status_code=400, detail="Ese ya es tu correo actual.")
    if db.scalar(select(UsuarioDB.id).where(UsuarioDB.correo == correo)):
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo.")

    try:
        configuracion_smtp()
    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail="El envío de correo no está configurado. Revisa backend/.env.",
        ) from error

    codigo = f"{secrets.randbelow(1_000_000):06d}"
    salt, codigo_hash = hash_password(codigo)
    db.merge(
        VerificacionCorreoDB(
            usuario_id=cuenta.id,
            correo_nuevo=correo,
            salt=salt,
            codigo_hash=codigo_hash,
            expira_en=ahora_epoch() + 10 * 60,
            intentos=0,
        )
    )
    db.commit()
    try:
        enviar_codigo_verificacion(correo, codigo)
    except (OSError, RuntimeError, smtplib.SMTPException) as error:
        logger.exception("No se pudo enviar el código de verificación del correo.")
        db.execute(
            delete(VerificacionCorreoDB).where(
                VerificacionCorreoDB.usuario_id == cuenta.id
            )
        )
        db.commit()
        raise HTTPException(
            status_code=503, detail="No se pudo enviar el código. Intenta de nuevo."
        ) from error
    return {"mensaje": "Enviamos un código de verificación al nuevo correo."}


@app.post("/auth/correo/confirmar", response_model=Usuario)
def confirmar_codigo_correo(
    datos: ConfirmarCodigoCorreo,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> Usuario:
    verificacion = db.get(VerificacionCorreoDB, usuario.id)
    if verificacion is None or verificacion.expira_en < ahora_epoch():
        if verificacion is not None:
            db.delete(verificacion)
            db.commit()
        raise HTTPException(
            status_code=400, detail="El código venció o no es válido. Solicita uno nuevo."
        )

    _, codigo_hash = hash_password(datos.codigo, verificacion.salt)
    if not hmac.compare_digest(codigo_hash, verificacion.codigo_hash):
        verificacion.intentos += 1
        if verificacion.intentos >= 5:
            db.delete(verificacion)
        db.commit()
        raise HTTPException(status_code=400, detail="El código no es correcto.")

    cuenta = db.get(UsuarioDB, usuario.id)
    if cuenta is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada.")
    if db.scalar(
        select(UsuarioDB.id).where(
            UsuarioDB.correo == verificacion.correo_nuevo,
            UsuarioDB.id != cuenta.id,
        )
    ):
        db.delete(verificacion)
        db.commit()
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con ese correo.")

    cuenta.correo = verificacion.correo_nuevo
    db.delete(verificacion)
    db.execute(
        delete(TokenRecuperacionDB).where(TokenRecuperacionDB.usuario_id == cuenta.id)
    )
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Ya existe una cuenta con ese correo."
        ) from error
    return _usuario_api(cuenta)


@app.put("/auth/contrasena", status_code=204)
def cambiar_contrasena(
    datos: CambioContrasena,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    cuenta = db.get(UsuarioDB, usuario.id)
    if cuenta is None:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada.")
    _, hash_actual = hash_password(datos.contrasenaActual, cuenta.salt)
    if not hmac.compare_digest(hash_actual, cuenta.password_hash):
        raise HTTPException(status_code=400, detail="La contraseña actual no es correcta.")
    cuenta.salt, cuenta.password_hash = hash_password(datos.contrasenaNueva)
    db.execute(
        delete(TokenRecuperacionDB).where(TokenRecuperacionDB.usuario_id == cuenta.id)
    )
    db.commit()
    return Response(status_code=204)


@app.post("/auth/recuperar-contrasena")
def recuperar_contrasena(
    datos: SolicitudRecuperacion, db: Annotated[Session, Depends(get_db)]
) -> dict[str, str]:
    try:
        configuracion_smtp()
    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail="El envío de correo no está configurado. Revisa backend/.env.",
        ) from error

    cuenta = db.scalar(
        select(UsuarioDB).where(UsuarioDB.correo == str(datos.correo).lower())
    )
    if cuenta is not None:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        db.execute(
            delete(TokenRecuperacionDB).where(
                TokenRecuperacionDB.usuario_id == cuenta.id
            )
        )
        db.add(
            TokenRecuperacionDB(
                token_hash=token_hash,
                usuario_id=cuenta.id,
                expira_en=ahora_epoch() + 30 * 60,
            )
        )
        db.commit()
        enlace = (
            f"{os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')}"
            f"/restablecer-contrasena?token={token}"
        )
        try:
            enviar_correo_recuperacion(cuenta.correo, enlace)
        except (OSError, RuntimeError, smtplib.SMTPException):
            logger.exception("No se pudo enviar el correo de recuperación de contraseña.")
            db.execute(
                delete(TokenRecuperacionDB).where(
                    TokenRecuperacionDB.token_hash == token_hash
                )
            )
            db.commit()

    return {
        "mensaje": "Si el correo está asociado a una cuenta, recibirás un enlace para cambiar tu contraseña."
    }


@app.post("/auth/restablecer-contrasena", status_code=204)
def restablecer_contrasena(
    datos: RestablecerContrasena, db: Annotated[Session, Depends(get_db)]
) -> Response:
    token_hash = hashlib.sha256(datos.token.encode()).hexdigest()
    token = db.get(TokenRecuperacionDB, token_hash)
    if token is None or token.expira_en < ahora_epoch():
        raise HTTPException(
            status_code=400,
            detail="El enlace no es válido o venció. Solicita uno nuevo.",
        )

    cuenta = db.get(UsuarioDB, token.usuario_id)
    if cuenta is None:
        raise HTTPException(status_code=400, detail="El enlace ya no es válido.")
    cuenta.salt, cuenta.password_hash = hash_password(datos.contrasenaNueva)
    db.execute(
        delete(TokenRecuperacionDB).where(TokenRecuperacionDB.usuario_id == cuenta.id)
    )
    db.execute(delete(TokenDB).where(TokenDB.usuario_id == cuenta.id))
    db.commit()
    return Response(status_code=204)


@app.get("/mascotas", response_model=list[Mascota])
def obtener_mascotas(
    usuario: UsuarioActual, db: Annotated[Session, Depends(get_db)]
) -> list[Mascota]:
    mascotas = db.scalars(
        select(MascotaDB)
        .where(MascotaDB.usuario_id == usuario.id)
        .order_by(MascotaDB.id)
    ).all()
    return [_mascota_api(mascota) for mascota in mascotas]


@app.post("/mascotas", response_model=Mascota, status_code=201)
def crear_mascota(
    datos: DatosMascota,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> Mascota:
    mascota = MascotaDB(
        id=_nuevo_id("m"),
        usuario_id=usuario.id,
        nombre=datos.nombre,
        especie=datos.especie.value,
        raza=datos.raza,
        peso_kg=datos.pesoKg,
    )
    db.add(mascota)
    db.commit()
    return _mascota_api(mascota)


@app.put("/mascotas/{mascota_id}", response_model=Mascota)
def actualizar_mascota(
    mascota_id: str,
    cambios: ActualizarMascota,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> Mascota:
    mascota = _buscar_mascota(db, mascota_id, usuario.id)
    if mascota is None:
        raise HTTPException(status_code=404, detail="Mascota no encontrada.")
    for campo, valor in cambios.model_dump(exclude_unset=True).items():
        if campo == "pesoKg":
            mascota.peso_kg = valor
        elif campo == "especie":
            mascota.especie = valor.value if valor else None
        else:
            setattr(mascota, campo, valor)
    db.commit()
    return _mascota_api(mascota)


@app.delete("/mascotas/{mascota_id}", status_code=204)
def eliminar_mascota(
    mascota_id: str,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    mascota = _buscar_mascota(db, mascota_id, usuario.id)
    if mascota is None:
        raise HTTPException(status_code=404, detail="Mascota no encontrada.")
    db.delete(mascota)
    db.commit()
    return Response(status_code=204)


@app.get("/dispositivos", response_model=list[Dispositivo])
def obtener_dispositivos(
    usuario: UsuarioActual, db: Annotated[Session, Depends(get_db)]
) -> list[Dispositivo]:
    dispositivos = db.scalars(
        select(DispositivoDB)
        .where(DispositivoDB.usuario_id == usuario.id)
        .order_by(DispositivoDB.id)
    ).all()
    return [_dispositivo_api(dispositivo) for dispositivo in dispositivos]


@app.post(
    "/dispositivos/{dispositivo_id}/dispensar",
    response_model=Dispensacion,
    status_code=201,
)
def dispensar(
    dispositivo_id: str,
    datos: DatosDispensar,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> Dispensacion:
    dispositivo = db.scalar(
        select(DispositivoDB).where(
            DispositivoDB.id == dispositivo_id,
            DispositivoDB.usuario_id == usuario.id,
        )
    )
    if dispositivo is None:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado.")
    dispensacion = DispensacionDB(
        id=_nuevo_id("disp"),
        dispositivo_id=dispositivo.id,
        mascota_id=dispositivo.mascota_id,
        horario_id=None,
        fecha_hora=datetime.now(timezone.utc),
        gramos=datos.gramos,
        tipo=TipoDispensacion.manual.value,
        estado=(
            EstadoDispensacion.exitosa.value
            if dispositivo.estado_conexion == "conectado"
            else EstadoDispensacion.fallida.value
        ),
    )
    db.add(dispensacion)
    db.commit()
    return _dispensacion_api(dispensacion)


def _validar_relaciones_horario(
    db: Session, datos: DatosHorario, user_id: str
) -> tuple[DispositivoDB, MascotaDB]:
    dispositivo = db.scalar(
        select(DispositivoDB).where(
            DispositivoDB.id == datos.dispositivoId,
            DispositivoDB.usuario_id == user_id,
        )
    )
    mascota = _buscar_mascota(db, datos.mascotaId, user_id)
    if dispositivo is None or mascota is None or dispositivo.mascota_id != mascota.id:
        raise HTTPException(
            status_code=422,
            detail="El horario debe usar un dispositivo y una mascota asociados.",
        )
    return dispositivo, mascota


@app.get("/horarios", response_model=list[Horario])
def obtener_horarios(
    usuario: UsuarioActual, db: Annotated[Session, Depends(get_db)]
) -> list[Horario]:
    horarios = db.scalars(
        select(HorarioDB)
        .join(DispositivoDB)
        .where(DispositivoDB.usuario_id == usuario.id)
        .order_by(HorarioDB.hora)
    ).all()
    return [_horario_api(horario) for horario in horarios]


@app.post("/horarios", response_model=Horario, status_code=201)
def crear_horario(
    datos: DatosHorario,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> Horario:
    _validar_relaciones_horario(db, datos, usuario.id)
    horario = HorarioDB(
        id=_nuevo_id("h"),
        dispositivo_id=datos.dispositivoId,
        mascota_id=datos.mascotaId,
        hora=datos.hora,
        gramos=datos.gramos,
        dias=[dia.value for dia in datos.dias],
        activo=datos.activo,
    )
    db.add(horario)
    db.commit()
    return _horario_api(horario)


@app.put("/horarios/{horario_id}", response_model=Horario)
def actualizar_horario(
    horario_id: str,
    datos: DatosHorario,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> Horario:
    horario = db.scalar(
        select(HorarioDB)
        .join(DispositivoDB)
        .where(
            HorarioDB.id == horario_id,
            DispositivoDB.usuario_id == usuario.id,
        )
    )
    if horario is None:
        raise HTTPException(status_code=404, detail="Horario no encontrado.")
    _validar_relaciones_horario(db, datos, usuario.id)
    horario.dispositivo_id = datos.dispositivoId
    horario.mascota_id = datos.mascotaId
    horario.hora = datos.hora
    horario.gramos = datos.gramos
    horario.dias = [dia.value for dia in datos.dias]
    horario.activo = datos.activo
    db.commit()
    return _horario_api(horario)


@app.delete("/horarios/{horario_id}", status_code=204)
def eliminar_horario(
    horario_id: str,
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    horario = db.scalar(
        select(HorarioDB)
        .join(DispositivoDB)
        .where(
            HorarioDB.id == horario_id,
            DispositivoDB.usuario_id == usuario.id,
        )
    )
    if horario is None:
        raise HTTPException(status_code=404, detail="Horario no encontrado.")
    db.delete(horario)
    db.commit()
    return Response(status_code=204)


def _consulta_historial(
    user_id: str,
    estado_filtro: EstadoDispensacion | None,
    mascota_id: str | None,
    desde: date | None,
    hasta: date | None,
):
    if desde and hasta and desde > hasta:
        raise HTTPException(status_code=422, detail="'desde' no puede ser posterior a 'hasta'.")
    consulta = (
        select(DispensacionDB)
        .join(DispositivoDB)
        .where(DispositivoDB.usuario_id == user_id)
    )
    if estado_filtro:
        consulta = consulta.where(DispensacionDB.estado == estado_filtro.value)
    if mascota_id:
        consulta = consulta.where(DispensacionDB.mascota_id == mascota_id)
    if desde:
        consulta = consulta.where(
            DispensacionDB.fecha_hora
            >= datetime.combine(
                desde, time.min, tzinfo=ZoneInfo("America/Bogota")
            ).astimezone(timezone.utc)
        )
    if hasta:
        consulta = consulta.where(
            DispensacionDB.fecha_hora
            < datetime.combine(
                hasta + timedelta(days=1),
                time.min,
                tzinfo=ZoneInfo("America/Bogota"),
            ).astimezone(timezone.utc)
        )
    return consulta


@app.get("/historial", response_model=RespuestaHistorial)
def obtener_historial(
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
    pagina: Annotated[int, Query(ge=1)] = 1,
    porPagina: Annotated[int, Query(ge=1, le=100)] = 10,
    estado_filtro: Annotated[
        EstadoDispensacion | None, Query(alias="estado")
    ] = None,
    mascota_id: Annotated[str | None, Query(alias="mascotaId")] = None,
    desde: date | None = None,
    hasta: date | None = None,
) -> RespuestaHistorial:
    consulta = _consulta_historial(usuario.id, estado_filtro, mascota_id, desde, hasta)
    total = db.scalar(select(func.count()).select_from(consulta.subquery())) or 0
    registros = db.scalars(
        consulta.order_by(DispensacionDB.fecha_hora.desc())
        .offset((pagina - 1) * porPagina)
        .limit(porPagina)
    ).all()
    return RespuestaHistorial(
        items=[_dispensacion_api(registro) for registro in registros],
        total=total,
        pagina=pagina,
        porPagina=porPagina,
    )


@app.get("/historial/exportar")
def exportar_historial_api(
    usuario: UsuarioActual,
    db: Annotated[Session, Depends(get_db)],
    formato: Literal["xlsx", "pdf", "docx"],
    estado_filtro: Annotated[
        EstadoDispensacion | None, Query(alias="estado")
    ] = None,
    mascota_id: Annotated[str | None, Query(alias="mascotaId")] = None,
    fecha_desde: Annotated[date | None, Query(alias="fechaDesde")] = None,
    fecha_hasta: Annotated[date | None, Query(alias="fechaHasta")] = None,
) -> Response:
    consulta = _consulta_historial(
        usuario.id, estado_filtro, mascota_id, fecha_desde, fecha_hasta
    )
    registros_db = db.scalars(
        consulta.order_by(DispensacionDB.fecha_hora.desc())
    ).all()
    registros = [_dispensacion_api(registro) for registro in registros_db]
    mascotas = {
        mascota.id: mascota.nombre
        for mascota in db.scalars(
            select(MascotaDB).where(MascotaDB.usuario_id == usuario.id)
        ).all()
    }
    dispositivos = {
        dispositivo.id: dispositivo.nombre
        for dispositivo in db.scalars(
            select(DispositivoDB).where(DispositivoDB.usuario_id == usuario.id)
        ).all()
    }
    filtros = []
    if estado_filtro:
        filtros.append(
            f"Estado: {'Exitosa' if estado_filtro == 'exitosa' else 'Fallida'}"
        )
    if mascota_id:
        filtros.append(f"Mascota: {mascotas.get(mascota_id, 'Sin coincidencia')}")
    if fecha_desde:
        filtros.append(f"Desde: {fecha_desde.strftime('%d/%m/%Y')}")
    if fecha_hasta:
        filtros.append(f"Hasta: {fecha_hasta.strftime('%d/%m/%Y')}")
    contenido_filtros = " · ".join(filtros) if filtros else "Sin filtros"
    generado = datetime.now(ZoneInfo("America/Bogota"))
    contenido = generar_archivo_historial(
        formato,
        registros,
        usuario.nombre,
        generado,
        contenido_filtros,
        mascotas,
        dispositivos,
    )
    tipos_contenido = {
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    return Response(
        content=contenido,
        media_type=tipos_contenido[formato],
        headers={"Content-Disposition": f'attachment; filename="historial-dispet.{formato}"'},
    )
