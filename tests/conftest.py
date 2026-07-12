import sys
from pathlib import Path

import pytest
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

# Ajouter le dossier backend au PYTHONPATH pour que les tests importent `app` correctement.
ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.models import accompagnement, dossier_demandeur, portefeuille  # noqa: F401
from app.models.base import Base


@pytest.fixture(scope="session")
def event_loop():
    loop = __import__("asyncio").new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def engine(tmp_path_factory) -> AsyncEngine:
    database_path = tmp_path_factory.mktemp("data") / "test.db"
    database_url = f"sqlite+aiosqlite:///{database_path}"
    engine = create_async_engine(database_url, echo=False, future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest.fixture
async def async_session(engine: AsyncEngine) -> AsyncSession:
    async_session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with async_session_factory() as session:
        yield session
        await session.rollback()
