import asyncio
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import engine, AsyncSessionLocal
from app.db.base import Base
from app.models.models import User, Profile, MoodEntry
from app.core.encryption import encrypt_field, decrypt_field
from app.core.security import get_password_hash, verify_password

async def test_all():
    print("Starting backend logic verification...")
    
    # 1. Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully.")
    
    # 2. Test Encryption
    test_text = "Highly confidential clinical metadata."
    encrypted = encrypt_field(test_text)
    decrypted = decrypt_field(encrypted)
    
    assert encrypted != test_text, "Encryption did not modify original text!"
    assert decrypted == test_text, f"Decryption failed! Expected: {test_text}, Got: {decrypted}"
    print("Encryption & Decryption checks passed.")
    
    # 3. Test Security Hashing
    pwd = "my_secure_password"
    pwd_hash = get_password_hash(pwd)
    assert verify_password(pwd, pwd_hash), "Password verification failed!"
    assert not verify_password("wrong_pwd", pwd_hash), "Password verification accepted invalid password!"
    print("Password hashing & verification checks passed.")

    # 4. Test Model Insertion & Retrieval (Database Connection)
    async with AsyncSessionLocal() as session:
        # Create User
        test_user = User(
            email="alex@solaceplus.com",
            password_hash=pwd_hash,
            is_anonymous=False
        )
        session.add(test_user)
        await session.flush()
        
        # Create Profile
        test_profile = Profile(
            user_id=test_user.id,
            name="Alex Mercer",
            nickname="Al",
            emergency_contact=encrypt_field("Sister:Sarah Mercer:+1-555-1234:true")
        )
        session.add(test_profile)
        
        # Create Mood Log
        test_mood = MoodEntry(
            user_id=test_user.id,
            mood_label="calm",
            intensity=7,
            note="Verification run note"
        )
        session.add(test_mood)
        
        await session.commit()
        print("Record insertion checks passed.")
        
        # Query and Verify
        result = await session.execute(select(User).where(User.email == "alex@solaceplus.com"))
        fetched_user = result.scalar_one_or_none()
        
        assert fetched_user is not None, "Failed to retrieve user!"
        assert fetched_user.profile.nickname == "Al", f"Profile association check failed! Expected 'Al', got {fetched_user.profile.nickname}"
        
        decrypted_contact = decrypt_field(fetched_user.profile.emergency_contact)
        assert "Sarah Mercer" in decrypted_contact, f"Emergency contact decryption failed! Got: {decrypted_contact}"
        
        result_mood = await session.execute(select(MoodEntry).where(MoodEntry.user_id == fetched_user.id))
        fetched_moods = result_mood.scalars().all()
        assert len(fetched_moods) == 1, f"Expected 1 mood entry, got {len(fetched_moods)}"
        assert fetched_moods[0].mood_label == "calm", f"Expected mood 'calm', got {fetched_moods[0].mood_label}"
        
        print("Database queries and association verification passed.")

    print("\n--- ALL BACKEND CORE VERIFICATIONS PASSED ---")

if __name__ == "__main__":
    try:
        asyncio.run(test_all())
    except Exception as e:
        print(f"Verification test script failed: {e}", file=sys.stderr)
        sys.exit(1)
