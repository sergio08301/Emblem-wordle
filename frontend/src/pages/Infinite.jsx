import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInfiniteGame } from '../hooks/useInfiniteGame'
import SearchInput from '../components/SearchInput'
import GameBoard from '../components/GameBoard'
import ResultModal from '../components/ResultModal'
import HPBar from '../components/HPBar'
import { playHitSound, playLevelUpSound, playDeathSound } from '../utils/sounds'

export default function Infinite() {
  const { guesses, won, lost, sessionToken, targetCharacter, loading, error, startGame, submitGuess } = useInfiniteGame()
  const [dismissed, setDismissed] = useState(false)
  const completed = won || lost
  const showModal = completed && !!targetCharacter && !dismissed

  async function handleSelect(character) {
    const result = await submitGuess(character.id, character)
    if (!result) return

    if (result.won) {
      setTimeout(() => { setDismissed(false); playLevelUpSound() }, 500)
    } else if (result.lost) {
      playHitSound()
      setTimeout(() => { setDismissed(false); playDeathSound() }, 900)
    } else {
      playHitSound()
    }
  }

  async function handlePlayAgain() {
    setDismissed(true)
    await startGame()
    setDismissed(false)
  }

  return (
    <div className="text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-1">Infinite Mode</h1>
      <p className="text-gray-300 mb-6">Guess as many Fire Emblem characters as you want</p>

      {!sessionToken && (
        <button
          onClick={startGame}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Start Game'}
        </button>
      )}

      {sessionToken && (
        <HPBar guessCount={guesses.filter(g => !g.won).length} />
      )}

      {sessionToken && !completed && (
        <SearchInput onSelect={handleSelect} disabled={false} />
      )}

      {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

      {completed && !showModal && (
        <button
          onClick={() => setDismissed(false)}
          className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-colors"
        >
          View Result
        </button>
      )}

      <GameBoard guesses={guesses} />

      <Link
        to="/"
        className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
      >
        Back to Daily
      </Link>

      {showModal && (
        <ResultModal
          guesses={guesses}
          won={won}
          targetCharacter={targetCharacter}
          stats={null}
          showShare={false}
          onClose={() => setDismissed(true)}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  )
}
