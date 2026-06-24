import { createContext, useContext, useEffect, useState } from 'react'
import { getMe } from '../services/auth'

const AuthContext = createContext(null)

const TOKEN_KEY = 'emblem_wordle_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    getMe(token)
      .then(setUser)
      .catch(() => { setToken(null); localStorage.removeItem(TOKEN_KEY) })
      .finally(() => setLoading(false))
  }, [])

  function saveLogin(newToken, userData) {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, saveLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
