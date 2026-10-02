from typing import Dict, Any, List
from app.services.emotion.emoji_mapping import extract_emoji_emotion

class EmotionClassifier:
    """
    Emotion detection classifier (V1 implementation) returning primary emotion, intensity (1-10), and secondary signals.
    """
    
    def classify(self, content: str) -> Dict[str, Any]:
        text_lower = content.lower()
        
        # 1. Emoji check
        emoji_signal = extract_emoji_emotion(content)
        
        # 2. Text keyword analysis
        primary_emotion = "calm"
        secondary_signals: List[str] = []
        intensity = 5
        
        if any(w in text_lower for w in ["happy", "joy", "excited", "glad", "awesome", "wonderful", "celebrate", "good", "great"]):
            primary_emotion = "happy"
            intensity = 8
            secondary_signals.append("positive_affect")
        elif any(w in text_lower for w in ["sad", "cry", "lonely", "hurt", "grief", "depressed", "unhappy", "down", "pain"]):
            primary_emotion = "sad"
            intensity = 7
            secondary_signals.append("low_mood")
        elif any(w in text_lower for w in ["anxious", "worry", "fear", "scared", "stress", "tight", "panic", "nervous", "breath", "overwhelmed"]):
            primary_emotion = "anxious"
            intensity = 8
            secondary_signals.append("hyperarousal")
        elif any(w in text_lower for w in ["angry", "hate", "mad", "annoyed", "frustrated", "pissed", "furious"]):
            primary_emotion = "angry"
            intensity = 7
            secondary_signals.append("frustration")
        elif any(w in text_lower for w in ["tired", "exhaust", "burnout", "drain", "sleepy", "lazy", "empty"]):
            primary_emotion = "exhausted"
            intensity = 8
            secondary_signals.append("fatigue")
        elif any(w in text_lower for w in ["hope", "future", "warm", "heal", "improve", "growth", "better"]):
            primary_emotion = "hopeful"
            intensity = 7
            secondary_signals.append("optimism")

        # Emoji signal override if present
        if emoji_signal:
            primary_emotion = emoji_signal

        return {
            "primary_emotion": primary_emotion,
            "intensity": intensity,
            "secondary_signals": secondary_signals,
            "classifier": "emotion-v1",
            "version": "1.0.0"
        }

emotion_classifier = EmotionClassifier()
