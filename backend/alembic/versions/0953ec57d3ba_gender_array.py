"""gender array

Revision ID: 0953ec57d3ba
Revises: cfd34fd1fb38
Create Date: 2026-06-18 20:21:01.460027

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0953ec57d3ba'
down_revision: Union[str, Sequence[str], None] = 'cfd34fd1fb38'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE characters ALTER COLUMN gender TYPE VARCHAR[] "
        "USING ARRAY[gender]::VARCHAR[]"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE characters ALTER COLUMN gender TYPE VARCHAR(20) "
        "USING gender[1]"
    )
