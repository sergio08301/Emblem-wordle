const KEY = 'emblem_wordle_anonymous_id'

export function getAnonymousId() {
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}