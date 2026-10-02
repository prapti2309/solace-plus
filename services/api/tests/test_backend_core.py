import pytest
import json
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.models.models import User, Profile, JournalEntry
from app.core.security import get_password_hash, verify_password
from app.core.encryption import encrypt_field, decrypt_field
from app.core.redis import redis_client

@pytest.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_encryption_decryption():
    secret_text = "Private medical journal entry."
    ciphertext = encrypt_field(secret_text)
    assert secret_text not in ciphertext, "Plaintext exposed in ciphertext!"
    assert decrypt_field(ciphertext) == secret_text, "Decryption failed!"

@pytest.mark.asyncio
async def test_argon2id_password_hashing():
    password = "SuperSecretPassword123!"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

@pytest.mark.asyncio
async def test_redis_anonymous_session():
    session_id = "anon_pytest_999"
    await redis_client.set(f"anon_session:{session_id}", json.dumps({"session_id": session_id}), ex=60)
    val = await redis_client.get(f"anon_session:{session_id}")
    assert val is not None
    assert "anon_pytest_999" in val

@pytest.mark.asyncio
async def test_db_field_level_encryption_spotcheck():
    async with AsyncSessionLocal() as session:
        user = User(email="test@solaceplus.com", password_hash=get_password_hash("pass"), is_anonymous=False)
        session.add(user)
        await session.flush()

        raw_journal = "Feeling anxious about the upcoming week."
        encrypted_journal = encrypt_field(raw_journal)
        journal = JournalEntry(user_id=user.id, type="daily", content=encrypted_journal)
        session.add(journal)
        await session.commit()

        # Direct database query verify
        db_journal = (await session.execute(Base.metadata.tables['journal_entries'].select())).fetchone()
        assert raw_journal not in db_journal.content, "Direct DB query exposed plaintext sensitive content!"
        assert decrypt_field(db_journal.content) == raw_journal, "Decryption of DB column failed!"
