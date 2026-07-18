from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone

from app.db.session import get_db
from app.routers.auth import get_current_user
from app.models.models import User, MoodEntry
from app.schemas.schemas import MoodCreate, MoodResponse

router = APIRouter(prefix="/mood", tags=["mood"])

@router.get("", response_model=List[MoodResponse])
async def get_moods(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(MoodEntry)
        .where(MoodEntry.user_id == current_user.id)
        .order_by(MoodEntry.created_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=MoodResponse)
async def add_mood(
    mood_in: MoodCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_entry = MoodEntry(
        user_id=current_user.id,
        mood_label=mood_in.mood_label,
        intensity=mood_in.intensity,
        note=mood_in.note
    )
    db.add(new_entry)
    await db.commit()
    return new_entry

@router.get("/trends")
async def get_mood_trends(
    range: str = Query("weekly", regex="^(weekly|monthly)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    days = 7 if range == "weekly" else 30
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    result = await db.execute(
        select(MoodEntry)
        .where(MoodEntry.user_id == current_user.id, MoodEntry.created_at >= cutoff)
        .order_by(MoodEntry.created_at.asc())
    )
    entries = result.scalars().all()
    
    # Process aggregates: group by label counts
    label_counts = {}
    total_intensity = 0
    
    for entry in entries:
        label_counts[entry.mood_label] = label_counts.get(entry.mood_label, 0) + 1
        total_intensity += entry.intensity
        
    avg_intensity = total_intensity / len(entries) if entries else 0.0
    
    # Generate list of daily check-ins
    daily_history = []
    for entry in entries:
        daily_history.append({
            "date": entry.created_at.date().isoformat(),
            "mood": entry.mood_label,
            "intensity": entry.intensity
        })
        
    return {
        "range": range,
        "total_check_ins": len(entries),
        "avg_intensity": round(avg_intensity, 1),
        "mood_distribution": label_counts,
        "history": daily_history
    }
