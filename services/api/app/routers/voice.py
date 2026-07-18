from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
import io
import random

from app.routers.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Mock audio transcription. Selects random CBT statements.
    """
    spoken_options = [
        "I feel really overwhelmed and tired with office research tasks.",
        "I had a beautiful day walking in nature, but I feel slightly anxious about tomorrow.",
        "My chest is feeling heavy today, I need some slow breathing guidance.",
        "I'm feeling really happy and grateful for family members today."
    ]
    return {
        "text": random.choice(spoken_options),
        "filename": file.filename
    }

@router.post("/synthesize")
async def synthesize_text(
    text: str,
    current_user: User = Depends(get_current_user)
):
    """
    Mock text-to-speech synthesis returning a dummy silent WAV stream.
    """
    # Simple silent 1-second WAV file bytes
    wav_header = (
        b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x11+'
        b'\x00\x00"V\x00\x00\x02\x00\x10\x00data\x00\x00\x00\x00'
    )
    audio_stream = io.BytesIO(wav_header)
    return StreamingResponse(audio_stream, media_type="audio/wav")
