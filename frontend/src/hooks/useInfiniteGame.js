import { useState } from 'react'
import { startInfinite, submitInfiniteGuess, recruitInfinite } from '../services/api'
import { useAuth } from '../context/AuthContext'

export function useInfiniteGame() {
  const [guesses, setGuesses] = useState([])
  const [won, setWon] = useState(false)
  const [lost, setLost] = useState(false)
  const [sessionToken, setSessionToken] = useState(null)
  const [targetCharacter, setTargetCharacter] = useState(null)
  const [infiniteTokenAvailable, setInfiniteTokenAvailable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { token } = useAuth()

  async function startGame() {
    setLoading(true)
    setError(null)
    try {
      const { session_token } = await startInfinite()
      setSessionToken(session_token)
      setGuesses([])
      setWon(false)
      setLost(false)
      setTargetCharacter(null)
      setInfiniteTokenAvailable(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitGuess(characterId, characterData) {
    setError(null)
    try {
      const attemptNumber = guesses.filter(g => !g.won).length + 1
      const result = await submitInfiniteGuess(sessionToken, characterId, attemptNumber, token)
      setGuesses(prev => [...prev, { ...result, characterData }])
      if (result.won) {
        setWon(true)
        setTargetCharacter(result.target_character)
        setInfiniteTokenAvailable(result.infinite_token_available ?? false)
      } else if (result.lost) {
        setLost(true)
        setTargetCharacter(result.target_character)
      }
      return result
    } catch (err) {
      setError(err.message)
    }
  }

  async function recruitCurrent() {
    if (!targetCharacter || !token) return null
    try {
      const result = await recruitInfinite(token, targetCharacter.id)
      setInfiniteTokenAvailable(false)
      return result
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  return { guesses, won, lost, sessionToken, targetCharacter, infiniteTokenAvailable, loading, error, startGame, submitGuess, recruitCurrent }
}
