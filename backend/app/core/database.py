from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv(override=True)

# --- Database Config from .env ---
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "4000")
DB_DATABASE = os.getenv("DB_DATABASE")

# --- Validation ---
if not all([DB_USER, DB_PASSWORD, DB_HOST, DB_DATABASE]):
    raise RuntimeError("❌ Missing database environment variables. Check your .env file.")

# --- Safely encode credentials ---
user = quote_plus(DB_USER)
pwd = quote_plus(DB_PASSWORD)

# --- Build Database URL ---
DATABASE_URL = f"mysql+mysqlconnector://{user}:{pwd}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"

# --- SQLAlchemy Engine ---
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # avoid stale connections
    pool_recycle=3600,    # reconnect every hour
)

# --- Session Factory ---
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Base class for models ---
Base = declarative_base()

# --- Dependency for FastAPI ---
def get_db():
    """Provide a database session for request scope."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
