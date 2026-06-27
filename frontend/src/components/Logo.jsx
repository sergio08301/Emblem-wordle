export default function Logo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, gap: 1 }}>
      <span style={{
        fontFamily: "'NocturneSerif', 'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontWeight: 700,
        fontSize: '20px',
        color: '#c41230',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        userSelect: 'none',
      }}>
        Fire Emblem
      </span>
      <span style={{
        fontFamily: "'Josefin Sans', 'Century Gothic', Arial, sans-serif",
        fontWeight: 700,
        fontSize: '33px',
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
