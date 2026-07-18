from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional

from app.routers.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import WellnessExerciseResponse

router = APIRouter(prefix="/wellness", tags=["wellness"])

# ─── Static Exercise Library ─────────────────────────────────────────────────
# This is a static, versioned content library. In a production system, this
# would be backed by a CMS or a versioned JSON file to allow content updates
# without code deploys.

EXERCISE_LIBRARY: List[dict] = [
    {
        "id": "ex-001",
        "title": "Box Breathing (4-4-4-4)",
        "category": "breathing",
        "description": "A military-grade breathing technique that activates the parasympathetic nervous system, reduces cortisol, and resets the mind under acute stress or anxiety.",
        "duration_minutes": 4,
        "difficulty": "easy",
        "tags": ["anxiety", "stress", "calm", "focus"],
        "steps": [
            {"step": 1, "instruction": "Sit upright. Close your eyes and relax your shoulders.", "duration_seconds": 10},
            {"step": 2, "instruction": "Inhale slowly through your nose.", "duration_seconds": 4},
            {"step": 3, "instruction": "Hold your breath gently. Do not strain.", "duration_seconds": 4},
            {"step": 4, "instruction": "Exhale slowly and fully through your mouth.", "duration_seconds": 4},
            {"step": 5, "instruction": "Hold at the bottom — lungs empty, at ease.", "duration_seconds": 4},
            {"step": 6, "instruction": "Repeat this cycle 4–8 times. You may open your eyes when ready.", "duration_seconds": None},
        ]
    },
    {
        "id": "ex-002",
        "title": "4-7-8 Relaxation Breath",
        "category": "breathing",
        "description": "Dr. Andrew Weil's relaxation breath technique. Especially effective for sleep onset, high anxiety, or emotional flooding. The extended exhale activates the vagus nerve.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "tags": ["anxiety", "sleep", "calm", "stress"],
        "steps": [
            {"step": 1, "instruction": "Sit or lie down comfortably. Place the tip of your tongue on the ridge just behind your upper front teeth.", "duration_seconds": None},
            {"step": 2, "instruction": "Exhale completely through your mouth, making a whoosh sound.", "duration_seconds": None},
            {"step": 3, "instruction": "Close your mouth and inhale quietly through your nose.", "duration_seconds": 4},
            {"step": 4, "instruction": "Hold your breath.", "duration_seconds": 7},
            {"step": 5, "instruction": "Exhale completely through your mouth, making a whoosh sound.", "duration_seconds": 8},
            {"step": 6, "instruction": "This is one cycle. Repeat 3–4 times. Do not do more than 4 cycles on your first attempt.", "duration_seconds": None},
        ]
    },
    {
        "id": "ex-003",
        "title": "5-4-3-2-1 Grounding",
        "category": "grounding",
        "description": "A sensory awareness exercise that interrupts anxiety spirals and panic by anchoring you firmly in the present moment. Engages all five senses sequentially.",
        "duration_minutes": 6,
        "difficulty": "easy",
        "tags": ["anxiety", "panic", "grounding", "present moment"],
        "steps": [
            {"step": 1, "instruction": "Look around and name 5 things you can SEE. State each one to yourself: 'I see the lamp. I see the window...'", "duration_seconds": None},
            {"step": 2, "instruction": "Name 4 things you can physically TOUCH. Notice the texture, temperature, and weight.", "duration_seconds": None},
            {"step": 3, "instruction": "Name 3 things you can HEAR right now. Listen for distant sounds, not just obvious ones.", "duration_seconds": None},
            {"step": 4, "instruction": "Name 2 things you can SMELL, or 2 smells you enjoy. You may move to smell something if needed.", "duration_seconds": None},
            {"step": 5, "instruction": "Name 1 thing you can TASTE right now — the inside of your mouth, a recent drink, anything.", "duration_seconds": None},
            {"step": 6, "instruction": "Take three slow breaths. Notice that you are here, you are safe, and this moment is real.", "duration_seconds": None},
        ]
    },
    {
        "id": "ex-004",
        "title": "Progressive Muscle Relaxation (PMR)",
        "category": "grounding",
        "description": "A full-body tension-release technique that systematically relaxes each muscle group. Excellent for releasing anger, physical tension, or pre-sleep wind-down.",
        "duration_minutes": 15,
        "difficulty": "medium",
        "tags": ["anger", "stress", "burnout", "sleep", "tension"],
        "steps": [
            {"step": 1, "instruction": "Lie down or sit in a comfortable position. Close your eyes. Take 3 slow breaths.", "duration_seconds": None},
            {"step": 2, "instruction": "Clench your fists tightly. Hold.", "duration_seconds": 5},
            {"step": 3, "instruction": "Release completely. Feel the difference. Breathe.", "duration_seconds": 10},
            {"step": 4, "instruction": "Tighten your biceps by bending your arms. Hold.", "duration_seconds": 5},
            {"step": 5, "instruction": "Release completely. Breathe.", "duration_seconds": 10},
            {"step": 6, "instruction": "Scrunch your face — furrow brow, squeeze eyes, tighten jaw. Hold.", "duration_seconds": 5},
            {"step": 7, "instruction": "Release. Breathe. Feel your face soften.", "duration_seconds": 10},
            {"step": 8, "instruction": "Tighten your shoulders toward your ears. Hold.", "duration_seconds": 5},
            {"step": 9, "instruction": "Drop them completely. Breathe.", "duration_seconds": 10},
            {"step": 10, "instruction": "Tighten your stomach muscles. Hold.", "duration_seconds": 5},
            {"step": 11, "instruction": "Release. Breathe.", "duration_seconds": 10},
            {"step": 12, "instruction": "Tighten your legs — thighs, calves, toes all at once. Hold.", "duration_seconds": 5},
            {"step": 13, "instruction": "Release completely. Let your whole body feel heavy and warm.", "duration_seconds": 10},
            {"step": 14, "instruction": "Breathe slowly and rest. Scan your body for any remaining tension and gently let it go.", "duration_seconds": None},
        ]
    },
    {
        "id": "ex-005",
        "title": "Thought Record (CBT)",
        "category": "cbt",
        "description": "A core Cognitive Behavioural Therapy technique for identifying and reframing negative automatic thoughts. Helps break the cycle of cognitive distortions.",
        "duration_minutes": 10,
        "difficulty": "medium",
        "tags": ["anxiety", "sad", "cbt", "distortions", "reframing"],
        "steps": [
            {"step": 1, "instruction": "Situation: What happened? Describe the situation as objectively as possible — just the facts, no interpretations.", "duration_seconds": None},
            {"step": 2, "instruction": "Emotion: What emotion(s) did you feel? Rate each on a scale of 1–10. (e.g. Anxious: 8, Sad: 5)", "duration_seconds": None},
            {"step": 3, "instruction": "Automatic Thought: What thought automatically came to mind? Write it down exactly as it appeared.", "duration_seconds": None},
            {"step": 4, "instruction": "Evidence FOR: What evidence supports this thought being true?", "duration_seconds": None},
            {"step": 5, "instruction": "Evidence AGAINST: What evidence contradicts this thought? What would a balanced observer say?", "duration_seconds": None},
            {"step": 6, "instruction": "Balanced Thought: Write a more balanced, realistic thought that accounts for both sides.", "duration_seconds": None},
            {"step": 7, "instruction": "Re-rate Emotion: How do you feel now? Rate the same emotion(s) from Step 2 again. Notice the shift.", "duration_seconds": None},
        ]
    },
    {
        "id": "ex-006",
        "title": "Self-Compassion Break",
        "category": "mindfulness",
        "description": "Dr. Kristin Neff's self-compassion exercise. Counters self-criticism with kindness. Especially effective for sadness, shame, or self-blame.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "tags": ["sad", "self-criticism", "shame", "mindfulness", "compassion"],
        "steps": [
            {"step": 1, "instruction": "Think of a difficult situation causing you pain or self-criticism right now. Feel it gently.", "duration_seconds": None},
            {"step": 2, "instruction": "Mindfulness: Say to yourself: 'This is a moment of suffering. This hurts.' Acknowledge the pain without exaggerating or suppressing it.", "duration_seconds": None},
            {"step": 3, "instruction": "Common Humanity: Say: 'Suffering is part of life. I am not alone in feeling this way. Others feel this too.'", "duration_seconds": None},
            {"step": 4, "instruction": "Self-Kindness: Place a hand on your heart. Say: 'May I be kind to myself. May I give myself the compassion I need.'", "duration_seconds": None},
            {"step": 5, "instruction": "Sit with this feeling for a moment. Notice if anything has softened. You don't need to fix anything right now.", "duration_seconds": None},
        ]
    },
    {
        "id": "ex-007",
        "title": "Gratitude Reflection",
        "category": "cbt",
        "description": "A positive psychology exercise to actively redirect attention toward what is working. Consistent practice has been shown to improve baseline mood and reduce negativity bias.",
        "duration_minutes": 5,
        "difficulty": "easy",
        "tags": ["hopeful", "happy", "positive", "reflection"],
        "steps": [
            {"step": 1, "instruction": "Find a quiet moment. Open your journal or simply reflect in your mind.", "duration_seconds": None},
            {"step": 2, "instruction": "Name 3 specific things you are grateful for today. They don't have to be big — a warm cup of tea counts.", "duration_seconds": None},
            {"step": 3, "instruction": "For each one, ask: Why does this matter to me? How would I feel if it were absent?", "duration_seconds": None},
            {"step": 4, "instruction": "Savour each one for a moment. Let yourself feel the warmth of appreciation.", "duration_seconds": None},
            {"step": 5, "instruction": "Close by identifying one small thing you're looking forward to tomorrow.", "duration_seconds": None},
        ]
    },
    {
        "id": "ex-008",
        "title": "Body Scan Meditation",
        "category": "mindfulness",
        "description": "A mindfulness practice that systematically moves attention through the body, releasing held tension and reconnecting you with physical sensations. Effective for burnout and disconnection.",
        "duration_minutes": 12,
        "difficulty": "easy",
        "tags": ["burnout", "mindfulness", "sleep", "calm", "disconnect"],
        "steps": [
            {"step": 1, "instruction": "Lie on your back with arms at your sides. Close your eyes. Take 3 full breaths.", "duration_seconds": None},
            {"step": 2, "instruction": "Bring attention to the soles of your feet. Notice any sensations — tingling, warmth, pressure, or numbness.", "duration_seconds": None},
            {"step": 3, "instruction": "Slowly move attention upward: ankles, calves, knees, thighs. Just observe — don't try to change anything.", "duration_seconds": None},
            {"step": 4, "instruction": "Notice your pelvis and lower back. Is there any tightness? Breathe into it.", "duration_seconds": None},
            {"step": 5, "instruction": "Scan your abdomen and chest. Notice the rise and fall with each breath.", "duration_seconds": None},
            {"step": 6, "instruction": "Move to your hands, forearms, upper arms, and shoulders. Let them be heavy.", "duration_seconds": None},
            {"step": 7, "instruction": "Scan your neck and face — jaw, eyes, forehead. Let all muscles soften.", "duration_seconds": None},
            {"step": 8, "instruction": "Take a full-body awareness. Feel yourself whole. Rest here as long as you need.", "duration_seconds": None},
        ]
    },
]

# Build a lookup dict for O(1) access
_EXERCISE_MAP = {ex["id"]: ex for ex in EXERCISE_LIBRARY}


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("/exercises", response_model=List[WellnessExerciseResponse])
async def list_exercises(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Return all wellness exercises, optionally filtered by category or tag.

    - **category**: breathing | grounding | cbt | movement | mindfulness
    - **tag**: e.g. anxiety, sleep, burnout, anger
    """
    exercises = EXERCISE_LIBRARY

    if category:
        exercises = [e for e in exercises if e["category"] == category.lower()]

    if tag:
        exercises = [e for e in exercises if tag.lower() in e["tags"]]

    return exercises


@router.get("/exercises/{exercise_id}", response_model=WellnessExerciseResponse)
async def get_exercise(
    exercise_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get the full details and guided steps for a specific wellness exercise.
    """
    exercise = _EXERCISE_MAP.get(exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise
