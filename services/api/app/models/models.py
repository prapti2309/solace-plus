import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy import String, Integer, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(50), default="email")  # email, google, anonymous
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[str] = mapped_column(String(30), default="user")  # user, support_admin, system_admin
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    profile: Mapped["Profile"] = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    consent_logs: Mapped[List["ConsentLog"]] = relationship("ConsentLog", back_populates="user", cascade="all, delete-orphan")
    mood_logs: Mapped[List["MoodEntry"]] = relationship("MoodEntry", back_populates="user", cascade="all, delete-orphan")
    journal_entries: Mapped[List["JournalEntry"]] = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    conversations: Mapped[List["Conversation"]] = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    memories: Mapped[List["Memory"]] = relationship("Memory", back_populates="user", cascade="all, delete-orphan")
    safety_events: Mapped[List["SafetyEvent"]] = relationship("SafetyEvent", back_populates="user", cascade="all, delete-orphan")
    notification_pref: Mapped["NotificationPreference"] = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"
    
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    nickname: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    age_group: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    pronouns: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    timezone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    language: Mapped[Optional[str]] = mapped_column(String(50), default="English")
    goals: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    interests: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    routine: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    communication_style: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Encrypted fields
    emergency_contact: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Consent configuration flags
    consent_flags: Mapped[Dict[str, bool]] = mapped_column(JSON, default=lambda: {
        "profile": True,
        "chat_history": True,
        "mood_tracking": True,
        "journal_summary": True,
        "long_term_memory": True,
        "voice_analysis": False
    })

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")


class ConsentLog(Base):
    __tablename__ = "consent_logs"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    field_name: Mapped[str] = mapped_column(String(100))
    action: Mapped[str] = mapped_column(String(20))  # granted, revoked
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    user: Mapped["User"] = relationship("User", back_populates="consent_logs")


class MoodEntry(Base):
    __tablename__ = "mood_entries"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    mood_label: Mapped[str] = mapped_column(String(50))  # happy, calm, sad, anxious, angry, burnout, hopeful
    intensity: Mapped[int] = mapped_column(Integer, default=5)  # 1 to 10
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    user: Mapped["User"] = relationship("User", back_populates="mood_logs")


class JournalEntry(Base):
    __tablename__ = "journal_entries"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(String(20), default="daily")  # daily, gratitude, voice
    
    # Encrypted content field
    content: Mapped[str] = mapped_column(Text)
    
    # AI Summary
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mood_tag: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    cognitive_distortions: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    user: Mapped["User"] = relationship("User", back_populates="journal_entries")


class Conversation(Base):
    __tablename__ = "conversations"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100), default="general")
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="conversations")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    conversation_id: Mapped[str] = mapped_column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(String(20))  # user, assistant
    
    # Encrypted content
    content: Mapped[str] = mapped_column(Text)
    
    # Emotion tags attached to each chat response
    emotion_tags: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    # Relationships
    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")


class Memory(Base):
    __tablename__ = "memories"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    category: Mapped[str] = mapped_column(String(100))  # goals, family, relationships, triggers, preferences, coping, notes
    title: Mapped[str] = mapped_column(String(255))
    
    # Encrypted content
    description: Mapped[str] = mapped_column(Text)
    
    importance: Mapped[int] = mapped_column(Integer, default=3)  # 1 to 5
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    vector_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    user: Mapped["User"] = relationship("User", back_populates="memories")


class SafetyEvent(Base):
    __tablename__ = "safety_events"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    severity: Mapped[str] = mapped_column(String(50))  # flagged, elevated, imminent
    action_taken: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    user: Mapped["User"] = relationship("User", back_populates="safety_events")


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)

    # Toggle flags for each notification type
    mood_reminders: Mapped[bool] = mapped_column(Boolean, default=True)
    journal_nudges: Mapped[bool] = mapped_column(Boolean, default=True)
    hydration_reminders: Mapped[bool] = mapped_column(Boolean, default=False)
    gratitude_prompts: Mapped[bool] = mapped_column(Boolean, default=True)
    weekly_reports: Mapped[bool] = mapped_column(Boolean, default=True)
    therapy_reminders: Mapped[bool] = mapped_column(Boolean, default=False)

    # Quiet hours (24h format strings, e.g. "22:00")
    quiet_hours_start: Mapped[Optional[str]] = mapped_column(String(5), nullable=True, default="22:00")
    quiet_hours_end: Mapped[Optional[str]] = mapped_column(String(5), nullable=True, default="08:00")

    # Preferred delivery channel
    channel: Mapped[str] = mapped_column(String(20), default="in_app")  # in_app, push, email

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    user: Mapped["User"] = relationship("User", back_populates="notification_pref")
