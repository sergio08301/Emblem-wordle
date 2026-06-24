import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isMuted, setMuted } from '../utils/sounds'

export default function Navbar({ onHelpOpen }) {
  const { user, logout } = useAuth()
  const [muted, setMutedState] = useState(() => isMuted())

  function toggleMute() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
  }

  return (
    <nav className="w-full bg-gray-800 px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
      <Link to="/" className="text-white font-bold text-lg">
        Emblem Wordle
      </Link>

      <div className="flex items-center gap-4">
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
          onClick={onHelpOpen}
          className="text-gray-400 hover:text-white text-lg font-bold w-7 h-7 rounded-full border border-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors"
          title="How to play"
        >?</button>
        {user ? (
          <>
            <span className="text-gray-300 text-sm truncate max-w-30">👤 {user.username}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
