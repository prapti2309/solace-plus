from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str
    type: str  # "access" or "refresh"
    exp: int

class TokenRefresh(BaseModel):
    refresh_token: str

# User Auth Schemas
class UserRegister(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_anonymous: bool = False

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    is_anonymous: bool
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Emergency Contact Schema
class EmergencyContactSchema(BaseModel):
    name: str
    relationship: str
    phone: str
    consent: bool

# Profile Schemas
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    nickname: Optional[str] = None
    age_group: Optional[str] = None
    pronouns: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    occupation: Optional[str] = None
    routine: Optional[List[str]] = None
    communication_style: Optional[str] = None
    emergency_contact: Optional[EmergencyContactSchema] = None
    consent_flags: Optional[Dict[str, bool]] = None

class ProfileResponse(BaseModel):
    user_id: str
    name: Optional[str] = None
    nickname: Optional[str] = None
    age_group: Optional[str] = None
    pronouns: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    occupation: Optional[str] = None
    routine: Optional[List[str]] = None
    communication_style: Optional[str] = None
    emergency_contact: Optional[EmergencyContactSchema] = None
    consent_flags: Dict[str, bool]

    class Config:
        from_attributes = True

class ConsentUpdate(BaseModel):
    field: str  # e.g., "long_term_memory", "voice_analysis"
    consent: bool

# Mood Schemas
class MoodCreate(BaseModel):
    mood_label: str  # happy, calm, sad, anxious, angry, burnout, hopeful
    intensity: int = Field(..., ge=1, le=10)
    note: Optional[str] = None

class MoodResponse(BaseModel):
    id: str
    user_id: str
    mood_label: str
    intensity: int
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Journal Schemas
class JournalCreate(BaseModel):
    type: str = "daily"  # daily, gratitude, voice
    content: str
    mood_tag: Optional[str] = None

class JournalResponse(BaseModel):
    id: str
    user_id: str
    type: str
    content: str  # Returned decrypted
    ai_summary: Optional[str] = None
    mood_tag: Optional[str] = None
    cognitive_distortions: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Memory Schemas
class MemoryCreate(BaseModel):
    category: str  # goals, family, relationships, triggers, preferences, coping, notes
    title: str
    description: str
    importance: int = Field(3, ge=1, le=5)

class MemoryUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    importance: Optional[int] = Field(None, ge=1, le=5)
    is_locked: Optional[bool] = None

class MemoryResponse(BaseModel):
    id: str
    user_id: str
    category: str
    title: str
    description: str  # Returned decrypted
    importance: int
    is_locked: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Message Schemas
class MessageCreate(BaseModel):
    content: str
    persona: str = "listener"  # listener, coach, motivator, guide

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str  # Returned decrypted
    emotion_tags: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Conversation Schemas
class ConversationCreate(BaseModel):
    title: str
    category: str = "general"

class ConversationTitleUpdate(BaseModel):
    title: str

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    category: str
    is_pinned: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Recommendations Schemas
class RecommendationResponse(BaseModel):
    id: str
    title: str
    type: str
    duration: str
    url: str

# Admin Metrics Schemas
class AdminMetricsResponse(BaseModel):
    daily_active_users: int
    avg_latency_ms: int
    active_sessions: int
    avg_session_duration_mins: float
    model_accuracy_sentiment: str

class SafetyEventCountResponse(BaseModel):
    total_triggers: int
    by_severity: Dict[str, int]

# ─── Wellness Schemas ────────────────────────────────────────────────────────

class WellnessStep(BaseModel):
    step: int
    instruction: str
    duration_seconds: Optional[int] = None

class WellnessExerciseResponse(BaseModel):
    id: str
    title: str
    category: str          # breathing, grounding, cbt, movement, mindfulness
    description: str
    duration_minutes: int
    difficulty: str        # easy, medium
    tags: List[str]
    steps: List[WellnessStep]

# ─── Progress Schemas ────────────────────────────────────────────────────────

class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_active_date: Optional[str] = None

class ProgressSummaryResponse(BaseModel):
    total_mood_checkins: int
    total_journal_entries: int
    total_chat_sessions: int
    total_memories: int
    mood_checkin_streak: int
    wellness_score: float   # 0–100 computed score
    most_frequent_mood: Optional[str] = None
    last_7_days_moods: List[Dict[str, Any]]

# ─── Safety Schemas ──────────────────────────────────────────────────────────

class SafetyReportCreate(BaseModel):
    message: Optional[str] = None   # Optional context from user
    severity: str = "flagged"       # flagged, elevated, imminent

class SafetyReportResponse(BaseModel):
    id: str
    severity: str
    action_taken: str
    created_at: datetime

    class Config:
        from_attributes = True

class CrisisResource(BaseModel):
    name: str
    description: str
    phone: Optional[str] = None
    url: Optional[str] = None
    available_24h: bool
    region: str  # global, US, UK, IN, AU, CA, etc.

# ─── Notification Preference Schemas ─────────────────────────────────────────

class NotificationPreferenceResponse(BaseModel):
    user_id: str
    mood_reminders: bool
    journal_nudges: bool
    hydration_reminders: bool
    gratitude_prompts: bool
    weekly_reports: bool
    therapy_reminders: bool
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    channel: str
    updated_at: datetime

    class Config:
        from_attributes = True

class NotificationPreferenceUpdate(BaseModel):
    mood_reminders: Optional[bool] = None
    journal_nudges: Optional[bool] = None
    hydration_reminders: Optional[bool] = None
    gratitude_prompts: Optional[bool] = None
    weekly_reports: Optional[bool] = None
    therapy_reminders: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    channel: Optional[str] = None  # in_app, push, email
