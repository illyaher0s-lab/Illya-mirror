"""
Configuration management for Mirror application
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://localhost:5432/mirror_db")
    
    # API Keys
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    
    # Application
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    APP_NAME: str = "Mirror - 认知数据提取引擎"
    VERSION: str = "0.1.0"


settings = Settings()
