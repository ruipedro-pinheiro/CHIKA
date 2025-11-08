"""Mock LLM - Error handler when no AI is available"""
from typing import List, Dict

class MockLLM:
    """Error response when no real AI providers are configured"""
    
    async def chat(self, messages: List[Dict], **kwargs) -> str:
        """Return professional error message"""
        return (
            "❌ **Aucune IA n'est disponible pour le moment**\n\n"
            "Nous nous excusons pour le désagrément. "
            "Veuillez contacter l'administrateur pour configurer un fournisseur d'IA "
            "(Claude, GPT-4, Gemini, etc.).\n\n"
            "**Pour les administrateurs:**\n"
            "- Configurez une API key dans `.env`\n"
            "- Ou connectez-vous via OAuth (Claude, OpenAI)\n"
            "- Ou utilisez Ollama en local"
        )
