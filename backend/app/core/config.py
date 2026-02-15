import os
from pathlib import Path
from dotenv import load_dotenv

# env_path = Path(__file__).resolve().parents[1] / ".env"
# load_dotenv(dotenv_path=env_path)
load_dotenv(override=True)
class Settings:
    DB_USER: str = os.getenv("DB_USER")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: str = os.getenv("DB_PORT", "4000")
    DB_DATABASE: str = os.getenv("DB_DATABASE")

    AZURE_OPENAI_API_KEY: str = os.getenv("AZURE_OPENAI_API_KEY")
    AZURE_OPENAI_ENDPOINT: str = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_API_VERSION: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    AZURE_OPENAI_DEPLOYMENT: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")

    CONTACT_EMAIL: str = os.getenv("CONTACT_EMAIL")

    CORS_ALLOW_ORIGINS: str = os.getenv("CORS_ALLOW_ORIGINS", "*")
    CORS_ALLOW_CREDENTIALS: bool = os.getenv("CORS_ALLOW_CREDENTIALS", "True") == "True"
    CORS_ALLOW_METHODS: str = os.getenv("CORS_ALLOW_METHODS", "*")
    CORS_ALLOW_HEADERS: str = os.getenv("CORS_ALLOW_HEADERS", "*")

settings = Settings()
