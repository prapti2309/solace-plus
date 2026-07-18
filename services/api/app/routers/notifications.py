from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.routers.auth import get_current_user
from app.models.models import User, NotificationPreference
from app.schemas.schemas import NotificationPreferenceResponse, NotificationPreferenceUpdate

router = APIRouter(prefix="/notifications", tags=["notifications"])


async def _get_or_create_pref(
    user_id: str, db: AsyncSession
) -> NotificationPreference:
    """
    Returns the user's NotificationPreference row, creating it with
    sensible defaults if it doesn't exist yet.
    """
    result = await db.execute(
        select(NotificationPreference).where(NotificationPreference.user_id == user_id)
    )
    pref = result.scalar_one_or_none()

    if pref is None:
        pref = NotificationPreference(user_id=user_id)
        db.add(pref)
        await db.commit()
        await db.refresh(pref)

    return pref


@router.get("/preferences", response_model=NotificationPreferenceResponse)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the current user's notification preferences.
    A default row is created on first access if none exists.
    """
    pref = await _get_or_create_pref(current_user.id, db)
    return pref


@router.put("/preferences", response_model=NotificationPreferenceResponse)
async def update_notification_preferences(
    pref_update: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update one or more notification preferences.
    Only fields explicitly provided in the request body are changed.

    - **channel**: `in_app` | `push` | `email`
    - **quiet_hours_start / quiet_hours_end**: 24h format strings, e.g. `"22:00"`
    """
    pref = await _get_or_create_pref(current_user.id, db)

    update_dict = pref_update.model_dump(exclude_unset=True)

    # Validate channel if provided
    if "channel" in update_dict and update_dict["channel"] not in ("in_app", "push", "email"):
        raise HTTPException(
            status_code=400,
            detail="Invalid channel. Must be one of: in_app, push, email"
        )

    for key, val in update_dict.items():
        setattr(pref, key, val)

    await db.commit()
    await db.refresh(pref)
    return pref
