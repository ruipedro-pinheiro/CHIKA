import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import DOMPurify from 'isomorphic-dompurify'
import OAuthLogin from './components/OAuthLogin'

const API_URL = '/api'

// AI avatars & colors
const AI_CONFIG = {
  claude: { 
    name: 'Claude', 
    color: 'bg-purple-600', 
    avatar: '🤖',
    textColor: 'text-purple-400'
  },
  gpt: { 
    name: 'GPT-4', 
    color: 'bg-green-600', 
    avatar: '🧠',
    textColor: 'text-green-400'
  },
  gemini: { 
    name: 'Gemini', 
    color: 'bg-blue-600', 
    avatar: '✨',
    textColor: 'text-blue-400'
  },
  grok: {
    name: 'Grok',
    color: 'bg-red-600',
    avatar: '⚡',
    textColor: 'text-red-400'
  },
  ollama: {
    name: 'Ollama',
    color: 'bg-yellow-600',
    avatar: '🦙',
    textColor: 'text-yellow-400'
  },
  user: {
    name: 'You',
    color: 'bg-gray-600',
    avatar: '👤',
    textColor: 'text-gray-300'
  }
}

// SECURITY: Sanitize user input
const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

// Loading Spinner Component
function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className={`${sizes[size]} border-2 border-discord-blurple border-t-transparent rounded-full animate-spin`} />
  )
}

// Error Alert Component
function ErrorAlert({ message, onClose }) {
  if (!message) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md animate-slide-in">
      <span className="text-2xl">⚠️</span>
      <div className="flex-1">
        <p className="font-semibold">Error</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 text-xl"
      >
        ×
      </button>
    </div>
  )
}

// Success Alert Component
function SuccessAlert({ message, onClose }) {
  if (!message) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md animate-slide-in">
      <span className="text-2xl">✅</span>
      <div className="flex-1">
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 text-xl"
      >
        ×
      </button>
    </div>
  )
}

// Typing Indicator Component
function TypingIndicator({ ais }) {
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="w-10 h-10 rounded-full bg-discord-blurple flex items-center justify-center animate-pulse">
        💭
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">
          {ais.join(', ')} {ais.length > 1 ? 'are' : 'is'} thinking
        </span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// Message Component
function Message({ message, onShowDiscussion }) {
  const config = AI_CONFIG[message.author] || AI_CONFIG.user
  const isUser = message.author === 'user'
  
  return (
    <div className={`flex gap-3 px-4 py-3 hover:bg-discord-darker transition ${isUser ? 'bg-discord-darker/30' : ''}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-xl flex-shrink-0`}>
        {config.avatar}
      </div>
      
      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-semibold ${config.textColor}`}>
            {config.name}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {message.discussion_id && (
            <button
              onClick={() => onShowDiscussion(message.discussion_id)}
              className="text-xs text-discord-blurple hover:underline flex items-center gap-1"
            >
              💬 Private discussion
            </button>
          )}
        </div>
        
        {/* Content with @mentions highlighted */}
        <div className="text-gray-200 break-words prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            skipHtml={true}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg my-2"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-discord-darkest px-1.5 py-0.5 rounded text-sm text-red-400" {...props}>
                    {children}
                  </code>
                )
              },
              a({node, children, ...props}) {
                return (
                  <a 
                    className="text-discord-blurple hover:underline" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                )
              },
              p({node, children, ...props}) {
                // Highlight @mentions
                const text = String(children)
                if (text.includes('@')) {
                  const parts = text.split(/(@\w+)/)
                  return (
                    <p className="my-2" {...props}>
                      {parts.map((part, i) => 
                        part.startsWith('@') ? (
                          <span key={i} className="bg-discord-blurple/20 text-discord-blurple px-1 py-0.5 rounded font-medium">
                            {part}
                          </span>
                        ) : part
                      )}
                    </p>
                  )
                }
                return <p className="my-2" {...props}>{children}</p>
              },
              ul({node, children, ...props}) {
                return <ul className="list-disc list-inside my-2 space-y-1" {...props}>{children}</ul>
              },
              ol({node, children, ...props}) {
                return <ol className="list-decimal list-inside my-2 space-y-1" {...props}>{children}</ol>
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

// AI Discussion Thread (collapsible)
function DiscussionThread({ discussion }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (!discussion) return null
  
  const statusColors = {
    ongoing: 'bg-yellow-600',
    resolved: 'bg-green-600',
    timeout: 'bg-gray-600'
  }
  
  return (
    <div className="border-l-4 border-discord-blurple bg-discord-darker/50 mx-4 my-2 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-discord-dark transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isExpanded ? '💬' : '💭'}</span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 font-medium">
                Private discussion: {discussion.participants.join(' & ')}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${statusColors[discussion.status] || 'bg-gray-600'}`}>
                {discussion.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{discussion.topic}</p>
          </div>
        </div>
        <span className="text-gray-500 text-lg">{isExpanded ? '▼' : '▶'}</span>
      </button>
      
      {/* Discussion Messages */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-3 bg-discord-darkest/30">
          {discussion.messages.map((msg, i) => {
            const config = AI_CONFIG[msg.ai] || AI_CONFIG.user
            return (
              <div key={i} className="flex gap-2">
                <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-sm flex-shrink-0`}>
                  {config.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-sm font-medium ${config.textColor}`}>
                      {config.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.content}</p>
                </div>
              </div>
            )
          })}
          
          {discussion.consensus && (
            <div className="mt-3 pt-3 border-t border-discord-dark">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-xl">✅</span>
                <p className="text-sm text-green-400 font-semibold">Consensus Reached</p>
              </div>
              <p className="text-sm text-gray-200 bg-discord-dark px-3 py-2 rounded">
                {discussion.consensus}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Room Settings Modal
function RoomSettingsModal({ room, onClose, onUpdate }) {
  const [selectedAIs, setSelectedAIs] = useState(room?.active_ais || [])
  
  if (!room) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-discord-darker rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Room Settings</h2>
        
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Active AIs</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(AI_CONFIG).filter(ai => ai !== 'user').map(ai => (
              <button
                key={ai}
                onClick={() => {
                  setSelectedAIs(prev =>
                    prev.includes(ai)
                      ? prev.filter(a => a !== ai)
                      : [...prev, ai]
                  )
                }}
                className={`px-3 py-2 rounded transition ${
                  selectedAIs.includes(ai)
                    ? AI_CONFIG[ai].color + ' text-white'
                    : 'bg-discord-darkest text-gray-400 hover:text-white'
                }`}
              >
                {AI_CONFIG[ai].avatar} {AI_CONFIG[ai].name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-discord-darkest text-gray-300 rounded hover:bg-discord-dark transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdate(selectedAIs)
              onClose()
            }}
            className="px-4 py-2 bg-discord-blurple text-white rounded hover:bg-discord-blurple/80 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// Main App
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [discussions, setDiscussions] = useState({})
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedAIs, setSelectedAIs] = useState(['mock']) // Will be updated with available AIs
  const [availableAIs, setAvailableAIs] = useState(['mock'])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const ws = useRef(null)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_URL}/oauth/status`)
        const hasAuth = res.data.authenticated_providers?.length > 0
        console.log('🔐 Auth check:', { hasAuth, providers: res.data.authenticated_providers })
        setIsAuthenticated(hasAuth)
      } catch (err) {
        console.log('❌ No auth tokens found, showing login')
        setIsAuthenticated(false)
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-dismiss alerts
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Load available AIs on mount
  useEffect(() => {
    const loadAvailableAIs = async () => {
      try {
        const res = await axios.get(`${API_URL}/`)
        const ais = res.data.available_ais || ['mock']
        setAvailableAIs(ais)
        // Set default selected AIs to available ones
        if (ais.length > 0) {
          setSelectedAIs(ais)
        }
      } catch (error) {
        console.error('Failed to load available AIs:', error)
        setAvailableAIs(['mock'])
        setSelectedAIs(['mock'])
      }
    }
    loadAvailableAIs()
  }, [])

  // Load rooms on mount
  useEffect(() => {
    loadRooms()
  }, [])

  // WebSocket connection
  useEffect(() => {
    if (currentRoom) {
      connectWebSocket(currentRoom.room_id)
      loadMessages(currentRoom.room_id)
      loadDiscussions(currentRoom.room_id)
    }
    
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [currentRoom])

  const connectWebSocket = (roomId) => {
    if (ws.current) ws.current.close()
    
    setWsConnected(false)
    const wsUrl = `ws://${window.location.host}/ws/${roomId}`
    ws.current = new WebSocket(wsUrl)
    
    ws.current.onopen = () => {
      setWsConnected(true)
      console.log('WebSocket connected')
    }
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'new_messages') {
        // Add both user and AI messages (no optimistic update anymore)
        setMessages(prev => [...prev, data.data.user_message, data.data.ai_message])
        
        if (data.data.discussion) {
          setDiscussions(prev => ({
            ...prev,
            [data.data.discussion.id]: data.data.discussion
          }))
        }
        setIsTyping(false)
      }
    }
    
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setWsConnected(false)
      setError('WebSocket connection failed. Real-time updates disabled.')
    }
    
    ws.current.onclose = () => {
      setWsConnected(false)
      console.log('WebSocket disconnected')
    }
  }

  const loadRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/rooms`)
      setRooms(res.data)
      
      // AUTO-CREATE DEFAULT ROOM IF NONE EXISTS
      if (res.data.length === 0) {
        console.log('No rooms found, creating default room...')
        await createRoom()
        return // createRoom() will reload rooms
      }
      
      if (res.data.length > 0 && !currentRoom) {
        setCurrentRoom(res.data[0])
      }
    } catch (error) {
      console.error('Failed to load rooms:', error)
      setError('Failed to load rooms')
    }
  }

  const loadMessages = async (roomId) => {
    try {
      const res = await axios.get(`${API_URL}/rooms/${roomId}/messages`)
      setMessages(res.data)
    } catch (error) {
      console.error('Failed to load messages:', error)
      setError('Failed to load messages')
    }
  }

  const loadDiscussions = async (roomId) => {
    try {
      const res = await axios.get(`${API_URL}/rooms/${roomId}/discussions`)
      const discussionsMap = {}
      res.data.forEach(d => {
        discussionsMap[d.id] = d
      })
      setDiscussions(discussionsMap)
    } catch (error) {
      console.error('Failed to load discussions:', error)
    }
  }

  const createRoom = async () => {
    try {
      setIsLoading(true)
      const res = await axios.post(`${API_URL}/rooms`, {
        title: `Room ${rooms.length + 1}`,
        active_ais: selectedAIs
      })
      await loadRooms()
      setCurrentRoom(res.data)
      setSuccess('Room created successfully!')
    } catch (error) {
      console.error('Failed to create room:', error)
      setError(error.response?.data?.detail || 'Failed to create room')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !currentRoom || isLoading) return

    const sanitizedInput = sanitizeInput(input)
    setInput('')
    setIsTyping(true)
    setIsLoading(true)

    // NO optimistic update - wait for WebSocket response
    // This prevents duplicate messages

    try {
      await axios.post(`${API_URL}/chat`, {
        room_id: currentRoom.room_id,
        content: sanitizedInput
      })
      // Response will come via WebSocket
    } catch (error) {
      console.error('Failed to send message:', error)
      setError(error.response?.data?.detail || 'Failed to send message')
      setIsTyping(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-discord-darkest">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show OAuth login if not authenticated
  if (!isAuthenticated) {
    console.log('🚪 Showing login screen (not authenticated)')
    return (
      <OAuthLogin 
        onSuccess={(msg) => {
          setSuccess(msg)
          setIsAuthenticated(true)
        }}
      />
    )
  }

  // Main app (authenticated)
  return (
    <div className="h-screen flex bg-discord-darkest text-white">
      {/* Alerts */}
      <ErrorAlert message={error} onClose={() => setError(null)} />
      <SuccessAlert message={success} onClose={() => setSuccess(null)} />
      
      {/* Room Settings Modal */}
      {showSettings && (
        <RoomSettingsModal
          room={currentRoom}
          onClose={() => setShowSettings(false)}
          onUpdate={(ais) => {
            setSelectedAIs(ais)
            setSuccess('Room settings updated!')
          }}
        />
      )}

      {/* Sidebar */}
      <div className="w-60 bg-discord-darker flex flex-col">
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-discord-darkest">
          <h1 className="font-bold text-white flex items-center gap-2">
            🎯 <span>Chika</span>
          </h1>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                 title={wsConnected ? 'Connected' : 'Disconnected'} />
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-400 font-semibold">
            <span>ROOMS</span>
            <button
              onClick={createRoom}
              disabled={isLoading}
              className="hover:text-white disabled:opacity-50"
              title="Create new room"
            >
              {isLoading ? '⏳' : '+'}
            </button>
          </div>
          {rooms.map(room => (
            <button
              key={room.room_id}
              onClick={() => setCurrentRoom(room)}
              className={`w-full px-2 py-1.5 rounded text-left text-sm transition flex items-center justify-between ${
                currentRoom?.room_id === room.room_id
                  ? 'bg-discord-dark text-white'
                  : 'text-gray-400 hover:bg-discord-dark/50 hover:text-gray-200'
              }`}
            >
              <span className="truncate"># {room.title}</span>
              {currentRoom?.room_id === room.room_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowSettings(true)
                  }}
                  className="text-xs hover:text-discord-blurple"
                  title="Settings"
                >
                  ⚙️
                </button>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-discord-darkest">
          <p className="text-xs text-gray-500 text-center">
            Utiliser dix IA sans chichi
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-discord-dark">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">#</span>
            <span className="font-semibold">{currentRoom?.title || 'Select a room'}</span>
            {currentRoom && (
              <span className="text-xs text-gray-500">
                with {currentRoom.active_ais?.map(ai => AI_CONFIG[ai]?.avatar || ai).join(' ')}
              </span>
            )}
          </div>
          {currentRoom && (
            <button
              onClick={() => {
                loadMessages(currentRoom.room_id)
                loadDiscussions(currentRoom.room_id)
                setSuccess('Messages refreshed')
              }}
              className="text-gray-400 hover:text-white text-sm"
              title="Refresh"
            >
              🔄
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-4xl mb-4">👋</p>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm mt-2">Start a conversation with your AIs!</p>
                <p className="text-xs mt-4 text-gray-600">
                  Tip: Use @mentions to tag specific AIs
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i}>
                  <Message
                    message={msg}
                    onShowDiscussion={(id) => {}}
                  />
                  {msg.discussion_id && discussions[msg.discussion_id] && (
                    <DiscussionThread
                      discussion={discussions[msg.discussion_id]}
                    />
                  )}
                </div>
              ))}
              {isTyping && <TypingIndicator ais={currentRoom?.active_ais || []} />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-discord-dark">
          <form onSubmit={sendMessage}>
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!currentRoom || isLoading}
                placeholder={currentRoom ? 'Message (use @claude, @gpt, etc.)' : 'Select a room first'}
                className="w-full bg-discord-dark text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-discord-blurple disabled:opacity-50 transition"
              />
              {isLoading && (
                <div className="absolute right-4 top-3">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          </form>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
            <span>💡</span>
            <span>Use @mentions to target specific AIs. They'll collaborate automatically!</span>
          </p>
        </div>
      </div>
      
      {/* Add custom animations */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default App
