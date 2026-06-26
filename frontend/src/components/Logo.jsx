export default function Logo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, gap: 1 }}>
      <span style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontWeight: 700,
        fontSize: '11px',
        color: '#c41230',
        WebkitTextStroke: '0.4px rgba(255,255,255,0.7)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        userSelect: 'none',
      }}>
        Fire Emblem
      </span>
      <span style={{
        fontFamily: "'Josefin Sans', 'Century Gothic', Arial, sans-serif",
        fontWeight: 700,
        fontSize: '21px',
        color: '#ffffff',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        userSelect: 'none',
      }}>
        Guess
      </span>
    </div>
  )
}
