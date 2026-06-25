import ResultCell from './ResultCell'

const FIELDS = [
  { key: 'game',            label: 'Game',           wide: true  },
  { key: 'gender',          label: 'Gender',         wide: false },
  { key: 'weapon',          label: 'Weapon',         wide: true  },
  { key: 'starting_class',  label: 'Class',          wide: false },
  { key: 'movement_type',   label: 'Movement',       wide: false },
  { key: 'hair_color',      label: 'Hair',           wide: false },
  { key: 'promotion_tier',  label: 'Tier',           wide: false },
]

const GAME_ABBREV = {
  'Shadow Dragon':                'Shadow Dragon',
  'New Mystery of the Emblem':    'New Mystery',
  'Echoes: Shadows of Valentia':  'Echoes',
  'Genealogy of the Holy War':    'Genealogy',
  'Thracia 776':                  'Thracia 776',
  'The Binding Blade':            'Binding Blade',
  'The Blazing Blade':            'Blazing Blade',
  'The Sacred Stones':            'Sacred Stones',
  'Path of Radiance':             'Path of Radiance',
  'Radiant Dawn':                 'Radiant Dawn',
  'Awakening':                    'Awakening',
  'Fates':                        'Fates',
  'Three Houses':                 'Three Houses',
  'Engage':                       'Engage',
}

function formatValue(key, characterData) {
  if (!characterData) return '—'
  const values = [].concat(characterData[key])
  if (key === 'game') return values.map(g => GAME_ABBREV[g] ?? g).join(', ')
  return values.join(', ')
}

export default function GuessRow({ guess }) {
  const { character_name, character_portrait_url, result, characterData } = guess

  return (
    <div className="flex items-center gap-2">

      <div className="w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
        {character_portrait_url
          ? <img src={character_portrait_url} alt={character_name} className="w-full h-full object-cover" />
          : <span className="text-xs text-gray-400 font-bold">{character_name[0]}</span>
        }
      </div>

      <span className="w-28 lg:w-32 xl:w-36 text-sm lg:text-base font-medium truncate shrink-0">{character_name}</span>

      {FIELDS.map(({ key, wide }) => {
        const { status, direction } = result[key]
        const value = formatValue(key, characterData)
        return (
          <ResultCell key={key} value={value} status={status} direction={direction} wide={wide} />
        )
      })}

    </div>
  )
}
