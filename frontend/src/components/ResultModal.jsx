import { useState } from 'react'
import { buildShareText } from '../utils/share'

const GAME_ABBREV = {
  'Shadow Dragon': 'Shadow Dragon', 'New Mystery of the Emblem': 'New Mystery',
  'Echoes: Shadows of Valentia': 'Echoes', 'Genealogy of the Holy War': 'Genealogy',
  'Thracia 776': 'Thracia 776', 'The Binding Blade': 'Binding Blade',
  'The Blazing Blade': 'Blazing Blade', 'The Sacred Stones': 'Sacred Stones',
  'Path of Radiance': 'Path of Radiance', 'Radiant Dawn': 'Radiant Dawn',
  'Awakening': 'Awakening', 'Fates': 'Fates', 'Three Houses': 'Three Houses',
  'Engage': 'Engage',
}

const STATUS_EMOJI = { correct: '🟩', partial: '🟧', incorrect: '🟥' }
const FIELDS = ['game', 'gender', 'weapon', 'starting_class', 'movement_type', 'hair_color', 'promotion_tier']

export default function ResultModal({ guesses, won, targetCharacter, stats, onClose, onPlayAgain, showShare = true }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    await navigator.clipboard.writeText(buildShareText(guesses, won))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const game = targetCharacter.game.map(g => GAME_ABBREV[g] ?? g).join(', ')

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >✕</button>

        <h2 className={`text-2xl font-bold text-center mb-1 ${won ? 'text-green-400' : 'text-red-400'}`}>
          {won ? '✓ Victory' : '✗ Defeat'}
        </h2>

        <p className="text-center text-gray-300 mb-4">
          The character was{' '}
          <span className="text-yellow-400 font-bold">{targetCharacter.name}</span>
        </p>

        <div className="bg-gray-700 rounded-xl p-4 grid grid-cols-2 gap-2 text-sm mb-4">
          <div><span className="text-gray-400">Game: </span>{game}</div>
          <div><span className="text-gray-400">Starting Class: </span>{targetCharacter.starting_class.join(', ')}</div>
          <div><span className="text-gray-400">Weapon Ranks: </span>{targetCharacter.weapon.join(', ')}</div>
          <div><span className="text-gray-400">Unit Type: </span>{targetCharacter.movement_type.join(', ')}</div>
          <div><span className="text-gray-400">Tier: </span>{targetCharacter.promotion_tier}</div>
        </div>

        <div className="flex flex-col items-center gap-1 mb-6 font-mono text-xl">
          {guesses.map((guess, i) => (
            <div key={i}>
              {FIELDS.map(f => STATUS_EMOJI[guess.result[f].status]).join('')}
            </div>
          ))}
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-2 text-center mb-6">
            {[
              { label: 'Played', value: stats.games_played },
              { label: 'Win %', value: stats.games_played > 0 ? Math.round(stats.games_won / stats.games_played * 100) : 0 },
              { label: 'Streak', value: stats.current_streak },
              { label: 'Best', value: stats.max_streak },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-700 rounded-lg py-2">
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        )}

        {showShare && (
          <button
            onClick={handleShare}
            className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
          >
            {copied ? '¡Copied!' : '📋 Share Result'}
          </button>
        )}

        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
          >
            Play Again
          </button>
        )}

      </div>
    </div>
  )
}
