import { useState, useMemo } from 'react'

// ── Sommie messages ──────────────────────────────────────────────
// Add or remove lines here. One will be picked at random each time Sommie appears.
const SOMMIE_MESSAGES = [
  "Sommie thinks that you could use some help :3",
  // "Another one here...",
  // "And another one...",
]
// ─────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 8
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1w4SJTSrf0r5P4nbcV04LzcIDb9mKSQXbUj3C5yfOx0g/edit?usp=sharing'
const SOMMIE_W = 130

const HEART_STYLE = `
  @keyframes heartFloat {
    0%   { opacity: 1; transform: translateX(var(--hx)) translateY(0) scale(1); }
    100% { opacity: 0; transform: translateX(var(--hx)) translateY(-60px) scale(1.4); }
  }
`

export default function HPBar({ guessCount }) {
  const remaining = MAX_ATTEMPTS - guessCount
  const showSommie = remaining <= 3
  const [hearts, setHearts] = useState([])
  const sommieMessage = useMemo(
    () => SOMMIE_MESSAGES[Math.floor(Math.random() * SOMMIE_MESSAGES.length)],
    [showSommie]
  )

  function spawnHearts() {
    const batch = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.round(Math.random() * 80 - 40),
    }))
    setHearts(prev => [...prev, ...batch])
    setTimeout(() => setHearts(prev => prev.filter(h => !batch.some(b => b.id === h.id))), 1000)
  }

  const sommie = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src="/sommie.webp"
            alt="Sommie"
            onClick={spawnHearts}
            style={{ width: 48, height: 48, objectFit: 'contain', cursor: 'pointer' }}
          />
          {hearts.map(h => (
            <span
              key={h.id}
              style={{
                position: 'absolute',
                bottom: '60%',
                left: '50%',
                pointerEvents: 'none',
                fontSize: 18,
                '--hx': `calc(-50% + ${h.x}px)`,
                animation: 'heartFloat 1s ease-out forwards',
              }}
            >❤️</span>
          ))}
        </div>
        <a
          href={SPREADSHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Open character database"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}
        >
          <img src="/excel logo.png" alt="Excel" style={{ width: 60, height: 60, objectFit: 'contain' }} />
        </a>
      </div>
      <p style={{ color: '#d1d5db', fontSize: 12, textAlign: 'center', margin: 0 }}>
        {sommieMessage}
      </p>
    </>
  )

  const hpBar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', background: '#1049ad', border: '2px solid #3858c8', borderRadius: 3 }}>
      <span style={{ color: '#f8e448', fontWeight: 'bold', fontSize: 22, fontFamily: 'monospace', minWidth: 20, textAlign: 'right', textShadow: '1px 1px 0 #000', lineHeight: 1 }}>
        {remaining}
      </span>
      <div style={{ display: 'flex', gap: 0 }}>
        {Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
          const fill = i < remaining
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', borderTop: '5px solid #005900', borderBottom: '5px solid #005900' }}>
              <div style={{ width: 15, height: 13, background: fill ? '#d5fba0' : '#219400', borderLeft: '3px solid #00aa00', borderRight: '3px solid #00aa00' }} />
              <div style={{ width: 15, height: 14, background: fill ? '#94fb8c' : '#219400', borderLeft: '3px solid #005900', borderRight: '3px solid #005900' }} />
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div style={{ marginBottom: 16 }}>
      <style>{HEART_STYLE}</style>

      {/* Desktop: phantom spacer | hp bar | sommie — items-end keeps hp bar vertically stable */}
      <div className="hidden sm:flex items-center justify-center" style={{ gap: 32, minHeight: 85 }}>
        <div style={{ width: SOMMIE_W, flexShrink: 0 }} />
        {hpBar}
        {showSommie ? (
          <div style={{ width: SOMMIE_W, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            {sommie}
          </div>
        ) : (
          <div style={{ width: SOMMIE_W, flexShrink: 0 }} />
        )}
      </div>

      {/* Mobile: hp bar centered, sommie stacked below */}
      <div className="flex sm:hidden flex-col items-center gap-3">
        {hpBar}
        {showSommie && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            {sommie}
          </div>
        )}
      </div>

    </div>
  )
}
