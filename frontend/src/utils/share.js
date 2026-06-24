const STATUS_EMOJI = {
  correct:   '🟩',
  partial:   '🟧',
  incorrect: '🟥',
}

export function buildShareText(guesses, won) {
  const date = new Date().toLocaleDateString('en-GB')
  const result = won
    ? `Found in ${guesses.length}/8`
    : `Not found (${guesses.length}/8)`

  const fields = ['game', 'gender', 'weapon', 'starting_class', 'movement_type', 'hair_color', 'promotion_tier']
  const grid = guesses.map(guess =>
    fields.map(field => STATUS_EMOJI[guess.result[field].status]).join('')
  ).join('\n')

  return `Emblem Wordle ${date}\n${result}\n\n${grid}`
}
