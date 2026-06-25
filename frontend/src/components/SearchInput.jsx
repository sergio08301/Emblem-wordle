import { useState, useEffect, useRef } from 'react'
import { searchCharacters } from '../services/api'

export default function SearchInput({ onSelect, disabled }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchCharacters(query)
        setResults(data)
        setOpen(data.length > 0)
      } catch {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  function handleSelect(character) {
    onSelect(character)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        disabled={disabled}
        placeholder="Guess a character..."
        className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
      {open && (
        <ul className="absolute z-10 w-full mt-1 bg-gray-800 rounded shadow-lg max-h-60 overflow-y-auto">
          {results.map(character => (
            <li
              key={character.id}
              onClick={() => handleSelect(character)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-700 text-sm flex items-center gap-2"
            >
              {character.portrait_url
                ? <img src={character.portrait_url} alt="" className="w-6 h-6 rounded object-cover" />
                : <div className="w-6 h-6 rounded bg-gray-600 flex items-center justify-center text-xs">{character.name[0]}</div>
              }
              {character.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
