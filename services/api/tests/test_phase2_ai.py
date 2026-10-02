import pytest
import json
from app.services.emotion.classifier import emotion_classifier
from app.services.ai_orchestration.prompts.registry import get_system_prompt
from app.services.ai_orchestration.ai_orchestration import perform_safety_check

def test_emotion_classification():
    res1 = emotion_classifier.classify("I feel so overwhelmed and anxious about college 😰")
    assert res1["primary_emotion"] == "anxious"
    assert res1["intensity"] == 8

    res2 = emotion_classifier.classify("I had a great day today! 😊")
    assert res2["primary_emotion"] == "happy"

def test_prompt_registry():
    prompt, version = get_system_prompt("gentle_listener")
    assert "Solace" in prompt
    assert version == "1.0.0"

    coach_prompt, coach_ver = get_system_prompt("practical_coach")
    assert "practical wellness coach" in coach_prompt

def test_safety_screening():
    level_imminent = perform_safety_check("I want to end my life")
    assert level_imminent == "imminent"

    level_normal = perform_safety_check("I had a stressful meeting at work today")
    assert level_normal == "none"
