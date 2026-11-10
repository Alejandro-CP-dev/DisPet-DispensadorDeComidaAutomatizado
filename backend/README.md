# Backend DisPet

API REST en Python con FastAPI. Los datos se guardan en PostgreSQL y las rutas
siguen siendo compatibles con el frontend.

## Requisitos

- Python 3.10 o superior
- PostgreSQL 17 (o compatible) en `localhost:5433`

## Configuración y arranque

1. En pgAdmin, crea una base de datos llamada `dispet` con el usuario `postgres`.
2. Crea `backend/.env` a partir de `.env.example` y configura la contraseña de
   PostgreSQL en `DATABASE_URL`. Para Gmail, activa la verificación en dos
   pasos en la cuenta remitente y genera una contraseña de aplicación. Usa el
   correo completo en `SMTP_USERNAME` y `SMTP_FROM_EMAIL`, y esa contraseña de
   aplicación en `SMTP_PASSWORD` (no la contraseña normal). El ejemplo usa
   `smtp.gmail.com:587`; otros proveedores pueden requerir otro host o puerto.
   `FRONTEND_URL` debe apuntar al origen donde corre el frontend y define el
   enlace de recuperación. No subas `backend/.env` a Git ni compartas sus
   credenciales.
3. Instala dependencias, crea las tablas y carga los datos de demostración:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python -m alembic upgrade head
   python -m app.seed
   ```

   El script de demostración solo agrega datos si la base está vacía.
4. Inicia la API:

   ```powershell
   uvicorn app.main:app --reload
   ```

La API queda en `http://localhost:8000`; la documentación interactiva está en
`http://localhost:8000/docs`. `/health` informa si la base de datos responde.
El frontend puede conectarse configurando `VITE_API_URL=http://localhost:8000`
y `VITE_USAR_MOCKS=false`.

## Cuenta de demostración

- Correo: `alejandro@dispet.test`
- Contraseña: `dispet123`

Las rutas de mascotas, dispositivos, horarios e historial requieren el token
obtenido por login o registro.

Los nombres deben tener entre 5 y 20 caracteres. Las contraseñas nuevas deben
tener entre 9 y 19 caracteres y no pueden estar compuestas solo por números.
Para solicitar el cambio de correo, la API también verifica la contraseña actual.

## Rutas

| Método | Ruta | Acción |
| --- | --- | --- |
| `GET` | `/health` | Estado del servicio y la base de datos |
| `POST` | `/auth/login` | Iniciar sesión |
| `POST` | `/auth/registro` | Crear cuenta |
| `PUT` | `/auth/perfil` | Actualizar nombre y preferencias de notificación |
| `POST` | `/auth/correo/codigo` | Enviar un código para verificar el nuevo correo |
| `POST` | `/auth/correo/confirmar` | Cambiar el correo usando el código recibido |
| `PUT` | `/auth/contrasena` | Cambiar contraseña verificando la actual |
| `POST` | `/auth/recuperar-contrasena` | Envía un enlace de recuperación por correo |
| `POST` | `/auth/restablecer-contrasena` | Cambia la contraseña usando un enlace vigente |
| `GET`, `POST` | `/mascotas` | Listar y crear mascotas |
| `PUT`, `DELETE` | `/mascotas/{id}` | Actualizar y eliminar mascota |
| `GET` | `/dispositivos` | Listar dispositivos |
| `POST` | `/dispositivos/{id}/dispensar` | Registrar una dispensación manual |
| `GET`, `POST` | `/horarios` | Listar y crear horarios |
| `PUT`, `DELETE` | `/horarios/{id}` | Actualizar y eliminar horario |
| `GET` | `/historial` | Consultar historial paginado |
| `GET` | `/historial/exportar` | Descargar el historial en Excel, PDF o Word |

El historial acepta `pagina`, `porPagina` (máximo 100), `estado`, `mascotaId`,
`desde` y `hasta` (fechas `AAAA-MM-DD`). Los filtros de fecha usan el día
calendario de Colombia.

La exportación requiere autenticación y acepta `formato` (`xlsx`, `pdf` o
`docx`), `estado`, `mascotaId`, `fechaDesde` y `fechaHasta`. Exporta todos los
registros que coincidan, con las fechas y horas en la zona de Colombia.

Los enlaces de recuperación vencen en 30 minutos y solo pueden usarse una vez.
La solicitud no revela si el correo está registrado. El envío requiere una
cuenta de correo compatible con SMTP y la configuración indicada en
`backend/.env`. Si falta la configuración, la API responde con un error. Si el
proveedor rechaza el envío, el backend registra el fallo, elimina el enlace no
entregado y mantiene una respuesta genérica para no revelar si el correo está
registrado.
El cambio de correo pide la contraseña actual y un código enviado al nuevo
correo; el código vence en 10 minutos y se bloquea después de cinco intentos.
Las preferencias de batería baja y actualizaciones se guardan en la cuenta; la
entrega de esas notificaciones aún requiere integrar un servicio de avisos.

## Pruebas

Las pruebas usan SQLite en memoria y no modifican la base PostgreSQL:

```powershell
cd backend
python -m pytest
```
