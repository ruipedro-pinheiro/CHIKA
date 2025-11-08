// === CONFIG ===
const API_URL = 'http://localhost:8000'
const AIS = [
    { id: 'claude', name: 'Claude', emoji: '🤖', color: 'var(--ai-claude)' },
    { id: 'gpt', name: 'GPT-4', emoji: '🧠', color: 'var(--ai-gpt)' },
    { id: 'gemini', name: 'Gemini', emoji: '✨', color: 'var(--ai-gemini)' },
    { id: 'ollama', name: 'Ollama', emoji: '🦙', color: 'var(--ai-ollama)' },
    { id: 'mock', name: 'Mock', emoji: '🎭', color: 'var(--ai-mock)' }
]

// === STATE ===
let state = {
    currentAI: 0,  // Index dans AIS
    currentRoom: null,
    messages: [],
    isLoading: false
}

// === DOM ELEMENTS ===
const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

const els = {
    aiIndicator: $('#ai-indicator'),
    aiAvatar: $('.ai-avatar'),
    aiName: $('.ai-name'),
    aiStatus: $('.ai-status'),
    messagesContainer: $('#messages-container'),
    chatForm: $('#chat-form'),
    messageInput: $('#message-input'),
    loading: $('#loading'),
    toast: $('#toast'),
    themeBtns: $$('.theme-selector button')
}

// === UTILS ===
const showToast = (message, type = 'info') => {
    els.toast.textContent = message
    els.toast.className = `toast ${type}`
    setTimeout(() => els.toast.classList.add('hidden'), 4000)
}

const setLoading = (loading) => {
    state.isLoading = loading
    els.loading.classList.toggle('hidden', !loading)
    els.messageInput.disabled = loading
}

const scrollToBottom = () => {
    els.messagesContainer.scrollTop = els.messagesContainer.scrollHeight
}

// === API ===
const api = {
    async get(endpoint) {
        const res = await fetch(`${API_URL}${endpoint}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
    },

    async post(endpoint, data) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(error.detail || `HTTP ${res.status}`)
        }
        return res.json()
    },

    async ensureRoom() {
        const rooms = await this.get('/rooms')
        if (rooms.length > 0) return rooms[0].id
        
        const room = await this.post('/rooms', {
            title: 'Chika Zen Session',
            active_ais: [AIS[state.currentAI].id]
        })
        return room.id
    },

    async sendMessage(roomId, content) {
        return this.post('/chat', {
            room_id: roomId,
            content,
            preferred_provider: AIS[state.currentAI].id
        })
    }
}

// === UI ===
const ui = {
    updateAI() {
        const ai = AIS[state.currentAI]
        els.aiAvatar.textContent = ai.emoji
        els.aiName.textContent = ai.name
        els.aiName.style.color = ai.color
    },

    setStatus(status) {
        els.aiStatus.textContent = status
    },

    renderMessage(sender, content) {
        // Remove empty state
        const emptyState = $('.empty-state')
        if (emptyState) emptyState.remove()

        const msg = document.createElement('div')
        msg.className = `message ${sender}`
        
        const label = document.createElement('div')
        label.className = 'message-label'
        label.textContent = sender === 'user' ? 'Toi' : AIS.find(ai => ai.id === sender)?.name || sender.toUpperCase()
        
        const content_div = document.createElement('div')
        content_div.className = 'message-content'
        content_div.textContent = content
        
        msg.appendChild(label)
        msg.appendChild(content_div)
        els.messagesContainer.appendChild(msg)
        scrollToBottom()
    },

    setTheme(theme) {
        document.documentElement.dataset.theme = theme
        els.themeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme)
        })
        localStorage.setItem('chika-zen-theme', theme)
    }
}

// === SWIPE LOGIC ===
let touchStartX = 0
let touchEndX = 0

const handleSwipe = () => {
    const threshold = 50
    const diff = touchEndX - touchStartX
    
    if (Math.abs(diff) < threshold) return
    
    const direction = diff > 0 ? -1 : 1
    state.currentAI = (state.currentAI + direction + AIS.length) % AIS.length
    
    ui.updateAI()
    
    // Visual feedback
    els.aiIndicator.classList.add(diff > 0 ? 'swipe-right' : 'swipe-left')
    setTimeout(() => {
        els.aiIndicator.classList.remove('swipe-left', 'swipe-right')
    }, 300)
}

// Touch events
els.aiIndicator.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX
})

els.aiIndicator.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX
    handleSwipe()
})

// Mouse events (desktop)
els.aiIndicator.addEventListener('mousedown', (e) => {
    touchStartX = e.screenX
    
    const handleMouseMove = (e) => { touchEndX = e.screenX }
    const handleMouseUp = () => {
        handleSwipe()
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
})

// === CHAT ===
els.chatForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const content = els.messageInput.value.trim()
    if (!content || state.isLoading) return
    
    try {
        setLoading(true)
        ui.setStatus('En train de réfléchir...')
        
        // Ensure room
        if (!state.currentRoom) {
            state.currentRoom = await api.ensureRoom()
        }
        
        // Add user message
        ui.renderMessage('user', content)
        els.messageInput.value = ''
        
        // Send to API
        const response = await api.sendMessage(state.currentRoom, content)
        
        // Render AI response
        if (response.ai_responses) {
            const aiId = AIS[state.currentAI].id
            const aiResponse = response.ai_responses[aiId] || response.ai_responses[Object.keys(response.ai_responses)[0]]
            ui.renderMessage(aiId, aiResponse)
        }
        
        ui.setStatus('Prêt')
        
    } catch (err) {
        console.error('Chat error:', err)
        showToast(err.message || 'Erreur lors de l\'envoi', 'error')
        ui.setStatus('Erreur')
    } finally {
        setLoading(false)
        els.messageInput.focus()
    }
})

// === THEME SWITCHING ===
els.themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        ui.setTheme(btn.dataset.theme)
    })
})

// === INIT ===
async function init() {
    console.log('🎯 Chika Zen initialized')
    
    // Load saved theme
    const savedTheme = localStorage.getItem('chika-zen-theme')
    if (savedTheme) {
        ui.setTheme(savedTheme)
    }
    
    // Initialize UI
    ui.updateAI()
    ui.setStatus('Prêt')
    
    // Focus input
    els.messageInput.focus()
}

init()
