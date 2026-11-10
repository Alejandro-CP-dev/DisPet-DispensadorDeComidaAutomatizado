"""Store user account creation date."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a41c7e29b503"
down_revision: Union[str, None] = "8baf2c17d903"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "usuarios",
        sa.Column("fecha_creacion", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("usuarios", "fecha_creacion")
