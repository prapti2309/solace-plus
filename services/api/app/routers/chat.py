from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.routers.auth import get_current_user
from app.models.models import User, Conversation, Message
from app.schemas.schemas import ConversationCreate, ConversationResponse, MessageResponse, MessageCreate, ConversationTitleUpdate
from app.services.ai_orchestration.ai_orchestration import stream_chat_response, detect_emotion, encrypt_field, decrypt_field

router = APIRouter(tags=["chat"])

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.is_pinned.desc(), Conversation.created_at.desc())
    )
    return result.scalars().all()

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conv_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_conv = Conversation(
        user_id=current_user.id,
        title=conv_in.title,
        category=conv_in.category
    )
    db.add(new_conv)
    await db.commit()
    return new_conv

@router.delete("/conversations/{id}", status_code=204)
async def delete_conversation(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation).where(Conversation.id == id, Conversation.user_id == current_user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    await db.delete(conv)
    await db.commit()
    return None

@router.post("/conversations/{id}/pin", response_model=List[ConversationResponse])
async def toggle_pin(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation).where(Conversation.id == id, Conversation.user_id == current_user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    conv.is_pinned = not conv.is_pinned
    await db.commit()
    
    # Return updated list
    return await get_conversations(current_user, db)

@router.put("/conversations/{id}/title", response_model=ConversationResponse)
async def rename_conversation(
    id: str,
    title_in: ConversationTitleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Rename a conversation's title.
    """
    result = await db.execute(
        select(Conversation).where(Conversation.id == id, Conversation.user_id == current_user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.title = title_in.title
    await db.commit()
    return conv

@router.get("/conversations/search", response_model=List[ConversationResponse])
async def search_conversations(
    q: str = Query(..., min_length=1, description="Search term for conversation titles"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Search conversations by title (case-insensitive substring match).
    """
    result = await db.execute(
        select(Conversation)
        .where(
            Conversation.user_id == current_user.id,
            Conversation.title.ilike(f"%{q}%")
        )
        .order_by(Conversation.created_at.desc())
    )
    return result.scalars().all()


@router.get("/conversations/{id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify access
    result = await db.execute(
        select(Conversation).where(Conversation.id == id, Conversation.user_id == current_user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()
    
    decrypted_msgs = []
    for m in messages:
        decrypted_msgs.append({
            "id": m.id,
            "role": m.role,
            "content": decrypt_field(m.content),
            "emotion_tags": m.emotion_tags,
            "created_at": m.created_at
        })
    return decrypted_msgs

@router.get("/chat/stream")
async def chat_stream_get(
    conversation_id: str,
    content: str,
    persona: str = "listener",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Server-Sent Events (SSE) streaming endpoint using GET query parameters.
    """
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return StreamingResponse(
        stream_chat_response(db, conversation_id, current_user.id, content, persona),
        media_type="text/event-stream"
    )

@router.post("/chat/message", response_model=MessageResponse)
async def chat_message_post(
    conversation_id: str,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fallback non-streaming message endpoint.
    """
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Persist user message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=encrypt_field(msg_in.content)
    )
    db.add(user_msg)

    # Detect emotion
    emotion = detect_emotion(msg_in.content)
    
    # Retrieve mock / fallback response text
    from app.services.ai_orchestration.ai_orchestration import FALLBACK_RESPONSES
    response_template = FALLBACK_RESPONSES.get(msg_in.persona, FALLBACK_RESPONSES["listener"]).get(emotion, "I am here with you.")
    
    # Persist assistant message
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=encrypt_field(response_template),
        emotion_tags={"primary_emotion": emotion, "intensity": 8}
    )
    db.add(assistant_msg)
    await db.commit()

    return {
        "id": assistant_msg.id,
        "role": assistant_msg.role,
        "content": response_template,
        "emotion_tags": assistant_msg.emotion_tags,
        "created_at": assistant_msg.created_at
    }
