import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLocalStats } from '../utils/localStats'
import { getStats } from '../services/api'

export function useStats(completed) {
  const { user, token } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!completed) return

    if (user && token) {
      getStats(token)
        .then(setStats)
        .catch(() => setStats(getLocalStats()))
    } else {
      setStats(getLocalStats())
    }
  }, [completed, user, token])

  return stats
}
