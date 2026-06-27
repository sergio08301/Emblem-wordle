import GuessRow from './GuessRow'

const HEADERS = [
  {
    label: 'Game', wide: true,
    tooltip: 'Game(s) where the character is featured, ordered by release:\nShadow Dragon → Echoes → New Mystery → Genealogy of the Holy War → Thracia 776 → The Binding Blade → The Blazing Blade → The Sacred Stones → Path of Radiance → Radiant Dawn → Awakening → Fates → Three Houses → Engage',
  },
  {
    label: 'Gender', wide: false,
    tooltip: 'Male, Female…',
  },
  {
    label: 'Weapon Ranks', wide: true,
    tooltip: 'Weapons they can use when they join your ranks.',
  },
  {
    label: 'Starting Class', wide: false,
    tooltip: 'Class they have when they join your ranks.',
  },
  {
    label: 'Unit Type', wide: false,
    tooltip: 'Infantry, Armored, Cavalry, Flying…',
  },
  {
    label: 'Hair Color', wide: false,
    tooltip: 'Their hair color: Black, Brown, Blue…',
  },
  {
    label: 'Promotion Tier', wide: false,
    tooltip: 'Trainee: classes considered below base classes. Unpromoted: joins in a base class. Promoted: joins already promoted. Unique: a class outside the standard promotion system (no promotion available).',
  },
]

export default function GameBoard({ guesses }) {
  if (guesses.length === 0) return null

  return (
    <div className="w-full overflow-x-auto mt-6 pb-2">
    <div className="flex flex-col gap-2 w-max mx-auto px-2">

      <div className="flex items-center gap-2">
        <div className="w-12 lg:w-14 xl:w-16 shrink-0" />
        <div className="w-28 lg:w-32 xl:w-36 shrink-0" />
        {HEADERS.map(({ label, wide, tooltip }) => (
          <div key={label} className={`${wide ? 'w-36 lg:w-40 xl:w-48' : 'w-24 lg:w-28 xl:w-32'} relative group text-center text-xs text-gray-300 font-semibold uppercase tracking-wide cursor-default`}>
            {label}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 bg-gray-900 text-gray-200 text-xs font-normal normal-case tracking-normal rounded-lg px-3 py-2 shadow-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 whitespace-pre-line text-left">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
              {tooltip}
            </div>
          </div>
        ))}
      </div>

      {guesses.map((guess, i) => (
        <GuessRow key={i} guess={guess} />
      ))}

    </div>
    </div>
  )
}
