import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.db.session import get_db
from app.core.config import settings
from app.core.redis import redis_client
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, verify_token
from app.core.encryption import encrypt_field, decrypt_field
from app.models.models import User, Profile, ConsentLog
from app.schemas.schemas import UserRegister, UserLogin, Token, TokenRefresh, UserResponse, ProfileResponse, ProfileUpdate, ConsentUpdate, EmergencyContactSchema

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
        
    payload = verify_token(token)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception
        
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=Token)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    if user_in.email:
        result = await db.execute(select(User).where(User.email == user_in.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password) if user_in.password else None,
        is_anonymous=user_in.is_anonymous,
        auth_provider="email" if user_in.email else "anonymous"
    )
    db.add(new_user)
    await db.flush()  # Populates user id

    # Create empty profile
    new_profile = Profile(
        user_id=new_user.id,
        name="Anonymous User" if user_in.is_anonymous else "",
        nickname="User" if user_in.is_anonymous else "",
        language="English",
        consent_flags={
            "profile": True,
            "chat_history": True,
            "mood_tracking": True,
            "journal_summary": True,
            "long_term_memory": True,
            "voice_analysis": False
        }
    )
    db.add(new_profile)

    # Log initial consent
    consent_log = ConsentLog(
        user_id=new_user.id,
        field_name="onboarding_profile",
        action="granted"
    )
    db.add(consent_log)
    
    await db.commit()

    # Generate tokens
    access_token = create_access_token({"sub": new_user.id})
    refresh_token = create_refresh_token({"sub": new_user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()
    
    if not user or not user.password_hash or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        
    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(token_in: TokenRefresh, db: AsyncSession = Depends(get_db)):
    """
    Exchange a valid refresh token for a new access + refresh token pair.
    """
    payload = verify_token(token_in.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access_token = create_access_token({"sub": user.id})
    new_refresh_token = create_refresh_token({"sub": user.id})

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.post("/anonymous", response_model=Token)
async def anonymous_login():
    """
    Creates an ephemeral anonymous session stored in Redis with 24-hour expiration.
    Does NOT create a row in the PostgreSQL users table.
    """
    session_id = f"anon_{uuid.uuid4()}"
    session_data = json.dumps({
        "session_id": session_id,
        "is_anonymous": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Store session in Redis for 24 hours (86400 seconds)
    await redis_client.set(f"anon_session:{session_id}", session_data, ex=86400)

    access_token = create_access_token({"sub": session_id, "is_anonymous": True})
    refresh_token = create_refresh_token({"sub": session_id, "is_anonymous": True})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Decrypt emergency contact
    contact_data = None
    if profile.emergency_contact:
        decrypted = decrypt_field(profile.emergency_contact)
        parts = decrypted.split(":")
        if len(parts) >= 3:
            contact_data = {
                "name": parts[1] if len(parts) == 4 else parts[0],
                "relationship": parts[0] if len(parts) == 4 else "",
                "phone": parts[2],
                "consent": parts[3] == "true" if len(parts) == 4 else True
            }
            
    return {
        "user_id": profile.user_id,
        "name": profile.name,
        "nickname": profile.nickname,
        "age_group": profile.age_group,
        "pronouns": profile.pronouns,
        "timezone": profile.timezone,
        "language": profile.language,
        "goals": profile.goals,
        "interests": profile.interests,
        "occupation": profile.occupation,
        "routine": profile.routine,
        "communication_style": profile.communication_style,
        "emergency_contact": contact_data,
        "consent_flags": profile.consent_flags
    }

@router.put("/profile", response_model=ProfileResponse)
async def update_profile(profile_update: ProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_dict = profile_update.model_dump(exclude_unset=True)
    
    for key, val in update_dict.items():
        if key == "emergency_contact" and val:
            # Encrypt emergency contact
            encoded_str = f"{val['relationship']}:{val['name']}:{val['phone']}:{'true' if val['consent'] else 'false'}"
            profile.emergency_contact = encrypt_field(encoded_str)
        elif key == "consent_flags" and val:
            # Audit log for changed flags
            for flag, status in val.items():
                if flag in profile.consent_flags and profile.consent_flags[flag] != status:
                    log = ConsentLog(
                        user_id=current_user.id,
                        field_name=flag,
                        action="granted" if status else "revoked"
                    )
                    db.add(log)
            profile.consent_flags = val
        else:
            setattr(profile, key, val)

    await db.commit()
    return await get_profile(current_user, db)

@router.put("/consent", response_model=ProfileResponse)
async def update_consent(consent_update: ConsentUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    flags = dict(profile.consent_flags)
    if consent_update.field not in flags:
        raise HTTPException(status_code=400, detail="Invalid consent flag field")

    if flags[consent_update.field] != consent_update.consent:
        flags[consent_update.field] = consent_update.consent
        profile.consent_flags = flags
        
        # Log audit trail
        log = ConsentLog(
            user_id=current_user.id,
            field_name=consent_update.field,
            action="granted" if consent_update.consent else "revoked"
        )
        db.add(log)
        await db.commit()

    return await get_profile(current_user, db)

@router.get("/status")
async def check_status(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    return {"isOnboarded": profile is not None}

@router.delete("/purge", status_code=204)
async def purge_data(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Deleting user cascades all deletions via cascade="all, delete-orphan"
    await db.delete(current_user)
    await db.commit()
    return None
