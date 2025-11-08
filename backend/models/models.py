"""Database models for Multi-AI System"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime

Base = declarative_base()

class Session(Base):
    """Chat session"""
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String, unique=True, index=True)
    title = Column(String, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")

class Message(Base):
    """Chat message"""
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    role = Column(String)  # 'user' or 'assistant'
    content = Column(Text)
    ai_provider = Column(String, nullable=True)  # 'claude', 'gpt', 'gemini', or None for user
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("Session", back_populates="messages")

# Database setup
engine = create_engine("sqlite:///./multi-ai-system.db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
