from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.routers.auth import get_current_user
from app.models.models import User, JournalEntry
from app.schemas.schemas import JournalCreate, JournalResponse
from app.core.encryption import encrypt_field, decrypt_field

router = APIRouter(prefix="/journal", tags=["journal"])

def detect_distortions(content: str) -> List[str]:
    """
    Local distortion detection helper based on linguistic keywords.
    """
    distortions = []
    text_lower = content.lower()
    if any(w in text_lower for w in ["never", "always", "nothing", "everything"]):
        distortions.append("All-or-Nothing Thinking")
    if any(w in text_lower for w in ["worst", "ruin", "disaster", "fail"]):
        distortions.append("Catastrophizing")
    if any(w in text_lower for w in ["should", "must", "ought to"]):
        distortions.append("Should Statements")
    return distortions

@router.get("", response_model=List[JournalResponse])
async def get_journals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.created_at.desc())
    )
    entries = result.scalars().all()
    
    decrypted_entries = []
    for entry in entries:
        decrypted_entries.append({
            "id": entry.id,
            "user_id": entry.user_id,
            "type": entry.type,
            "content": decrypt_field(entry.content),
            "ai_summary": entry.ai_summary,
            "mood_tag": entry.mood_tag,
            "cognitive_distortions": entry.cognitive_distortions,
            "created_at": entry.created_at
        })
    return decrypted_entries

@router.post("", response_model=JournalResponse)
async def create_journal(
    journal_in: JournalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Detect distortions locally
    distortions = detect_distortions(journal_in.content)
    
    new_entry = JournalEntry(
        user_id=current_user.id,
        type=journal_in.type,
        content=encrypt_field(journal_in.content),
        mood_tag=journal_in.mood_tag,
        cognitive_distortions=distortions if distortions else None
    )
    db.add(new_entry)
    await db.commit()
    
    return {
        "id": new_entry.id,
        "user_id": new_entry.user_id,
        "type": new_entry.type,
        "content": journal_in.content,
        "ai_summary": new_entry.ai_summary,
        "mood_tag": new_entry.mood_tag,
        "cognitive_distortions": new_entry.cognitive_distortions,
        "created_at": new_entry.created_at
    }

@router.post("/{id}/summarize", response_model=JournalResponse)
async def summarize_journal(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(JournalEntry).where(JournalEntry.id == id, JournalEntry.user_id == current_user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
        
    # Generate mock AI summary based on keywords
    decrypted_content = decrypt_field(entry.content)
    content_lower = decrypted_content.lower()
    
    summary = "Expressed general thoughts and emotions, resolving to practice mindfulness."
    if "sarah" in content_lower:
        summary = "Reflected on relationship dynamics, explicitly mentioning supportive interaction with sister Sarah."
    elif "work" in content_lower or "burnout" in content_lower:
        summary = "Expressed stress related to professional launch tasks, detailing feelings of fatigue and overwhelm."
    
    entry.ai_summary = summary
    await db.commit()
    
    return {
        "id": entry.id,
        "user_id": entry.user_id,
        "type": entry.type,
        "content": decrypted_content,
        "ai_summary": entry.ai_summary,
        "mood_tag": entry.mood_tag,
        "cognitive_distortions": entry.cognitive_distortions,
        "created_at": entry.created_at
    }
