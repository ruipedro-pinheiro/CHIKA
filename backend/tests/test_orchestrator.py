"""Tests for AI Orchestrator"""
import pytest
from orchestrator.collaborator import AICollaborator

class TestAICollaborator:
    def test_extract_mentions(self):
        collaborator = AICollaborator(None, None)
        text = "Hello @claude"
        mentions = collaborator._extract_mentions(text)
        assert mentions == ['claude']
    
    def test_detect_disagreement(self):
        collaborator = AICollaborator(None, None)
        response = "I disagree"
        assert collaborator._detect_disagreement(response) == True
