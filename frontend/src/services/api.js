const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

//Todos los componentes van a necesitar hacer peticiones al backend. Si centramos esa lógica en un solo archivo, 
// cuando cambie la URL del servidor (por ejemplo al desplegarlo) solo hay que tocar un sitio.

export async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Error del servidor')
  }
  return response.json()
}

export function getToday(anonymousId, token = null) {
  return request('/game/today', {
    headers: {
      'X-Anonymous-ID': anonymousId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

export function submitGuess(characterId, anonymousId, token = null) {
  return request('/game/guess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Anonymous-ID': anonymousId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ character_id: characterId }),
  })
}

export function recruitDaily(token) {
  return request('/army/me/recruit/daily', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function getBarracks(token) {
  return request('/army/me/barracks', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function setCharacterSlot(token, characterId, slot) {
  return request(`/army/me/characters/${characterId}/slot`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ slot }),
  })
}

export function searchCharacters(query) {
  return request(`/characters/?search=${encodeURIComponent(query)}`)
}

export function getStats(token) {
  return request('/game/stats', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function startInfinite() {
  return request('/game/infinite/start', { method: 'POST' })
}

export function submitInfiniteGuess(sessionToken, characterId, attemptNumber, token = null) {
  return request('/game/infinite/guess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ session_token: sessionToken, character_id: characterId, attempt_number: attemptNumber }),
  })
}

export function recruitInfinite(token, characterId) {
  return request('/army/me/recruit/infinite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ character_id: characterId }),
  })
}