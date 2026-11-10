"""Set a date for the demo account when upgrading existing databases."""

from datetime import datetime, timezone
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d281f9a4c631"
down_revision: Union[str, None] = "a41c7e29b503"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.get_bind().execute(
        sa.text(
            "UPDATE usuarios SET fecha_creacion = :fecha "
            "WHERE correo = :correo AND fecha_creacion IS NULL"
        ),
        {
            "fecha": datetime(2024, 1, 15, 12, tzinfo=timezone.utc),
            "correo": "alejandro@dispet.test",
        },
    )


def downgrade() -> None:
    pass
