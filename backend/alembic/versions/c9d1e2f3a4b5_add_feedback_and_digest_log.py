"""add feedback and digest_log

Revision ID: c9d1e2f3a4b5
Revises: fb88e8dbea98
Create Date: 2026-06-27

"""
from alembic import op
import sqlalchemy as sa

revision = 'c9d1e2f3a4b5'
down_revision = 'fb88e8dbea98'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'feedback',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('username', sa.String(100), nullable=True),
        sa.Column('subject', sa.String(200), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        'digest_log',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('feedback')
    op.drop_table('digest_log')
