"""Room Models - Chat room with multi-AI collaboration

Models for rooms, messages, and AI discussions.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import json

Base = declarative_base()

class Room(Base):
    """Chat room with user + multiple AIs"""
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String(100), unique=True, index=True)
    title = Column(String(200))
    user_id = Column(String(100))  # User identifier
    active_ais = Column(Text)  # JSON list: ['claude', 'gpt', 'grok']
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = relationship("Message", back_populates="room", cascade="all, delete-orphan")
    discussions = relationship("AIDiscussion", back_populates="room", cascade="all, delete-orphan")
    
    @property
    def ai_list(self):
        """Parse active_ais JSON"""
        return json.loads(self.active_ais) if self.active_ais else []
    
    @ai_list.setter
    def ai_list(self, value):
        """Set active_ais as JSON"""
        self.active_ais = json.dumps(value)


class Message(Base):
    """Message in a room (from user or AI)"""
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    role = Column(String(20))  # 'user' or 'assistant'
    author = Column(String(50))  # 'user' or AI name ('claude', 'gpt', etc.)
    content = Column(Text)
    mentions = Column(Text)  # JSON list of @mentions
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # If this message triggered a private AI discussion
    discussion_id = Column(Integer, ForeignKey("ai_discussions.id"), nullable=True)
    
    # Relationships
    room = relationship("Room", back_populates="messages")
    discussion = relationship("AIDiscussion", foreign_keys=[discussion_id])
    
    @property
    def mention_list(self):
        """Parse mentions JSON"""
        return json.loads(self.mentions) if self.mentions else []
    
    @mention_list.setter
    def mention_list(self, value):
        """Set mentions as JSON"""
        self.mentions = json.dumps(value)


class AIDiscussion(Base):
    """Private discussion between AIs (not shown to user by default)"""
    __tablename__ = "ai_discussions"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    participants = Column(Text)  # JSON list: ['claude', 'grok']
    topic = Column(String(500))  # What they're discussing
    messages = Column(Text)  # JSON list of discussion messages
    consensus = Column(Text, nullable=True)  # Final consensus (if reached)
    status = Column(String(20), default="ongoing")  # 'ongoing', 'resolved', 'timeout'
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationship
    room = relationship("Room", back_populates="discussions")
    
    @property
    def participant_list(self):
        return json.loads(self.participants) if self.participants else []
    
    @participant_list.setter
    def participant_list(self, value):
        self.participants = json.dumps(value)
    
    @property
    def message_list(self):
        return json.loads(self.messages) if self.messages else []
    
    @message_list.setter
    def message_list(self, value):
        self.messages = json.dumps(value)
    
    def add_message(self, ai_name: str, content: str):
        """Add a message to the discussion"""
        msgs = self.message_list
        msgs.append({
            'ai': ai_name,
            'content': content,
            'timestamp': datetime.utcnow().isoformat()
        })
        self.message_list = msgs


# Database setup
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./chika.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
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
