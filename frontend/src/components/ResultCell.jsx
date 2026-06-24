//una sola cajita coloreada.

//STATUS_STYLES es un diccionario que convierte el texto que devuelve el backend ("correct", "partial", "incorrect") en una clase de color de Tailwind. Así si el backend dice correct, la caja se pinta de verde.
//El componente recibe tres props (datos que le pasa el padre):
//value — el texto que muestra (ej: "Cavalier")
//status — el resultado ("correct", "partial", "incorrect")
//direction — solo para el campo game ("higher"/"lower"). El {direction && ...} significa "solo renderiza la flecha si direction existe".


const STATUS_STYLES = {
  correct: 'bg-green-600',
  partial: 'bg-orange-500',
  incorrect: 'bg-red-700',
}

const DIRECTION_ARROW = {
  higher: '↑',
  lower: '↓',
}

export default function ResultCell({ value, status, direction, wide = false }) {
  return (
    <div className={`${STATUS_STYLES[status]} flex flex-col items-center justify-center
                     ${wide ? 'w-36' : 'w-24'} h-16 rounded text-white text-sm font-semibold text-center p-1`}>
      <span>{value}</span>
      {direction && (
        <span className="text-lg">{DIRECTION_ARROW[direction]}</span>
      )}
    </div>
  )
}
