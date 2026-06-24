const BASE_URL = 'http://localhost:8000'

//Todos los componentes van a necesitar hacer peticiones al backend. Si centramos esa lógica en un solo archivo, 
// cuando cambie la URL del servidor (por ejemplo al desplegarlo) solo hay que tocar un sitio.

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Error del servidor')
  }
  return response.json()
}

export function getToday(anonymousId) {
  return request('/game/today', {
    headers: { 'X-Anonymous-ID': anonymousId },
  })
}

export function submitGuess(characterId, anonymousId) {
  return request('/game/guess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Anonymous-ID': anonymousId,
    },
    body: JSON.stringify({ character_id: characterId }),
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

export function submitInfiniteGuess(sessionToken, characterId, attemptNumber) {
  return request('/game/infinite/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_token: sessionToken, character_id: characterId, attempt_number: attemptNumber }),
  })
}