"""add share_token to trips

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("share_token", sa.String, nullable=True))
    op.create_index("ix_trips_share_token", "trips", ["share_token"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_trips_share_token", table_name="trips")
    op.drop_column("trips", "share_token")
