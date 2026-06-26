const key = (userId) => `lord_character_${userId}`

export function getLordId(userId) {
  const raw = localStorage.getItem(key(userId))
  return raw ? parseInt(raw, 10) : null
}

export function setLordId(userId, characterId) {
  localStorage.setItem(key(userId), String(characterId))
}
