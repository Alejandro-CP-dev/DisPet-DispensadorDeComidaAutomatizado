"""Add profile notification preferences and email tokens.

Revision ID: 8baf2c17d903
Revises: 2619461f5e47
Create Date: 2026-11-09 09:39:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8baf2c17d903"
down_revision: Union[str, None] = "2619461f5e47"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "usuarios",
        sa.Column(
            "notificacion_bateria_baja",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
    )
    op.add_column(
        "usuarios",
        sa.Column(
            "notificacion_actualizaciones",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
    )
    op.create_table(
        "tokens_recuperacion",
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("usuario_id", sa.String(length=64), nullable=False),
        sa.Column("expira_en", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("token_hash"),
    )
    op.create_index(
        op.f("ix_tokens_recuperacion_usuario_id"),
        "tokens_recuperacion",
        ["usuario_id"],
        unique=False,
    )
    op.create_table(
        "verificaciones_correo",
        sa.Column("usuario_id", sa.String(length=64), nullable=False),
        sa.Column("correo_nuevo", sa.String(length=255), nullable=False),
        sa.Column("salt", sa.LargeBinary(length=16), nullable=False),
        sa.Column("codigo_hash", sa.LargeBinary(length=32), nullable=False),
        sa.Column("expira_en", sa.Float(), nullable=False),
        sa.Column("intentos", sa.Integer(), server_default="0", nullable=False),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("usuario_id"),
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_tokens_recuperacion_usuario_id"), table_name="tokens_recuperacion"
    )
    op.drop_table("tokens_recuperacion")
    op.drop_table("verificaciones_correo")
    op.drop_column("usuarios", "notificacion_actualizaciones")
    op.drop_column("usuarios", "notificacion_bateria_baja")
