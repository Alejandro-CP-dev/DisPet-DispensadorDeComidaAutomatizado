from datetime import date, datetime, timedelta, timezone
from io import BytesIO
import smtplib
from urllib.parse import parse_qs, urlparse
from zoneinfo import ZoneInfo

import pytest
from fastapi.testclient import TestClient
from openpyxl import load_workbook
from sqlalchemy.orm import sessionmaker

from app import main
from app.database import Base, crear_engine, get_db
from app.main import app
from app.modelos_db import DispensacionDB, TokenRecuperacionDB
from app.seed import cargar_demo_si_vacia


@pytest.fixture
def db_session_factory():
    engine = crear_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)

    with factory() as db:
        cargar_demo_si_vacia(db)

    yield factory

    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture(autouse=True)
def restablecer_estado(db_session_factory):
    def override_get_db():
        with db_session_factory() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def cliente():
    return TestClient(app)


@pytest.fixture
def autenticado(cliente):
    respuesta = cliente.post(
        "/auth/login",
        json={"correo": "alejandro@dispet.test", "contrasena": "dispet123"},
    )
    assert respuesta.status_code == 200
    return {
        "Authorization": f"Bearer {respuesta.json()['tokenAcceso']}"
    }


def test_login_y_rutas_protegidas(cliente, autenticado):
    inicio = cliente.post(
        "/auth/login",
        json={"correo": "alejandro@dispet.test", "contrasena": "incorrecta123"},
    )
    assert inicio.status_code == 401
    assert inicio.json()["detail"] == "Credenciales incorrectas."

    assert cliente.get("/mascotas").status_code == 401
    respuesta = cliente.get("/mascotas", headers=autenticado)
    assert respuesta.status_code == 200
    assert {m["nombre"] for m in respuesta.json()} == {"Luna", "Simba"}


def test_registro_y_correo_duplicado(cliente):
    datos = {
        "nombre": "Nueva persona",
        "correo": "persona@example.com",
        "contrasena": "clave-segura-123",
    }
    creado = cliente.post("/auth/registro", json=datos)
    assert creado.status_code == 201
    assert creado.json()["usuario"]["correo"] == datos["correo"]
    fecha_creacion = datetime.fromisoformat(creado.json()["usuario"]["fechaCreacion"])
    assert fecha_creacion.date() == datetime.now(timezone.utc).date()
    assert cliente.post("/auth/registro", json=datos).status_code == 409


@pytest.mark.parametrize(
    "contrasena",
    ["123456789", "corta123", "clave-de-mas-de-19-caracteres"],
)
def test_login_rechaza_credenciales_incorrectas_sin_validar_politica_de_contrasena(
    cliente, contrasena
):
    respuesta = cliente.post(
        "/auth/login",
        json={"correo": "alejandro@dispet.test", "contrasena": contrasena},
    )
    assert respuesta.status_code == 401
    assert respuesta.json()["detail"] == "Credenciales incorrectas."


def test_registro_rechaza_contrasena_compuesta_solo_por_numeros(cliente):
    respuesta = cliente.post(
        "/auth/registro",
        json={
            "nombre": "Nueva Persona",
            "correo": "persona@example.com",
            "contrasena": "123456789",
        },
    )
    assert respuesta.status_code == 422


def test_registro_valida_nombre_y_contrasena(cliente):
    datos = {
        "nombre": "Nombre Valido",
        "correo": "persona@example.com",
        "contrasena": "clave1234",
    }
    assert cliente.post("/auth/registro", json=datos).status_code == 201

    for campo, valor in (
        ("nombre", "Juan"),
        ("nombre", "Nombre demasiado largo"),
        ("contrasena", "clave123"),
        ("contrasena", "123456789"),
        ("contrasena", "a" * 20),
    ):
        invalido = {**datos, campo: valor, "correo": f"{campo}{len(valor)}@example.com"}
        assert cliente.post("/auth/registro", json=invalido).status_code == 422


def test_actualiza_perfil_y_cambia_contrasena(cliente, autenticado):
    for nombre in ("Juan", "Nombre demasiado largo"):
        respuesta = cliente.put(
            "/auth/perfil",
            headers=autenticado,
            json={
                "nombre": nombre,
                "notificacionBateriaBaja": False,
                "notificacionActualizaciones": False,
            },
        )
        assert respuesta.status_code == 422

    perfil = cliente.put(
        "/auth/perfil",
        headers=autenticado,
        json={
            "nombre": "Alejandra",
            "notificacionBateriaBaja": True,
            "notificacionActualizaciones": True,
        },
    )
    assert perfil.status_code == 200
    assert perfil.json()["correo"] == "alejandro@dispet.test"
    assert perfil.json()["notificacionBateriaBaja"] is True
    assert perfil.json()["notificacionActualizaciones"] is True

    cambio = cliente.put(
        "/auth/contrasena",
        headers=autenticado,
        json={"contrasenaActual": "dispet123", "contrasenaNueva": "nueva-clave-123"},
    )
    assert cambio.status_code == 204
    assert cliente.post(
        "/auth/login",
        json={"correo": "alejandro@dispet.test", "contrasena": "nueva-clave-123"},
    ).status_code == 200


def test_correo_solo_cambia_despues_de_confirmar_codigo(cliente, autenticado, monkeypatch):
    codigo_enviado = []
    monkeypatch.setattr(
        main, "configuracion_smtp", lambda: ("smtp.test", 587, "u", "p", "d")
    )
    monkeypatch.setattr(
        main,
        "enviar_codigo_verificacion",
        lambda correo, codigo: codigo_enviado.append((correo, codigo)),
    )

    solicitud = cliente.post(
        "/auth/correo/codigo",
        headers=autenticado,
        json={"correo": "alejandra@example.com", "contrasena": "incorrecta123"},
    )
    assert solicitud.status_code == 400
    assert codigo_enviado == []

    solicitud = cliente.post(
        "/auth/correo/codigo",
        headers=autenticado,
        json={"correo": "alejandra@example.com", "contrasena": "dispet123"},
    )
    assert solicitud.status_code == 200
    assert codigo_enviado[0][0] == "alejandra@example.com"
    assert cliente.post(
        "/auth/login",
        json={"correo": "alejandra@example.com", "contrasena": "dispet123"},
    ).status_code == 401

    confirmacion = cliente.post(
        "/auth/correo/confirmar",
        headers=autenticado,
        json={"codigo": codigo_enviado[0][1]},
    )
    assert confirmacion.status_code == 200
    assert confirmacion.json()["correo"] == "alejandra@example.com"
    assert cliente.post(
        "/auth/login",
        json={"correo": "alejandra@example.com", "contrasena": "dispet123"},
    ).status_code == 200


def test_recuperacion_envia_enlace_y_cambia_contrasena(cliente, monkeypatch):
    correos_enviados = []
    monkeypatch.setattr(main, "configuracion_smtp", lambda: ("smtp.test", 587, "u", "p", "d"))
    monkeypatch.setattr(
        main,
        "enviar_correo_recuperacion",
        lambda correo, enlace: correos_enviados.append((correo, enlace)),
    )

    respuesta = cliente.post(
        "/auth/recuperar-contrasena", json={"correo": "alejandro@dispet.test"}
    )
    assert respuesta.status_code == 200
    assert "recibirás un enlace" in respuesta.json()["mensaje"]
    assert len(correos_enviados) == 1
    correo, enlace = correos_enviados[0]
    assert correo == "alejandro@dispet.test"
    token = parse_qs(urlparse(enlace).query)["token"][0]

    cambio = cliente.post(
        "/auth/restablecer-contrasena",
        json={"token": token, "contrasenaNueva": "nueva-clave-123"},
    )
    assert cambio.status_code == 204
    assert cliente.post(
        "/auth/restablecer-contrasena",
        json={"token": token, "contrasenaNueva": "otra-clave-123"},
    ).status_code == 400
    assert cliente.post(
        "/auth/login", json={"correo": "alejandro@dispet.test", "contrasena": "dispet123"}
    ).status_code == 401
    assert cliente.post(
        "/auth/login",
        json={"correo": "alejandro@dispet.test", "contrasena": "nueva-clave-123"},
    ).status_code == 200


def test_recuperacion_no_revela_si_el_correo_existe(cliente, monkeypatch):
    monkeypatch.setattr(main, "configuracion_smtp", lambda: ("smtp.test", 587, "u", "p", "d"))
    correos_enviados = []
    monkeypatch.setattr(
        main,
        "enviar_correo_recuperacion",
        lambda correo, enlace: correos_enviados.append(correo),
    )

    existente = cliente.post(
        "/auth/recuperar-contrasena", json={"correo": "alejandro@dispet.test"}
    )
    inexistente = cliente.post(
        "/auth/recuperar-contrasena", json={"correo": "nadie@example.com"}
    )

    assert existente.json() == inexistente.json()
    assert correos_enviados == ["alejandro@dispet.test"]


def test_recuperacion_informa_si_smtp_no_esta_configurado(cliente, monkeypatch):
    def smtp_sin_configuracion():
        raise RuntimeError("faltan variables")

    monkeypatch.setattr(main, "configuracion_smtp", smtp_sin_configuracion)
    respuesta = cliente.post(
        "/auth/recuperar-contrasena", json={"correo": "alejandro@dispet.test"}
    )
    assert respuesta.status_code == 503


def test_recuperacion_oculta_fallo_de_envio_y_elimina_token(
    cliente, db_session_factory, monkeypatch
):
    monkeypatch.setattr(
        main, "configuracion_smtp", lambda: ("smtp.test", 587, "u", "p", "d")
    )

    def smtp_fallido(correo, enlace):
        raise smtplib.SMTPException("fallo de prueba")

    monkeypatch.setattr(main, "enviar_correo_recuperacion", smtp_fallido)
    existente = cliente.post(
        "/auth/recuperar-contrasena", json={"correo": "alejandro@dispet.test"}
    )
    inexistente = cliente.post(
        "/auth/recuperar-contrasena", json={"correo": "nadie@example.com"}
    )

    assert existente.status_code == inexistente.status_code == 200
    assert existente.json() == inexistente.json()
    with db_session_factory() as db:
        assert db.query(TokenRecuperacionDB).count() == 0


def test_mascotas_crud_y_aislamiento(cliente, autenticado):
    nueva = cliente.post(
        "/mascotas",
        headers=autenticado,
        json={"nombre": "Nala", "especie": "perro", "raza": "Mestiza", "pesoKg": 8},
    )
    assert nueva.status_code == 201
    mascota_id = nueva.json()["id"]
    actualizada = cliente.put(
        f"/mascotas/{mascota_id}", headers=autenticado, json={"pesoKg": 9}
    )
    assert actualizada.json()["pesoKg"] == 9
    assert cliente.delete(f"/mascotas/{mascota_id}", headers=autenticado).status_code == 204
    mascotas = cliente.get("/mascotas", headers=autenticado).json()
    assert all(mascota["id"] != mascota_id for mascota in mascotas)


def test_eliminar_mascota_elimina_sus_horarios(cliente, autenticado):
    antes = cliente.get("/horarios", headers=autenticado)
    assert {horario["id"] for horario in antes.json()} == {"h1", "h2"}

    respuesta = cliente.delete("/mascotas/m1", headers=autenticado)

    assert respuesta.status_code == 204
    despues = cliente.get("/horarios", headers=autenticado)
    assert {horario["id"] for horario in despues.json()} == {"h2"}


def test_horario_valida_relaciones_y_se_puede_crear(cliente, autenticado):
    datos = {
        "dispositivoId": "d1",
        "mascotaId": "m1",
        "hora": "08:00",
        "gramos": 50,
        "dias": ["lunes"],
        "activo": True,
    }
    assert cliente.post("/horarios", headers=autenticado, json=datos).status_code == 201
    datos["mascotaId"] = "m2"
    assert cliente.post("/horarios", headers=autenticado, json=datos).status_code == 422


def test_dispensa_y_filtra_historial(cliente, autenticado):
    respuesta = cliente.post(
        "/dispositivos/d1/dispensar",
        headers=autenticado,
        json={"gramos": 35},
    )
    assert respuesta.status_code == 201
    assert respuesta.json()["estado"] == "exitosa"
    historial = cliente.get(
        "/historial",
        headers=autenticado,
        params={"estado": "exitosa", "mascotaId": "m1"},
    )
    assert historial.status_code == 200
    assert all(
        item["estado"] == "exitosa" and item["mascotaId"] == "m1"
        for item in historial.json()["items"]
    )


def test_historial_filtra_por_fechas(cliente, autenticado):
    resultado = cliente.get(
        "/historial",
        headers=autenticado,
        params={"desde": date.today().isoformat(), "hasta": date.today().isoformat()},
    )
    assert resultado.status_code == 200
    assert resultado.json()["total"] == 0


def test_health_confirma_conexion_a_base_de_datos(cliente):
    assert cliente.get("/health").json() == {"estado": "ok", "baseDatos": "ok"}


@pytest.mark.parametrize(
    ("formato", "tipo_contenido", "firma"),
    [
        ("xlsx", "spreadsheetml.sheet", b"PK"),
        ("pdf", "application/pdf", b"%PDF-"),
        ("docx", "wordprocessingml.document", b"PK"),
    ],
)
def test_exporta_historial_en_formatos_correctos(
    cliente, autenticado, formato, tipo_contenido, firma
):
    respuesta = cliente.get(
        "/historial/exportar",
        headers=autenticado,
        params={"formato": formato},
    )
    assert respuesta.status_code == 200
    assert tipo_contenido in respuesta.headers["content-type"]
    assert respuesta.content.startswith(firma)


@pytest.mark.parametrize("formato", ["xlsx", "pdf", "docx"])
def test_exportar_historial_requiere_token(cliente, formato):
    respuesta = cliente.get("/historial/exportar", params={"formato": formato})
    assert respuesta.status_code == 401


def test_exportar_historial_aplica_todos_los_filtros(
    cliente, autenticado, db_session_factory
):
    registro = next(
        item
        for item in cliente.get("/historial", headers=autenticado).json()["items"]
        if item["estado"] == "fallida"
    )
    fecha_registro = datetime.fromisoformat(registro["fechaHora"])
    with db_session_factory() as db:
        db.add(
            DispensacionDB(
                id="disp-fuera-del-rango",
                dispositivo_id="d2",
                mascota_id="m2",
                horario_id="h2",
                fecha_hora=fecha_registro - timedelta(days=5),
                gramos=45,
                tipo="programada",
                estado="fallida",
            )
        )
        db.commit()
    fecha = fecha_registro.astimezone(ZoneInfo("America/Bogota")).date().isoformat()
    respuesta = cliente.get(
        "/historial/exportar",
        headers=autenticado,
        params={
            "formato": "xlsx",
            "estado": "fallida",
            "mascotaId": "m2",
            "fechaDesde": fecha,
            "fechaHasta": fecha,
        },
    )
    assert respuesta.status_code == 200
    hoja = load_workbook(BytesIO(respuesta.content), data_only=False)["Historial"]
    encabezado = next(
        fila for fila in hoja.iter_rows(values_only=True) if fila[0] == "Fecha"
    )
    fecha_local = fecha_registro.astimezone(ZoneInfo("America/Bogota")).date()
    filas_registro = [
        fila for fila in hoja.iter_rows(values_only=True)
        if fila[2] == "Simba" and fila[6] == "Fallida"
    ]
    assert encabezado == ("Fecha", "Hora", "Mascota", "Dispensador", "Gramos", "Tipo", "Estado")
    assert len(filas_registro) == 1
    fila_registro = filas_registro[0]
    assert fila_registro[0].date() == fecha_local
    assert fila_registro[2:] == ("Simba", "Dispensador cocina", 45.0, "Programada", "Fallida")
    assert isinstance(fila_registro[4], (int, float))
    assert hoja.freeze_panes == "A11"
    assert hoja.auto_filter.ref == "A10:G11"
    assert hoja["E12"].value == "=SUM(E11:E11)"
