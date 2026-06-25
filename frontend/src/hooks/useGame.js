//¿Qué es un hook en React?
//Es una función que empieza por use y gestiona lógica con estado. En vez de mezclar lógica y presentación en el mismo componente, 
// los hooks te permiten separar el "qué hace" del "cómo se ve". useGame sabrá todo sobre la partida; los componentes visuales solo mostrarán lo que él les diga.

//Dos conceptos clave que vas a ver:
//useState — guarda un valor y cuando cambia, React redibuja el componente automáticamente
//useEffect — ejecuta código cuando el componente aparece en pantalla (o cuando algo cambia). Lo usamos para cargar la sesión del día al arrancar.


import { useState, useEffect } from 'react'
import { getAnonymousId } from '../utils/anonymousId'
import { getToday, submitGuess as submitGuessApi } from '../services/api'
import { updateLocalStats } from '../utils/localStats'
import { useAuth } from '../context/AuthContext'

export function useGame() {
  const [guesses, setGuesses] = useState([])
  const [completed, setCompleted] = useState(false)
  const [won, setWon] = useState(false)
  const [targetCharacter, setTargetCharacter] = useState(null)
  const [alreadyRecruited, setAlreadyRecruited] = useState(false)
  const [infiniteTokenAvailable, setInfiniteTokenAvailable] = useState(false)
  const [xpReport, setXpReport] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const anonymousId = getAnonymousId()
  const { token } = useAuth()

  useEffect(() => {
    getToday(anonymousId, token)
      .then(session => {
        setGuesses(session.guesses.map(g => ({ ...g, characterData: g.character_data })))
        setCompleted(session.completed)
        setWon(session.won)
        setTargetCharacter(session.target_character)
        setAlreadyRecruited(session.already_recruited ?? false)
        setInfiniteTokenAvailable(session.infinite_token_available ?? false)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function submitGuess(characterId, characterData) {
    setError(null)
    try {
      const result = await submitGuessApi(characterId, anonymousId, token)
      setGuesses(prev => [...prev, { ...result, characterData }])
      setCompleted(result.session_completed)
      setWon(result.session_won)
      if (result.target_character) setTargetCharacter(result.target_character)
      if (result.xp_report?.length) setXpReport(result.xp_report)
      if (result.session_completed) updateLocalStats(result.session_won, result.attempt_number)
      return result
    } catch (err) {
      setError(err.message)
    }
  }

  return { guesses, completed, won, targetCharacter, alreadyRecruited, setAlreadyRecruited, infiniteTokenAvailable, xpReport, loading, error, submitGuess }
}