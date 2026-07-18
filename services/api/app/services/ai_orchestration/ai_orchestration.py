import json
import asyncio
from typing import AsyncGenerator, Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.encryption import encrypt_field, decrypt_field
from app.models.models import Message, Conversation, Memory, SafetyEvent
from anthropic import AsyncAnthropic

# Crisis keywords mapping to Safety Severity levels
CRISIS_KEYWORDS = ["suicide", "kill myself", "end my life", "hurt myself", "cut myself", "want to die", "better off dead"]

PERSONALITY_PROMPTS = {
    "listener": (
        "You are Solace, a gentle listener. Your style is deeply empathetic, warm, and validation-focused. "
        "Do not offer unsolicited advice or structured action items unless explicitly asked. Focus on reflection, "
        "active listening, and compassionate presence. Use short, soothing paragraphs."
    ),
    "coach": (
        "You are Solace, a practical wellness coach. Your style is solution-focused, supportive, and structured. "
        "After acknowledging and validating feelings, guide the user to identify what is within their control, "
        "and help them break down challenges into small, actionable steps. Use clear bullet points and simple goals."
    ),
    "motivator": (
        "You are Solace, an inspiring motivator. Your style is energetic, positive, and empowering. "
        "Acknowledge the weight of struggles, but actively remind the user of their resilience, past survival, "
        "and strengths. Focus on cultivating momentum, small victories, and self-belief."
    ),
    "guide": (
        "You are Solace, a reflective guide. Your style is philosophical, mindful, and values-oriented. "
        "Encourage the user to look inward, observe their thoughts and sensations without judgment, and explore "
        "what their emotions reveal about their core values and boundaries. Use gentle, open-ended questions."
    )
}

# Local fallback templates for offline / mock testing
FALLBACK_RESPONSES = {
    "listener": {
        "happy": "I am so glad to hear that! Celebrating these moments of joy is so important. What stood out to you the most about this experience? I'm here to listen to all the details.",
        "calm": "It sounds like you're in a very peaceful space right now. That kind of equilibrium is beautiful. Let's sit with this quiet feeling. What is keeping you grounded today?",
        "sad": "I'm so sorry you're carrying this sadness. It can feel so heavy and isolating. I'm right here with you, and there's no pressure to feel any other way. What does the sadness feel like it needs right now?",
        "anxious": "Anxiety can feel like a storm inside. I'm here with you. Let's take a slow, gentle breath. You don't have to figure anything out right now. What's one small physical sensation you feel around you?",
        "angry": "It makes complete sense that you're feeling frustrated. Anger is a natural response when things feel unfair or blocked. I want to give you space to express it. What feels like the most challenging part of this?",
        "burnout": "You sound completely drained. Working on empty is exhausting. Please give yourself permission to just rest and do nothing. How can we make the next hour as simple and demands-free as possible?",
        "hopeful": "It's wonderful to feel that spark of hope. It's like seeing the sunrise after a long night. What is making you feel optimistic about what lies ahead?",
    },
    "coach": {
        "happy": "This is a great win! Let's log this as a success. What actions did you take that led to this positive outcome, and how can we replicate this habit in the future?",
        "calm": "Excellent state of balance. Let's use this calm focus to review your routine. Are there any small adjustments you want to make to maintain this focus?",
        "sad": "I hear that you're down. Let's treat this with self-compassion first, and then ask: what is one very tiny, low-effort step we can take today to support yourself? Maybe drinking water or stretching?",
        "anxious": "Anxiety is high. Let's break this overwhelm down. Write down the top 3 worries. Now, let's identify what is actually in your control, and what is not. What is the single next step in your control?",
        "angry": "Anger carries a lot of energy. Let's channel it productively. What boundary was crossed here, and how can we assertively but calmly communicate that boundary to others?",
        "burnout": "Burnout requires structured recovery. Let's audit your tasks. What can we delegate, delay, or drop entirely? Your primary task right now is restoring your energy reservoir.",
        "hopeful": "Fantastic outlook. Let's build momentum on this. What goal or milestone can we align this positive energy toward today?",
    },
    "motivator": {
        "happy": "Yes! You are thriving! Soak this in! You've worked hard, and you deserve to feel every bit of this happiness. Keep shining!",
        "calm": "This is the calm before your next great achievement! Enjoy the peace, rest up, and know that you are laying the foundation for great things ahead. You've got this!",
        "sad": "I know it's dark right now, but remember: you have survived 100% of your hardest days. This feeling is real, but it is also temporary. You are stronger than you think!",
        "anxious": "Feel the fear, and take one breath anyway! You don't need to control the future, just take the next step. You've handled tough things before, and you will handle this too!",
        "angry": "Use that fire! Anger shows you what you care about. Take that energy, focus it, and let's turn it into a positive force for change. You are capable of handling this!",
        "burnout": "Even heroes need to rest! Pushing through isn't strength; knowing when to pause is. Rest is active preparation for your comeback. I believe in you!",
        "hopeful": "Love that energy! Hope is a powerful fuel. Let's run with it! What exciting thing are we going to tackle next?",
    },
    "guide": {
        "happy": "Let us reflect on this joy. In what ways does this happy moment align with your core values? Recognizing these connections helps us live more intentionally.",
        "calm": "Quiet mindfulness. In this calm, we see things as they are, without judgment. What does this stillness teach you about what your mind needs to feel whole?",
        "sad": "Sadness is a quiet teacher. It showing us what we cared for and what we have lost. Let us sit with this grief gently. What does it reveal about your capacity to care?",
        "anxious": "Anxiety often speaks of our desire to protect ourselves. Let us thank our mind for trying to keep us safe, but gently remind it that we are safe right now. What is this worry trying to protect you from?",
        "angry": "Anger points directly to our boundaries and core values. When we look beneath the anger, what soft spot or boundary is seeking protection?",
        "burnout": "Burnout is the soul's demand for stillness. It is a sign that our routines are out of sync with our natural rhythms. Let us reflect on where you might be over-extending yourself.",
        "hopeful": "Hope is a compass pointing toward growth. What does this hopeful feeling say about the path you are paving for yourself?",
    }
}

def perform_safety_check(content: str) -> str:
    """
    Keyword and rule-based safety screening.
    Returns: "none", "flagged", "elevated", "imminent"
    """
    text_lower = content.lower()
    for word in CRISIS_KEYWORDS:
        if word in text_lower:
            return "imminent"
    
    # Milder alerts (flagged)
    flagged_words = ["depressed", "hate life", "no way out", "self-harm"]
    for word in flagged_words:
        if word in text_lower:
            return "flagged"
            
    return "none"

def detect_emotion(content: str) -> str:
    """
    Rule-based emotion detection mimicking local ML sentiment analysis.
    Returns: calm, happy, sad, anxious, angry, burnout, hopeful
    """
    text_lower = content.lower()
    if any(w in text_lower for w in ["happy", "joy", "excited", "glad", "awesome", "wonderful", "celebrate", "good"]):
        return "happy"
    if any(w in text_lower for w in ["sad", "cry", "lonely", "hurt", "grief", "depressed", "unhappy", "down", "pain"]):
        return "sad"
    if any(w in text_lower for w in ["anxious", "worry", "fear", "scared", "stress", "tight", "panic", "nervous", "breath"]):
        return "anxious"
    if any(w in text_lower for w in ["angry", "hate", "mad", "annoyed", "frustrated", "pissed", "furious"]):
        return "angry"
    if any(w in text_lower for w in ["tired", "exhaust", "burnout", "drain", "sleepy", "lazy", "overwhelmed", "empty"]):
        return "burnout"
    if any(w in text_lower for w in ["hope", "future", "excited", "warm", "heal", "improve", "growth", "better"]):
        return "hopeful"
    return "calm"

async def retrieve_memories(db: AsyncSession, user_id: str, content: str) -> List[Memory]:
    """
    Looks up relevant database memories using simple string inclusion as a local RAG fallback.
    """
    text_lower = content.lower()
    # Load all user memories
    result = await db.execute(select(Memory).where(Memory.user_id == user_id))
    all_memories = result.scalars().all()
    
    matched = []
    for m in all_memories:
        decrypted_desc = decrypt_field(m.description)
        decrypted_title = m.title
        
        # Simple RAG matching
        words_in_desc = decrypted_desc.lower().split()
        words_in_title = decrypted_title.lower().split()
        
        if any(w in text_lower for w in words_in_title if len(w) > 3) or \
           any(w in text_lower for w in words_in_desc if len(w) > 4):
            matched.append(m)
            
    return matched

async def extract_candidate_memories(content: str) -> List[Dict[str, Any]]:
    """
    Analyzes the message content to see if there are statements that indicate a fact to remember.
    Returns list of candidate facts with category and suggested importance.
    """
    text_lower = content.lower()
    candidates = []
    
    # Mocking memory fact extraction
    if "sister" in text_lower or "brother" in text_lower or "family" in text_lower:
        candidates.append({
            "title": "Family dynamic detail",
            "description": "User shared details regarding family relationships.",
            "category": "family",
            "importance": 3
        })
    if "triggered" in text_lower or "scares me" in text_lower or "hate when" in text_lower:
        candidates.append({
            "title": "Emotional trigger identified",
            "description": f"User expressed emotional trigger: '{content[:50]}...'",
            "category": "triggers",
            "importance": 4
        })
    if "want to" in text_lower or "my goal" in text_lower or "working on" in text_lower:
        candidates.append({
            "title": "Stated goal",
            "description": f"User expressed a goal: '{content[:50]}...'",
            "category": "goals",
            "importance": 3
        })
        
    return candidates

async def stream_chat_response(
    db: AsyncSession,
    conversation_id: str,
    user_id: str,
    content: str,
    persona: str = "listener"
) -> AsyncGenerator[str, None]:
    """
    Streams the chat process over SSE using the structure:
    event: status -> Listening...
    event: emotion -> detected emotion
    event: token -> text chunks
    event: done -> final payload
    """
    # 1. Safety check
    safety_level = perform_safety_check(content)
    if safety_level in ["elevated", "imminent"]:
        # Log safety event
        safety_event = SafetyEvent(
            user_id=user_id,
            severity=safety_level,
            action_taken="Safety trigger matched. Redirected client to safety page."
        )
        db.add(safety_event)
        await db.commit()
        
        yield f"event: safety_redirect\ndata: {json.dumps({'severity': safety_level})}\n\n"
        yield "event: done\ndata: {}\n\n"
        return

    # Add user message to Database
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=encrypt_field(content)
    )
    db.add(user_msg)
    await db.flush()

    # 2. Emit status
    yield f"event: status\ndata: {json.dumps({'status': 'listening'})}\n\n"
    await asyncio.sleep(0.3)
    
    # 3. Detect emotion and emit
    emotion = detect_emotion(content)
    yield f"event: emotion\ndata: {json.dumps({'primary_emotion': emotion, 'intensity': 8})}\n\n"
    
    yield f"event: status\ndata: {json.dumps({'status': 'reflecting'})}\n\n"
    await asyncio.sleep(0.3)
    
    # 4. Memory retrieval
    memories = await retrieve_memories(db, user_id, content)
    memory_context = ""
    if memories:
        descriptions = [decrypt_field(m.description) for m in memories]
        memory_context = "\n[Retrieved User Memories]: " + " | ".join(descriptions)
        
    yield f"event: status\ndata: {json.dumps({'status': 'understanding'})}\n\n"
    await asyncio.sleep(0.2)
    
    yield f"event: status\ndata: {json.dumps({'status': 'thinking'})}\n\n"
    await asyncio.sleep(0.2)

    # 5. Call Anthropic or Fallback response generator
    full_response = ""
    
    if settings.ANTHROPIC_API_KEY:
        try:
            client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            system_prompt = PERSONALITY_PROMPTS.get(persona, PERSONALITY_PROMPTS["listener"])
            
            # Fetch recent conversation history
            result = await db.execute(
                select(Message)
                .where(Message.conversation_id == conversation_id)
                .order_by(Message.created_at.desc())
                .limit(10)
            )
            history_messages = list(reversed(result.scalars().all()))
            
            messages_payload = []
            for h in history_messages[:-1]:  # Exclude current unsaved message to avoid duplication
                messages_payload.append({
                    "role": h.role,
                    "content": decrypt_field(h.content)
                })
            
            # Add current message with retrieved memory context
            messages_payload.append({
                "role": "user",
                "content": content + memory_context
            })
            
            # Call Anthropic message stream
            async with client.messages.stream(
                max_tokens=1000,
                system=system_prompt,
                messages=messages_payload,
                model="claude-3-5-sonnet-20241022"
            ) as stream:
                yield f"event: status\ndata: {json.dumps({'status': 'speaking'})}\n\n"
                async for text in stream.text_stream:
                    full_response += text
                    # SSE Token event
                    yield f"event: token\ndata: {json.dumps({'token': text})}\n\n"
        except Exception as e:
            # If Anthropic API call fails, fallback gracefully to mock stream
            print(f"Anthropic API failed: {e}. Falling back to mock response.")
            settings.ANTHROPIC_API_KEY = ""  # Temporarily disable to trigger fallback
            
    if not settings.ANTHROPIC_API_KEY:
        # Fallback local CBT message stream
        response_template = FALLBACK_RESPONSES.get(persona, FALLBACK_RESPONSES["listener"]).get(emotion, "I am here with you.")
        
        # Stream word by word
        words = response_template.split(" ")
        yield f"event: status\ndata: {json.dumps({'status': 'speaking'})}\n\n"
        for word in words:
            chunk = word + " "
            full_response += chunk
            yield f"event: token\ndata: {json.dumps({'token': chunk})}\n\n"
            await asyncio.sleep(0.05)

    # Save Assistant Response to DB
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=encrypt_field(full_response.strip()),
        emotion_tags={"primary_emotion": emotion, "intensity": 8}
    )
    db.add(assistant_msg)
    
    # Extract candidate memories dynamically to cache/present later if consent flags allow
    # (Memory persistence runs at conversation end or dynamically via client approval)
    
    await db.commit()
    yield "event: done\ndata: {}\n\n"
