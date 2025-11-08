import { useState } from 'react'
import axios from 'axios'

const API_URL = '/api'

function OAuthLogin({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [authData, setAuthData] = useState(null)
  const [manualCode, setManualCode] = useState('')

  const handleAnthropicLogin = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get authorization URL
      const { data } = await axios.get(`${API_URL}/oauth/authorize/anthropic`)
      console.log('🔑 OAuth data received:', data)
      setAuthData(data)
      
      // Open OAuth page in new window
      const width = 600
      const height = 700
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2
      
      window.open(
        data.authorization_url,
        'anthropic_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      )
      
      console.log('✅ Popup opened, showing code input')
      setLoading(false) // IMPORTANT: Stop loading to show input!
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start OAuth flow')
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    if (!manualCode.trim() || !authData) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Exchange code for token
      const { data } = await axios.post(
        `${API_URL}/oauth/exchange-code/anthropic`,
        {
          code: manualCode.trim(),
          state: authData.state
        }
      )
      
      if (data.success) {
        setManualCode('')
        setAuthData(null)
        onSuccess?.('Successfully authenticated with Claude!')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to exchange code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] animate-pulse" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-block">
              <div className="text-8xl mb-2 animate-bounce-slow">🎯</div>
              <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />
            </div>
            <h1 className="text-5xl font-black tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                Chika
              </span>
            </h1>
            <p className="text-gray-400 text-lg font-medium">
              Utilise dix IA sans chichi
            </p>
          </div>

          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 p-4 m-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-red-400 font-semibold text-sm">Error</p>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Login Button */}
              {!authData && (
                <div className="space-y-6">
                  <button
                    onClick={handleAnthropicLogin}
                    disabled={loading}
                    className="group relative w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/50"
                  >
                    <div className="flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-lg">Connexion...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl group-hover:scale-110 transition-transform">🤖</span>
                          <span className="text-lg">Se connecter avec Claude</span>
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors" />
                  </button>

                  {/* Info text */}
                  <p className="text-gray-500 text-sm text-center">
                    Utilise ton compte Claude Pro ou Max
                  </p>
                </div>
              )}

              {/* Manual Code Input (appears after clicking login) */}
              {authData && (
                <div className="space-y-6 animate-fade-in">
                  {/* Instructions */}
                  <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-2 text-purple-300">
                      <span className="text-2xl">✨</span>
                      <p className="font-bold text-lg">Fenêtre OAuth ouverte!</p>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p className="leading-relaxed">
                        <span className="font-semibold text-white">1.</span> Autorise l'application dans la fenêtre popup
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-semibold text-white">2.</span> Tu seras redirigé vers une page avec un code
                      </p>
                      <p className="leading-relaxed">
                        <span className="font-semibold text-white">3.</span> Copie l'URL complète ou juste le code
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-purple-300 border border-purple-500/20">
                      Format: <span className="text-blue-300">code#state</span>
                    </div>
                  </div>

                  {/* Code Input Form */}
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-gray-300 text-sm font-bold">
                        Code d'autorisation
                      </label>
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Colle ton code ici (abc123#xyz789)"
                        autoFocus
                        className="w-full bg-black/40 border border-white/20 focus:border-purple-500 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-sm transition-all"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading || !manualCode.trim()}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-green-500/50"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Vérification...</span>
                          </div>
                        ) : (
                          '✓ Valider'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthData(null)
                          setManualCode('')
                          setError(null)
                        }}
                        className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl transition-all font-semibold"
                        disabled={loading}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-500 text-xs">
              🔒 Tes identifiants sont stockés localement et ne sont jamais partagés
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-600 text-xs">
              <span>Propulsé par</span>
              <span className="font-bold text-purple-400">Claude</span>
              <span>•</span>
              <span className="font-bold text-green-400">GPT</span>
              <span>•</span>
              <span className="font-bold text-blue-400">Gemini</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default OAuthLogin
