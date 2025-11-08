"""Pytest configuration"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.room import Base


@pytest.fixture(scope="function")
def test_db():
    """Create test database"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)
