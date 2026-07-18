from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime, timedelta, timezone
from collections import Counter

from app.db.session import get_db
from app.routers.auth import get_current_user
from app.models.models import User, MoodEntry, JournalEntry, Conversation, Memory
from app.schemas.schemas import ProgressSummaryResponse, StreakResponse

router = APIRouter(prefix="/progress", tags=["progress"])


def _compute_streak(dates: List[datetime]) -> tuple[int, int]:
    """
    Given a list of datetimes, compute the current and longest consecutive-day streak.
    Returns (current_streak, longest_streak).
    """
    if not dates:
        return 0, 0

    # Deduplicate to date-level
    unique_dates = sorted(set(d.date() for d in dates), reverse=True)

    today = datetime.now(timezone.utc).date()

    current_streak = 0
    longest_streak = 0
    streak = 0
    prev_date = None

    for date in unique_dates:
        if prev_date is None:
            # Must have activity today or yesterday to start streak
            if (today - date).days <= 1:
                streak = 1
            else:
                break
        elif (prev_date - date).days == 1:
            streak += 1
        else:
            # Gap — reset
            if current_streak == 0:
                current_streak = streak
            streak = 1

        longest_streak = max(longest_streak, streak)
        prev_date = date

    if current_streak == 0:
        current_streak = streak

    return current_streak, longest_streak


@router.get("/summary", response_model=ProgressSummaryResponse)
async def get_progress_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns a holistic progress summary: total activity counts, streak, wellness score,
    dominant mood, and last 7 days of mood history.
    """
    # ── Count totals ──────────────────────────────────────────────────────────
    mood_count_res = await db.execute(
        select(func.count(MoodEntry.id)).where(MoodEntry.user_id == current_user.id)
    )
    total_moods = mood_count_res.scalar() or 0

    journal_count_res = await db.execute(
        select(func.count(JournalEntry.id)).where(JournalEntry.user_id == current_user.id)
    )
    total_journals = journal_count_res.scalar() or 0

    conv_count_res = await db.execute(
        select(func.count(Conversation.id)).where(Conversation.user_id == current_user.id)
    )
    total_convs = conv_count_res.scalar() or 0

    mem_count_res = await db.execute(
        select(func.count(Memory.id)).where(Memory.user_id == current_user.id)
    )
    total_mems = mem_count_res.scalar() or 0

    # ── Streak calculation ────────────────────────────────────────────────────
    mood_dates_res = await db.execute(
        select(MoodEntry.created_at).where(MoodEntry.user_id == current_user.id)
    )
    mood_dates = [row[0] for row in mood_dates_res.fetchall()]
    current_streak, longest_streak = _compute_streak(mood_dates)

    # ── Last 7 days mood history ──────────────────────────────────────────────
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    recent_moods_res = await db.execute(
        select(MoodEntry)
        .where(MoodEntry.user_id == current_user.id, MoodEntry.created_at >= cutoff)
        .order_by(MoodEntry.created_at.asc())
    )
    recent_moods = recent_moods_res.scalars().all()

    last_7_days = [
        {"date": m.created_at.date().isoformat(), "mood": m.mood_label, "intensity": m.intensity}
        for m in recent_moods
    ]

    # ── Most frequent mood (all time) ─────────────────────────────────────────
    all_moods_res = await db.execute(
        select(MoodEntry.mood_label).where(MoodEntry.user_id == current_user.id)
    )
    all_mood_labels = [row[0] for row in all_moods_res.fetchall()]
    most_frequent_mood = Counter(all_mood_labels).most_common(1)[0][0] if all_mood_labels else None

    # ── Wellness score (0–100) ────────────────────────────────────────────────
    # Simple heuristic: weighted contribution from each activity type + streak bonus
    mood_score = min(total_moods * 3, 30)      # Max 30 pts from check-ins
    journal_score = min(total_journals * 4, 25) # Max 25 pts from journaling
    chat_score = min(total_convs * 3, 20)       # Max 20 pts from chat
    memory_score = min(total_mems * 2, 10)      # Max 10 pts from memories
    streak_bonus = min(current_streak * 2, 15)  # Max 15 pts from streak

    wellness_score = float(mood_score + journal_score + chat_score + memory_score + streak_bonus)
    wellness_score = min(wellness_score, 100.0)

    return {
        "total_mood_checkins": total_moods,
        "total_journal_entries": total_journals,
        "total_chat_sessions": total_convs,
        "total_memories": total_mems,
        "mood_checkin_streak": current_streak,
        "wellness_score": round(wellness_score, 1),
        "most_frequent_mood": most_frequent_mood,
        "last_7_days_moods": last_7_days,
    }


@router.get("/streaks", response_model=StreakResponse)
async def get_streaks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculates the user's current and longest mood check-in streak.
    A streak is defined as consecutive calendar days with at least one mood entry.
    """
    mood_dates_res = await db.execute(
        select(MoodEntry.created_at).where(MoodEntry.user_id == current_user.id)
    )
    mood_dates = [row[0] for row in mood_dates_res.fetchall()]
    current_streak, longest_streak = _compute_streak(mood_dates)

    unique_dates = sorted(set(d.date() for d in mood_dates), reverse=True)
    last_active = unique_dates[0].isoformat() if unique_dates else None

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_active_date": last_active,
    }
