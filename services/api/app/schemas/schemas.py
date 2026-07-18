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
