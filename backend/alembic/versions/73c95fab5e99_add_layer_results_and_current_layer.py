"""add_layer_results_and_current_layer

Revision ID: 73c95fab5e99
Revises: d96d2d1891d5
Create Date: 2026-05-12 16:33:43.503067

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '73c95fab5e99'
down_revision: Union[str, Sequence[str], None] = 'd96d2d1891d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add layer result columns
    op.add_column('distillations', sa.Column('layer1_result', sa.dialects.postgresql.JSONB, nullable=True))
    op.add_column('distillations', sa.Column('layer2_result', sa.dialects.postgresql.JSONB, nullable=True))
    op.add_column('distillations', sa.Column('layer3_result', sa.dialects.postgresql.JSONB, nullable=True))
    op.add_column('distillations', sa.Column('current_layer', sa.String(20), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('distillations', 'current_layer')
    op.drop_column('distillations', 'layer3_result')
    op.drop_column('distillations', 'layer2_result')
    op.drop_column('distillations', 'layer1_result')
