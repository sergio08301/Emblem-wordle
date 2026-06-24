const MUTE_KEY = 'emblem_wordle_muted'

export function isMuted() {
  return !!localStorage.getItem(MUTE_KEY)
}

export function setMuted(value) {
  if (value) localStorage.setItem(MUTE_KEY, '1')
  else localStorage.removeItem(MUTE_KEY)
}

function play(file) {
  if (isMuted()) return
  const audio = new Audio(`/${file}`)
  audio.play().catch(() => {})
}

export function playHitSound() {
  const n = Math.floor(Math.random() * 4) + 1
  play(`Attack Hit ${n}.wav`)
}


export function playLevelUpSound() {
  play('Level Up.wav')
}

export function playDeathSound() {
  play('Death.wav')
}
