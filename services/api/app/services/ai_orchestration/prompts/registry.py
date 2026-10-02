from app.services.ai_orchestration.prompts.gentle_listener import SYSTEM_PROMPT as LISTENER_PROMPT, PROMPT_VERSION as LISTENER_VER
from app.services.ai_orchestration.prompts.practical_coach import SYSTEM_PROMPT as COACH_PROMPT, PROMPT_VERSION as COACH_VER
from app.services.ai_orchestration.prompts.motivator import SYSTEM_PROMPT as MOTIVATOR_PROMPT, PROMPT_VERSION as MOTIVATOR_VER
from app.services.ai_orchestration.prompts.reflective_guide import SYSTEM_PROMPT as GUIDE_PROMPT, PROMPT_VERSION as GUIDE_VER

PROMPT_REGISTRY = {
    "listener": {"prompt": LISTENER_PROMPT, "version": LISTENER_VER},
    "gentle_listener": {"prompt": LISTENER_PROMPT, "version": LISTENER_VER},
    "coach": {"prompt": COACH_PROMPT, "version": COACH_VER},
    "practical_coach": {"prompt": COACH_PROMPT, "version": COACH_VER},
    "motivator": {"prompt": MOTIVATOR_PROMPT, "version": MOTIVATOR_VER},
    "guide": {"prompt": GUIDE_PROMPT, "version": GUIDE_VER},
    "reflective_guide": {"prompt": GUIDE_PROMPT, "version": GUIDE_VER},
}

def get_system_prompt(personality_mode: str) -> tuple[str, str]:
    """
    Returns (system_prompt_text, prompt_version) for the specified personality mode.
    Defaults to gentle_listener.
    """
    entry = PROMPT_REGISTRY.get(personality_mode.lower(), PROMPT_REGISTRY["listener"])
    return entry["prompt"], entry["version"]
