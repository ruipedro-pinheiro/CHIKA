"""Chika TUI - Terminal interface"""
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Input, Static, ListView, ListItem
from textual.containers import Container
from textual.binding import Binding
import httpx
from rich.text import Text

API_URL = "http://localhost:8000"

class ChikaTUI(App):
    CSS = """
    #messages { height: 1fr; border: solid green; }
    Input { width: 100%; }
    """
    
    BINDINGS = [Binding("ctrl+c", "quit", "Quit")]
    
    def __init__(self):
        super().__init__()
        self.room_id = None
    
    def compose(self) -> ComposeResult:
        yield Header()
        yield Container(ListView(id="messages"))
        yield Input(placeholder="Message...", id="input")
        yield Footer()
    
    async def on_mount(self):
        """Create room on start"""
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{API_URL}/rooms", json={"title": "CLI"})
            self.room_id = resp.json()['room_id']
    
    async def on_input_submitted(self, event: Input.Submitted):
        """Send message"""
        if not self.room_id:
            return
        
        async with httpx.AsyncClient(timeout=60) as client:
            await client.post(f"{API_URL}/chat", json={
                "room_id": self.room_id,
                "content": event.value
            })
        
        event.input.value = ""

if __name__ == "__main__":
    app = ChikaTUI()
    app.run()
