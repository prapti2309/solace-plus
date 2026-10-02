import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Solace+"
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # DB Configuration
    DATABASE_URL: str = "sqlite+aiosqlite:///./solace.db"
    
    # Security Configurations
    JWT_SECRET: str = "solace_plus_super_secret_jwt_signature_key_2026_change_in_prod"
    JWT_REFRESH_SECRET: str = "solace_plus_super_secret_refresh_jwt_key_2026_change_in_prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # Cryptography key for field level encryption (must decode to 32 bytes)
    FIELD_ENCRYPTION_KEY: str = "jZ86fK72xLmNq9vB4c2dX1zP0qOwNuMlKjIhGfEdCbA="
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # AI Credentials
    ANTHROPIC_API_KEY: str = ""
    
    # CORS Origins
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]

settings = Settings()
