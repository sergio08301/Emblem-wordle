const MAX_ATTEMPTS = 8

export default function HPBar({ guessCount }) {
  const remaining = MAX_ATTEMPTS - guessCount

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 6px',
        background: '#1049ad',
        border: '2px solid #3858c8',
        borderRadius: '3px',
      }}>
        <span style={{
          color: '#f8e448',
          fontWeight: 'bold',
          fontSize: '22px',
          fontFamily: 'monospace',
          minWidth: '20px',
          textAlign: 'right',
          textShadow: '1px 1px 0 #000',
          lineHeight: 1,
        }}>
          {remaining}
        </span>

        <div style={{ display: 'flex', gap: '0px' }}>
          {Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
            const fill = i < remaining
            return (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                borderTop: '5px solid #005900',
                borderBottom: '5px solid #005900',
              }}>
                <div style={{
                  width: '15px',
                  height: '13px',
                  background: fill ? '#d5fba0' : '#219400',
                  borderLeft: '3px solid #00aa00',
                  borderRight: '3px solid #00aa00',
                }} />
                <div style={{
                  width: '15px',
                  height: '14px',
                  background: fill ? '#94fb8c' : '#219400',
                  borderLeft: '3px solid #005900',
                  borderRight: '3px solid #005900',
                }} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
