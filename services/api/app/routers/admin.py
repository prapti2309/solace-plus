from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict

from app.db.session import get_db
from app.routers.auth import get_current_user
from app.models.models import User, SafetyEvent
from app.schemas.schemas import AdminMetricsResponse, SafetyEventCountResponse

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/metrics", response_model=AdminMetricsResponse)
async def get_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Simulating simple admin role validation. In real app: Depends(require_role("support_admin"))
    return {
        "daily_active_users": 184,
        "avg_latency_ms": 192,
        "active_sessions": 8,
        "avg_session_duration_mins": 14.5,
        "model_accuracy_sentiment": "94.2%"
    }

@router.get("/safety-events", response_model=SafetyEventCountResponse)
async def get_safety_events_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Query database counts grouped by severity
    result = await db.execute(
        select(SafetyEvent.severity, func.count(SafetyEvent.id))
        .group_by(SafetyEvent.severity)
    )
    grouped_counts = result.all()
    
    counts_map = {"flagged": 0, "elevated": 0, "imminent": 0}
    total = 0
    for severity, count in grouped_counts:
        if severity in counts_map:
            counts_map[severity] = count
            total += count
            
    return {
        "total_triggers": total,
        "by_severity": counts_map
    }
