from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
import json

from app.db.session import get_db
from app.routers.auth import get_current_user
from app.models.models import User, Memory, Profile, MoodEntry, JournalEntry, Conversation, Message
from app.schemas.schemas import MemoryCreate, MemoryResponse, MemoryUpdate
from app.core.encryption import encrypt_field, decrypt_field

router = APIRouter(prefix="/memory", tags=["memory"])

@router.get("", response_model=List[MemoryResponse])
async def get_memories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Memory)
        .where(Memory.user_id == current_user.id)
        .order_by(Memory.created_at.desc())
    )
    memories = result.scalars().all()
    
    decrypted_mems = []
    for m in memories:
        decrypted_mems.append({
            "id": m.id,
            "user_id": m.user_id,
            "category": m.category,
            "title": m.title,
            "description": decrypt_field(m.description),
            "importance": m.importance,
            "is_locked": m.is_locked,
            "created_at": m.created_at,
            "updated_at": m.updated_at
        })
    return decrypted_mems

@router.post("", response_model=MemoryResponse)
async def create_memory(
    mem_in: MemoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify memory consent flag is enabled
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile or not profile.consent_flags.get("long_term_memory", True):
        raise HTTPException(status_code=400, detail="Memory consent is currently disabled.")
        
    new_mem = Memory(
        user_id=current_user.id,
        category=mem_in.category,
        title=mem_in.title,
        description=encrypt_field(mem_in.description),
        importance=mem_in.importance
    )
    db.add(new_mem)
    await db.commit()
    
    return {
        "id": new_mem.id,
        "user_id": new_mem.user_id,
        "category": new_mem.category,
        "title": new_mem.title,
        "description": mem_in.description,
        "importance": new_mem.importance,
        "is_locked": new_mem.is_locked,
        "created_at": new_mem.created_at,
        "updated_at": new_mem.updated_at
    }

@router.patch("/{id}", response_model=MemoryResponse)
async def update_memory(
    id: str,
    mem_update: MemoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Memory).where(Memory.id == id, Memory.user_id == current_user.id)
    )
    mem = result.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
        
    update_dict = mem_update.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        if key == "description" and val:
            mem.description = encrypt_field(val)
        else:
            setattr(mem, key, val)
            
    await db.commit()
    
    return {
        "id": mem.id,
        "user_id": mem.user_id,
        "category": mem.category,
        "title": mem.title,
        "description": decrypt_field(mem.description),
        "importance": mem.importance,
        "is_locked": mem.is_locked,
        "created_at": mem.created_at,
        "updated_at": mem.updated_at
    }

@router.delete("/{id}", status_code=204)
async def delete_memory(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Memory).where(Memory.id == id, Memory.user_id == current_user.id)
    )
    mem = result.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
        
    await db.delete(mem)
    await db.commit()
    return None

@router.post("/{id}/lock", response_model=MemoryResponse)
async def toggle_lock(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Memory).where(Memory.id == id, Memory.user_id == current_user.id)
    )
    mem = result.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
        
    mem.is_locked = not mem.is_locked
    await db.commit()
    
    return {
        "id": mem.id,
        "user_id": mem.user_id,
        "category": mem.category,
        "title": mem.title,
        "description": decrypt_field(mem.description),
        "importance": mem.importance,
        "is_locked": mem.is_locked,
        "created_at": mem.created_at,
        "updated_at": mem.updated_at
    }

@router.post("/pause", status_code=200)
async def pause_memories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    flags = dict(profile.consent_flags)
    flags["long_term_memory"] = False
    profile.consent_flags = flags
    await db.commit()
    return {"message": "Memory extraction paused"}

@router.post("/export")
async def export_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Exports ALL user-related rows to a single JSON package, satisfying GDPR data portability.
    """
    # Fetch profile
    prof_res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = prof_res.scalar_one_or_none()
    
    # Fetch moods
    moods_res = await db.execute(select(MoodEntry).where(MoodEntry.user_id == current_user.id))
    moods = moods_res.scalars().all()
    
    # Fetch journals
    journals_res = await db.execute(select(JournalEntry).where(JournalEntry.user_id == current_user.id))
    journals = journals_res.scalars().all()
    
    # Fetch memories
    memories_res = await db.execute(select(Memory).where(Memory.user_id == current_user.id))
    memories = memories_res.scalars().all()
    
    # Fetch conversations + messages
    convs_res = await db.execute(select(Conversation).where(Conversation.user_id == current_user.id))
    convs = convs_res.scalars().all()
    
    conversations_data = []
    for c in convs:
        msgs_res = await db.execute(select(Message).where(Message.conversation_id == c.id).order_by(Message.created_at.asc()))
        msgs = msgs_res.scalars().all()
        conversations_data.append({
            "title": c.title,
            "category": c.category,
            "created_at": c.created_at.isoformat(),
            "messages": [{
                "role": m.role,
                "content": decrypt_field(m.content),
                "emotion_tags": m.emotion_tags,
                "created_at": m.created_at.isoformat()
            } for m in msgs]
        })
        
    export_payload = {
        "user_email": current_user.email,
        "is_anonymous": current_user.is_anonymous,
        "created_at": current_user.created_at.isoformat(),
        "profile": {
            "name": profile.name if profile else None,
            "nickname": profile.nickname if profile else None,
            "age_group": profile.age_group if profile else None,
            "pronouns": profile.pronouns if profile else None,
            "timezone": profile.timezone if profile else None,
            "language": profile.language if profile else None,
            "goals": profile.goals if profile else None,
            "interests": profile.interests if profile else None,
            "occupation": profile.occupation if profile else None,
            "routine": profile.routine if profile else None,
            "communication_style": profile.communication_style if profile else None,
            "emergency_contact": decrypt_field(profile.emergency_contact) if (profile and profile.emergency_contact) else None,
            "consent_flags": profile.consent_flags if profile else None
        },
        "mood_logs": [{
            "mood_label": m.mood_label,
            "intensity": m.intensity,
            "note": m.note,
            "created_at": m.created_at.isoformat()
        } for m in moods],
        "journal_entries": [{
            "type": j.type,
            "content": decrypt_field(j.content),
            "ai_summary": j.ai_summary,
            "mood_tag": j.mood_tag,
            "cognitive_distortions": j.cognitive_distortions,
            "created_at": j.created_at.isoformat()
        } for j in journals],
        "memories": [{
            "category": m.category,
            "title": m.title,
            "description": decrypt_field(m.description),
            "importance": m.importance,
            "is_locked": m.is_locked,
            "created_at": m.created_at.isoformat()
        } for m in memories],
        "conversations": conversations_data
    }
    
    return export_payload
