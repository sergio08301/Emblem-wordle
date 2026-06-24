import { useState } from 'react'
import { startInfinite, submitInfiniteGuess } from '../services/api'

export function useInfiniteGame() {
  const [guesses, setGuesses] = useState([])
  const [won, setWon] = useState(false)
  const [lost, setLost] = useState(false)
  const [sessionToken, setSessionToken] = useState(null)
  const [targetCharacter, setTargetCharacter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      const result = await submitInfiniteGuess(sessionToken, characterId, attemptNumber)
      setGuesses(prev => [...prev, { ...result, characterData }])
      if (result.won) {
        setWon(true)
        setTargetCharacter(result.target_character)
      } else if (result.lost) {
        setLost(true)
        setTargetCharacter(result.target_character)
      }
      return result
    } catch (err) {
      setError(err.message)
    }
  }

  return { guesses, won, lost, sessionToken, targetCharacter, loading, error, startGame, submitGuess }
}
