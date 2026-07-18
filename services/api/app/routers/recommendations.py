from fastapi import APIRouter, Depends, Query
from typing import List

from app.routers.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import RecommendationResponse

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

RECOMMENDATIONS_MAP = {
    "calm": [
        { "id": "rec-1", "title": "10-Minute Quiet Reflection", "type": "Mindfulness", "duration": "10m", "url": "/wellness/meditation" },
        { "id": "rec-2", "title": "Ambient Chill Playlist", "type": "Music", "duration": "30m", "url": "https://spotify.com" },
        { "id": "rec-3", "title": "Coping Goal Review", "type": "Reflection", "duration": "5m", "url": "/memory" }
    ],
    "happy": [
        { "id": "rec-4", "title": "Gratitude Journal Entry", "type": "CBT", "duration": "5m", "url": "/journal" },
        { "id": "rec-5", "title": "Expressive Painting/Writing", "type": "Creativity", "duration": "20m", "url": "/journal" },
        { "id": "rec-6", "title": "Outdoor Walk Checklist", "type": "Activity", "duration": "15m", "url": "/wellness" }
    ],
    "sad": [
        { "id": "rec-7", "title": "Self-Compassion Writing Nudge", "type": "CBT", "duration": "8m", "url": "/journal" },
        { "id": "rec-8", "title": "Warm Tea & Body Scan", "type": "Mindfulness", "duration": "12m", "url": "/wellness" },
        { "id": "rec-9", "title": "Gentle Stretching Flow", "type": "Movement", "duration": "10m", "url": "/wellness" }
    ],
    "anxious": [
        { "id": "rec-10", "title": "Box Breathing Pacer", "type": "Breathing", "duration": "4m", "url": "/wellness/breathing" },
        { "id": "rec-11", "title": "5-4-3-2-1 Grounding Method", "type": "Grounding", "duration": "6m", "url": "/wellness/grounding" },
        { "id": "rec-12", "title": "Thought Record Reframing", "type": "CBT", "duration": "10m", "url": "/wellness/thought-record" }
    ],
    "angry": [
        { "id": "rec-13", "title": "Progressive Muscle Relaxation (PMR)", "type": "Grounding", "duration": "15m", "url": "/wellness" },
        { "id": "rec-14", "title": "Aggressive Pace Walk", "type": "Activity", "duration": "20m", "url": "/wellness" },
        { "id": "rec-15", "title": "Expressive Anger Vent Journaling", "type": "Reflection", "duration": "8m", "url": "/journal" }
    ],
    "burnout": [
        { "id": "rec-16", "title": "Deep Rest Meditation", "type": "Mindfulness", "duration": "15m", "url": "/wellness" },
        { "id": "rec-17", "title": "Digital Screen Detox Nudge", "type": "Habit", "duration": "2h", "url": "/settings" },
        { "id": "rec-18", "title": "Hydration Check-in", "type": "Wellness", "duration": "1m", "url": "/home" }
    ],
    "hopeful": [
        { "id": "rec-19", "title": "Future Self Goal Journaling", "type": "CBT", "duration": "12m", "url": "/journal" },
        { "id": "rec-20", "title": "Values Clarification Checklist", "type": "Reflection", "duration": "10m", "url": "/memory" },
        { "id": "rec-21", "title": "Plan a Nature Outing", "type": "Habits", "duration": "10m", "url": "/wellness" }
    ]
}

@router.get("", response_model=List[RecommendationResponse])
async def get_recommendations(
    mood: str = Query("calm"),
    current_user: User = Depends(get_current_user)
):
    return RECOMMENDATIONS_MAP.get(mood, RECOMMENDATIONS_MAP["calm"])
