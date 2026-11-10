from __future__ import annotations

import os
import smtplib
import ssl
from email.message import EmailMessage


def configuracion_smtp() -> tuple[str, int, str, str, str]:
    host = os.getenv("SMTP_HOST", "").strip()
    usuario = os.getenv("SMTP_USERNAME", "").strip()
    contrasena = os.getenv("SMTP_PASSWORD", "")
    remitente = os.getenv("SMTP_FROM_EMAIL", "").strip()
    try:
        puerto = int(os.getenv("SMTP_PORT", "587"))
    except ValueError as error:
        raise RuntimeError("SMTP_PORT debe ser un puerto válido.") from error

    if not all((host, usuario, contrasena, remitente)) or not 1 <= puerto <= 65535:
        raise RuntimeError("Configura SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD y SMTP_FROM_EMAIL.")
    return host, puerto, usuario, contrasena, remitente


def enviar_correo_recuperacion(destinatario: str, enlace: str) -> None:
    host, puerto, usuario, contrasena, remitente = configuracion_smtp()
    mensaje = EmailMessage()
    mensaje["Subject"] = "Restablece tu contraseña de DisPet"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario
    mensaje.set_content(
        "Recibimos una solicitud para cambiar la contraseña de tu cuenta DisPet.\n\n"
        f"Usa este enlace dentro de los próximos 30 minutos:\n{enlace}\n\n"
        "Si no solicitaste este cambio, puedes ignorar este mensaje."
    )

    with smtplib.SMTP(host, puerto, timeout=10) as servidor:
        servidor.starttls(context=ssl.create_default_context())
        servidor.login(usuario, contrasena)
        servidor.send_message(mensaje)


def enviar_codigo_verificacion(destinatario: str, codigo: str) -> None:
    host, puerto, usuario, contrasena, remitente = configuracion_smtp()
    mensaje = EmailMessage()
    mensaje["Subject"] = "Verifica tu correo de DisPet"
    mensaje["From"] = remitente
    mensaje["To"] = destinatario
    mensaje.set_content(
        f"Tu código para confirmar el cambio de correo de DisPet es: {codigo}\n\n"
        "El código vence en 10 minutos. Si no solicitaste este cambio, ignora este mensaje."
    )

    with smtplib.SMTP(host, puerto, timeout=10) as servidor:
        servidor.starttls(context=ssl.create_default_context())
        servidor.login(usuario, contrasena)
        servidor.send_message(mensaje)
