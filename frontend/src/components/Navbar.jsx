import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isMuted, setMuted } from '../utils/sounds'
import { getBarracks } from '../services/api'
import { getLordId } from '../utils/lordStorage'
import Logo from './Logo'
import FeedbackModal from './FeedbackModal'

export default function Navbar({ onHelpOpen }) {
  const { user, token, logout } = useAuth()
  const { pathname } = useLocation()
  const [muted, setMutedState] = useState(() => isMuted())
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  function toggleMute() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
  }

  function closeDropdown() { setShowDropdown(false) }

  return (
    <>
    <nav className="w-full bg-gray-800 px-4 sm:px-6 py-5 sm:py-6 flex items-center relative">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>

      {/* Mode buttons — next to logo, desktop only */}
      <div className="hidden sm:flex items-center gap-2 ml-6">
        <Link
          to="/"
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            pathname === '/'
              ? 'bg-blue-600 text-white border border-blue-500'
              : 'text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500'
          }`}
        >
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: 13 }}>Today's</div>
            <div style={{ fontSize: 15 }}>Character</div>
          </div>
          <img src="/marth.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' }} />
        </Link>
        <Link
          to="/infinite"
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            pathname === '/infinite'
              ? 'bg-blue-600 text-white border border-blue-500'
              : 'text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500'
          }`}
        >
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: 13 }}>Infinite</div>
            <div style={{ fontSize: 15 }}>Mode</div>
          </div>
          <span style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>∞</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Mute — always visible */}
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

        {/* Feedback — desktop only */}
        <button
          onClick={() => setShowFeedback(true)}
          className="hidden sm:flex text-gray-400 hover:text-white w-7 h-7 rounded-full border border-gray-600 hover:border-gray-400 items-center justify-center transition-colors"
          title="Send feedback"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
          </svg>
        </button>

        {/* Help — always visible */}
        <button
          onClick={onHelpOpen}
          className="text-gray-400 hover:text-white text-lg font-bold w-7 h-7 rounded-full border border-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors"
          title="How to play"
        >?</button>

        {user ? (
          <>
            {/* Desktop: barracks + username + logout */}
            <Link to="/barracks" className="hidden sm:inline text-gray-300 hover:text-yellow-400 transition-colors font-medium text-sm">
              Barracks
            </Link>
            <span className="hidden sm:flex text-gray-300 text-sm items-center gap-2">
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width: 24, height: 24, borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                : <span>👤</span>
              }
              <span className="truncate max-w-24">{user.username}</span>
            </span>
            <button onClick={logout} className="hidden sm:inline text-gray-400 hover:text-white transition-colors text-sm">
              Logout
            </button>

            {/* Mobile: avatar button → dropdown */}
            <div className="sm:hidden relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(v => !v)}
                className="flex items-center gap-2 text-gray-300"
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{ width: 28, height: 28, borderRadius: '4px', objectFit: 'cover' }} />
                  : <span>👤</span>
                }
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-700 text-xs text-gray-400 truncate">{user.username}</div>
                  <Link to="/" onClick={closeDropdown} className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${pathname === '/' ? 'text-blue-400' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>
                    <span>🗓️</span> Today's Character
                  </Link>
                  <Link to="/infinite" onClick={closeDropdown} className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${pathname === '/infinite' ? 'text-blue-400' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>
                    <span>∞</span> Infinite Mode
                  </Link>
                  <Link to="/barracks" onClick={closeDropdown} className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${pathname === '/barracks' ? 'text-blue-400' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>
                    <span>⚔️</span> Barracks
                  </Link>
                  <button onClick={() => { closeDropdown(); setShowFeedback(true) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                    <span>✉️</span> Feedback
                  </button>
                  <div className="border-t border-gray-700 mt-1">
                    <button onClick={() => { closeDropdown(); logout() }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors">
                      <span>↩</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition-colors text-white">
              Join
            </Link>
          </>
        )}
      </div>
    </nav>
    {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  )
}
