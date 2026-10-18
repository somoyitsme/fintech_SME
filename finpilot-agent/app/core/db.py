"""SQLAlchemy 2.0 async engine and session management.

Provides:
- ``engine``: global async engine
- ``AsyncSession``: session factory
- ``get_db()``: FastAPI dependency for request-scoped sessions
- ``init_db()``: creates all tables (development only)
"""
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession as SQLAlchemyAsyncSession,
    create_async_engine,
    async_sessionmaker,
)

from config import settings
from app.core.models import Base


engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    future=True,
)

AsyncSession = async_sessionmaker(
    engine,
    class_=SQLAlchemyAsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncIterator[SQLAlchemyAsyncSession]:
    """FastAPI dependency providing a request-scoped database session."""
    async with AsyncSession() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables. Development only; use Alembic in production."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


DBSession = Annotated[SQLAlchemyAsyncSession, Depends(get_db)]
