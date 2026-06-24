import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import { useStats } from '../hooks/useStats'
import SearchInput from '../components/SearchInput'
import GameBoard from '../components/GameBoard'
import ResultModal from '../components/ResultModal'
import HPBar from '../components/HPBar'
import { playHitSound, playLevelUpSound, playDeathSound } from '../utils/sounds'

export default function Home() {
  const { guesses, completed, won, loading, error, targetCharacter, submitGuess } = useGame()
  const stats = useStats(completed)
  const [dismissed, setDismissed] = useState(false)
  const [modalDelayed, setModalDelayed] = useState(false)
  const showModal = completed && !!targetCharacter && !dismissed && !modalDelayed

  async function handleSelect(character) {
    const result = await submitGuess(character.id, character)
    if (!result) return

    if (result.session_completed) {
      if (result.session_won) {
        setModalDelayed(true)
        setTimeout(() => { setModalDelayed(false); playLevelUpSound() }, 500)
      } else {
        playHitSound()
        setModalDelayed(true)
        setTimeout(() => { setModalDelayed(false); playDeathSound() }, 900)
      }
    } else {
      playHitSound()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-1">Today's Character</h1>
      <p className="text-gray-300 mb-6">Guess today's Fire Emblem character</p>

      <HPBar guessCount={won ? guesses.length - 1 : guesses.length} />

      {!completed && (
        <SearchInput onSelect={handleSelect} disabled={false} />
      )}

      {error && (
        <p className="mt-3 text-red-400 text-sm">{error}</p>
      )}

      {completed && !showModal && (
        <button
          onClick={() => setDismissed(false)}
          className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-colors"
        >
          View Result
        </button>
      )}

      <GameBoard guesses={guesses} />

      {completed && (
        <Link
          to="/infinite"
          className="mt-6 px-6 py-2 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
        >
          Try Infinite Mode
        </Link>
      )}

      {showModal && (
        <ResultModal
          guesses={guesses}
          won={won}
          targetCharacter={targetCharacter}
          stats={stats}
          onClose={() => setDismissed(true)}
        />
      )}
    </div>
  )
}
