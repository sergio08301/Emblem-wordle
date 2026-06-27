import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isMuted, setMuted } from '../utils/sounds'
import { getBarracks } from '../services/api'
import { getLordId } from '../utils/lordStorage'
import Logo from './Logo'
import FeedbackModal from './FeedbackModal'

export default function Navbar({ onHelpOpen }) {
  const { user, token, logout } = useAuth()
  const [muted, setMutedState] = useState(() => isMuted())
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    if (!user || !token) { setAvatarUrl(null); return }
    getBarracks(token)
      .then(data => {
        const lordId = getLordId(user.id)
        const dep = data.deployment
        const lord = lordId ? dep.find(c => c.character_id === lordId) : null
        const portrait = (lord ?? dep[0])?.character_portrait_url ?? null
        setAvatarUrl(portrait)
      })
      .catch(() => setAvatarUrl(null))
  }, [user, token])

  function toggleMute() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
  }

  return (
    <>
    <nav className="w-full bg-gray-800 px-4 sm:px-6 py-5 sm:py-6 flex items-center relative">
      <Link to="/" style={{ textDecoration: 'none' }} className="sm:absolute sm:left-1/2 sm:-translate-x-1/2">
        <Logo />
      </Link>

      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={toggleMute}
          className="text-gray-400 hover:text-white w-7 h-7 rounded-full border border-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L19.5 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L19.5 10.94l-1.72-1.72Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
            </svg>
          )}
        </button>
        <button
          onClick={() => setShowFeedback(true)}
          className="text-gray-400 hover:text-white w-7 h-7 rounded-full border border-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors"
          title="Send feedback"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
          </svg>
        </button>
        <button
          onClick={onHelpOpen}
          className="text-gray-400 hover:text-white text-lg font-bold w-7 h-7 rounded-full border border-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors"
          title="How to play"
        >?</button>
        {user ? (
          <>
            <Link to="/barracks" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
              <span className="hidden sm:inline text-sm">Barracks</span>
              <span className="sm:hidden text-base">⚔️</span>
            </Link>
            <span className="text-gray-300 text-sm flex items-center gap-2">
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width: 24, height: 24, borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                : <span>👤</span>
              }
              <span className="hidden sm:inline truncate max-w-24">{user.username}</span>
            </span>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="hidden sm:inline text-sm">Logout</span>
              <span className="sm:hidden text-base">↩</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
              <span className="hidden sm:inline">Sign in</span>
              <span className="sm:hidden">Login</span>
            </Link>
            <Link
              to="/register"
              className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition-colors"
            >
              <span className="hidden sm:inline">Register</span>
              <span className="sm:hidden">Join</span>
            </Link>
          </>
        )}
      </div>
    </nav>
    {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  )
}
