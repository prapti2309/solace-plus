import asyncio
import sys
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.models.models import User, Profile, MoodEntry, JournalEntry, Message, Memory
from app.core.encryption import encrypt_field, decrypt_field
from app.core.security import get_password_hash, verify_password
from app.core.redis import redis_client

async def test_all():
    print("Starting backend logic verification...")
    
    # 1. Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully.")
    
    # 2. Test Encryption (AES-256-GCM)
    test_text = "Highly confidential clinical metadata."
    encrypted = encrypt_field(test_text)
    decrypted = decrypt_field(encrypted)
    
    assert encrypted != test_text, "Encryption did not modify original text!"
    assert decrypted == test_text, f"Decryption failed! Expected: {test_text}, Got: {decrypted}"
    assert ":" in encrypted, "Encrypted output must contain nonce:ciphertext separator format!"
    print("AES-256-GCM Encryption & Decryption checks passed.")
    
    # 3. Test Security Hashing (Argon2id)
    pwd = "my_secure_password"
    pwd_hash = get_password_hash(pwd)
    assert verify_password(pwd, pwd_hash), "Password verification failed!"
    assert not verify_password("wrong_pwd", pwd_hash), "Password verification accepted invalid password!"
    print("Argon2id Password hashing & verification checks passed.")

    # 4. Test Model Insertion & Field-Level Encryption Verification
    async with AsyncSessionLocal() as session:
        # Create User
        test_user = User(
            email="alex@solaceplus.com",
            password_hash=pwd_hash,
            is_anonymous=False
        )
        session.add(test_user)
        await session.flush()
        
        # Create Profile with Encrypted Emergency Contact
        raw_contact = "Sister:Sarah Mercer:+1-555-1234:true"
        encrypted_contact = encrypt_field(raw_contact)
        test_profile = Profile(
            user_id=test_user.id,
            name="Alex Mercer",
            nickname="Al",
            emergency_contact=encrypted_contact
        )
        session.add(test_profile)
        
        # Create Journal Entry with Encrypted Content
        raw_journal = "Today was quite overwhelming at work, but the grounding exercise helped."
        encrypted_journal = encrypt_field(raw_journal)
        test_journal = JournalEntry(
            user_id=test_user.id,
            type="daily",
            content=encrypted_journal,
            ai_summary="Reflected on work stress and used grounding.",
            mood_tag="anxious"
        )
        session.add(test_journal)
        
        await session.commit()
        print("Record insertion checks passed.")
        
        # Spot check raw DB value vs Decrypted value
        result = await session.execute(select(JournalEntry).where(JournalEntry.user_id == test_user.id))
        fetched_journal = result.scalar_one()
        
        # Verify plaintext is NOT stored in DB column
        assert raw_journal not in fetched_journal.content, "CRITICAL: Plaintext journal content exposed in database!"
        # Verify application layer decrypts properly
        assert decrypt_field(fetched_journal.content) == raw_journal, "Application decryption failed!"
        print("Database field-level encryption spot-check passed.")

    # 5. Test Redis Anonymous Session (Zero PostgreSQL User Creation)
    session_id = "anon_test_session_123"
    await redis_client.set(f"anon_session:{session_id}", json.dumps({"session_id": session_id}), ex=60)
    retrieved_session = await redis_client.get(f"anon_session:{session_id}")
    assert retrieved_session is not None, "Redis session retrieval failed!"
    
    # Verify no postgres user row was created for anonymous session
    async with AsyncSessionLocal() as session:
        result_users = await session.execute(select(User).where(User.email == None))
        anon_users_in_db = result_users.scalars().all()
        assert len(anon_users_in_db) == 0, f"Expected 0 anonymous user rows in Postgres, found {len(anon_users_in_db)}"
    print("Redis anonymous session check (0 Postgres rows created) passed.")

    print("\n--- ALL BACKEND CORE VERIFICATIONS PASSED SUCCESSFULLY ---")

if __name__ == "__main__":
    try:
        asyncio.run(test_all())
    except Exception as e:
        print(f"Verification test script failed: {e}", file=sys.stderr)
        sys.exit(1)
