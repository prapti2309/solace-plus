"""
Emoji-to-Emotion mapping dictionary for Solace+
"""

EMOJI_TO_EMOTION = {
    # Sad
    "😭": "sad",
    "😢": "sad",
    "😔": "sad",
    "😞": "sad",
    "💔": "sad",
    "🥺": "sad",
    
    # Anxious
    "😰": "anxious",
    "😟": "anxious",
    "😨": "anxious",
    "😬": "anxious",
    "⚡": "anxious",
    
    # Angry
    "😡": "angry",
    "🤬": "angry",
    "😤": "angry",
    "👿": "angry",
    
    # Happy
    "😊": "happy",
    "😁": "happy",
    "🥰": "happy",
    "😄": "happy",
    "✨": "happy",
    "🎉": "happy",
    
    # Calm
    "😌": "calm",
    "🙂": "calm",
    "🧘": "calm",
    "🌿": "calm",
    
    # Exhausted / Burnout
    "😩": "exhausted",
    "😴": "exhausted",
    "🥱": "exhausted",
    "😵": "exhausted",
}

def extract_emoji_emotion(text: str) -> str | None:
    """
    Extracts emotion signal from emojis present in text string if any exist.
    """
    for char in text:
        if char in EMOJI_TO_EMOTION:
            return EMOJI_TO_EMOTION[char]
    return None
