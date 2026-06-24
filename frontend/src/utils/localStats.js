const KEY = 'emblem_wordle_stats'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function getLocalStats() {
  const raw = localStorage.getItem(KEY)
  if (!raw) return { games_played: 0, games_won: 0, current_streak: 0, max_streak: 0, avg_attempts: 0 }
  return JSON.parse(raw)
}

export function updateLocalStats(won, attempts) {
  const stats = getLocalStats()
  const todayStr = today()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  stats.games_played += 1

  if (won) {
    stats.games_won += 1
    if (stats.last_played_date === yesterday) {
      stats.current_streak += 1
    } else if (stats.last_played_date !== todayStr) {
      stats.current_streak = 1
    }
    stats.max_streak = Math.max(stats.max_streak, stats.current_streak)
    const totalAttempts = stats.avg_attempts * (stats.games_won - 1) + attempts
    stats.avg_attempts = Math.round((totalAttempts / stats.games_won) * 100) / 100
  } else {
    stats.current_streak = 0
  }

  stats.last_played_date = todayStr
  localStorage.setItem(KEY, JSON.stringify(stats))
}
