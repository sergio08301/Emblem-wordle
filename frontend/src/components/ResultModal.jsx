import { useState } from 'react'
import { Link } from 'react-router-dom'
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

export default function ResultModal({ guesses, won, targetCharacter, stats, onRecruitDaily, onRecruitInfinite, infiniteTokenAvailable, xpReport, showUpsell, onClose, onPlayAgain, showShare = true }) {
  const [copied, setCopied] = useState(false)
  const [recruitState, setRecruitState] = useState('idle') // 'idle' | 'loading' | 'done'
  const [recruitResult, setRecruitResult] = useState(null)

  const onRecruit = onRecruitDaily || onRecruitInfinite
  const isInfiniteMode = !!onRecruitInfinite

  async function handleShare() {
    await navigator.clipboard.writeText(buildShareText(guesses, won))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRecruit() {
    setRecruitState('loading')
    try {
      const result = await onRecruit()
      setRecruitResult(result)
      setRecruitState('done')
    } catch {
      setRecruitState('idle')
    }
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

        {won && showUpsell && (
          <div className="flex items-center justify-between gap-3 bg-gray-700 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm text-gray-300">Create an account to recruit characters from all the series.</p>
            <Link
              to="/register"
              onClick={onClose}
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Sign up
            </Link>
          </div>
        )}

        {won && onRecruit && (
          <div className="bg-gray-700 rounded-xl p-4 mb-4">
            {recruitState === 'idle' && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  {targetCharacter.portrait_url
                    ? <img src={targetCharacter.portrait_url} alt="" className="w-14 h-14 rounded object-cover shrink-0" />
                    : <div className="w-14 h-14 rounded bg-gray-600 flex items-center justify-center text-lg shrink-0">{targetCharacter.name[0]}</div>
                  }
                  <p className="text-sm text-gray-300">
                    Would you like to recruit <span className="text-white font-semibold">{targetCharacter.name}</span> to your army?
                  </p>
                </div>
                {!isInfiniteMode && (
                  <p className="text-xs text-gray-500 mb-3">
                    This does not use your daily recruit — you can still recruit someone in Infinite Mode today.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleRecruit}
                    className="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Recruit
                  </button>
                  <button
                    onClick={() => setRecruitState('done')}
                    className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 text-sm font-bold rounded-lg transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </>
            )}
            {recruitState === 'loading' && (
              <p className="text-sm text-gray-400 text-center">Recruiting...</p>
            )}
            {recruitState === 'done' && recruitResult && (
              <p className="text-sm text-center">
                {recruitResult.is_new
                  ? <span className="text-green-400 font-semibold">{recruitResult.character_name} has joined your army!</span>
                  : <span className="text-gray-400">{recruitResult.character_name} was already in your army.</span>
                }
              </p>
            )}
            {!isInfiniteMode && recruitState === 'done' && (
              <div className="mt-3 pt-3 border-t border-gray-600 flex items-center justify-between gap-2">
                <p className="text-xs text-gray-400">You can still recruit someone else today.</p>
                <Link
                  to="/infinite"
                  onClick={onClose}
                  className="text-xs bg-purple-700 hover:bg-purple-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  Infinite Mode
                </Link>
              </div>
            )}
          </div>
        )}

        {won && isInfiniteMode && !onRecruit && (
          <p className="text-xs text-gray-500 text-center mb-4">
            Come back tomorrow to recruit more characters for your army.
          </p>
        )}

        {infiniteTokenAvailable && !onRecruit && (
          <div className="flex items-center justify-between gap-2 bg-purple-900/30 border border-purple-700/40 rounded-xl px-3 py-2 mb-4">
            <p className="text-xs text-purple-300">You have a free recruit available in Infinite Mode today.</p>
            <Link
              to="/infinite"
              onClick={onClose}
              className="text-xs bg-purple-700 hover:bg-purple-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Go now
            </Link>
          </div>
        )}

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

        {xpReport?.length > 0 && (
          <div className="bg-gray-700 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Deployed units</p>
            <div className="flex flex-col gap-1.5">
              {xpReport.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-200 truncate">{entry.character_name}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-green-400 font-mono">+{entry.xp_gained} XP</span>
                    {entry.leveled_up && (
                      <span className="text-yellow-400 font-bold">↑ Lv.{entry.new_level}!</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
