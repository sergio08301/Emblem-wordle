const MAX_ATTEMPTS = 8
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1w4SJTSrf0r5P4nbcV04LzcIDb9mKSQXbUj3C5yfOx0g/edit?usp=sharing'

export default function HPBar({ guessCount }) {
  const remaining = MAX_ATTEMPTS - guessCount
  const showSommie = remaining <= 3

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>

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

      {showSommie && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/sommie.webp" alt="Sommie" style={{ width: 48, height: 48, objectFit: 'contain' }} />
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Open character database"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: '#1d6f42', borderRadius: 6, textDecoration: 'none', flexShrink: 0 }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 16H4V5h16v14zm-9-2h2v-3h3v-2h-3V9h-2v3H8v2h3z"/>
              </svg>
            </a>
          </div>
          <p style={{ color: '#d1d5db', fontSize: 12, textAlign: 'center', margin: 0 }}>
            Sommie thinks that you could use some help :3
          </p>
        </div>
      )}

    </div>
  )
}
