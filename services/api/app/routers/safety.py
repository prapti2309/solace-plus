from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.session import get_db
from app.routers.auth import get_current_user
from app.models.models import User, SafetyEvent
from app.schemas.schemas import SafetyReportCreate, SafetyReportResponse, CrisisResource

router = APIRouter(prefix="/safety", tags=["safety"])

# ─── Crisis Resource Registry ─────────────────────────────────────────────────
# Clinically reviewed resources. In production, this would be managed via a
# CMS with clinical advisor oversight and locale-based filtering.

CRISIS_RESOURCES: List[dict] = [
    # ── Global ────────────────────────────────────────────────────────────────
    {
        "name": "Crisis Text Line",
        "description": "Free, 24/7 text-based crisis support. Text HOME to connect with a trained crisis counsellor.",
        "phone": "Text HOME to 741741",
        "url": "https://www.crisistextline.org",
        "available_24h": True,
        "region": "global"
    },
    {
        "name": "International Association for Suicide Prevention",
        "description": "Directory of crisis centres worldwide. Find a local resource in your country.",
        "phone": None,
        "url": "https://www.iasp.info/resources/Crisis_Centres/",
        "available_24h": True,
        "region": "global"
    },
    {
        "name": "Befrienders Worldwide",
        "description": "Volunteer-run emotional support by phone. Available in 32+ countries.",
        "phone": None,
        "url": "https://www.befrienders.org",
        "available_24h": True,
        "region": "global"
    },
    # ── United States ─────────────────────────────────────────────────────────
    {
        "name": "988 Suicide & Crisis Lifeline",
        "description": "Call or text 988 anytime. Confidential support for people in distress.",
        "phone": "988",
        "url": "https://988lifeline.org",
        "available_24h": True,
        "region": "US"
    },
    {
        "name": "SAMHSA National Helpline",
        "description": "Free, confidential treatment referral and information for mental health and substance use disorders.",
        "phone": "1-800-662-4357",
        "url": "https://www.samhsa.gov/find-help/national-helpline",
        "available_24h": True,
        "region": "US"
    },
    # ── United Kingdom ────────────────────────────────────────────────────────
    {
        "name": "Samaritans UK",
        "description": "Free, confidential emotional support whenever you need it.",
        "phone": "116 123",
        "url": "https://www.samaritans.org",
        "available_24h": True,
        "region": "UK"
    },
    {
        "name": "CALM (Campaign Against Living Miserably)",
        "description": "Leading the movement against male suicide in the UK.",
        "phone": "0800 58 58 58",
        "url": "https://www.thecalmzone.net",
        "available_24h": True,
        "region": "UK"
    },
    # ── India ─────────────────────────────────────────────────────────────────
    {
        "name": "iCall — India",
        "description": "Free, professional psychological counselling by trained therapists via phone or chat.",
        "phone": "9152987821",
        "url": "https://icallhelpline.org",
        "available_24h": False,
        "region": "IN"
    },
    {
        "name": "Vandrevala Foundation",
        "description": "24/7 mental health helpline in India. Available in English and Hindi.",
        "phone": "1860-2662-345",
        "url": "https://www.vandrevalafoundation.com",
        "available_24h": True,
        "region": "IN"
    },
    # ── Australia ─────────────────────────────────────────────────────────────
    {
        "name": "Lifeline Australia",
        "description": "24/7 crisis support and suicide prevention services.",
        "phone": "13 11 14",
        "url": "https://www.lifeline.org.au",
        "available_24h": True,
        "region": "AU"
    },
    {
        "name": "Beyond Blue",
        "description": "Support for anxiety and depression. 24/7 helpline and online chat.",
        "phone": "1300 22 4636",
        "url": "https://www.beyondblue.org.au",
        "available_24h": True,
        "region": "AU"
    },
    # ── Canada ────────────────────────────────────────────────────────────────
    {
        "name": "Talk Suicide Canada",
        "description": "National suicide prevention service. Call or text anytime.",
        "phone": "1-833-456-4566",
        "url": "https://talksuicide.ca",
        "available_24h": True,
        "region": "CA"
    },
]


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/report", response_model=SafetyReportResponse, status_code=201)
async def report_safety_event(
    report_in: SafetyReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    User-initiated safety event report. Records the event and returns
    the logged entry. This is separate from the auto-triggered safety check
    in the chat stream.

    - **severity**: flagged | elevated | imminent
    - **message**: Optional contextual note (NOT stored — only severity + action_taken is logged)
    """
    valid_severities = {"flagged", "elevated", "imminent"}
    if report_in.severity not in valid_severities:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid severity. Must be one of: {', '.join(valid_severities)}"
        )

    # Note: raw message content is NOT stored for privacy/legal reasons.
    # Only the severity and anonymised action_taken is logged.
    action_msg = {
        "flagged": "User self-reported distress. Shown wellness resources and coping exercises.",
        "elevated": "User reported elevated distress. Shown crisis resources and trusted contact prompt.",
        "imminent": "User reported imminent risk. Shown emergency resources. Session kept open. No auto-terminate.",
    }.get(report_in.severity, "Safety event recorded.")

    event = SafetyEvent(
        user_id=current_user.id,
        severity=report_in.severity,
        action_taken=action_msg
    )
    db.add(event)
    await db.commit()

    return event


@router.get("/resources", response_model=List[CrisisResource])
async def get_crisis_resources(
    region: Optional[str] = Query(
        None,
        description="Filter by region code: global, US, UK, IN, AU, CA. Returns global + region-specific if specified."
    ),
    current_user: User = Depends(get_current_user)
):
    """
    Returns crisis support resources. Always includes globally available resources.
    Optionally filtered to include region-specific resources (e.g. region=IN for India).
    """
    if region:
        region_upper = region.upper()
        filtered = [r for r in CRISIS_RESOURCES if r["region"] == "global" or r["region"] == region_upper]
    else:
        filtered = CRISIS_RESOURCES

    return filtered


@router.get("/events/history", response_model=List[SafetyReportResponse])
async def get_my_safety_events(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the user's own safety event history (severity + action, no content).
    Supports GDPR data transparency requirements.
    """
    from sqlalchemy import select
    result = await db.execute(
        select(SafetyEvent)
        .where(SafetyEvent.user_id == current_user.id)
        .order_by(SafetyEvent.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()
