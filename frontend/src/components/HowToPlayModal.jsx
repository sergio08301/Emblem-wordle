export default function HowToPlayModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg relative overflow-y-auto max-h-[90vh]">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >✕</button>

        <h2 className="text-2xl font-bold text-center mb-6 text-white">How to Play</h2>

        <section className="mb-6">
          <h3 className="font-bold mb-3 uppercase tracking-wide text-xs text-gray-400">Rules</h3>
          <ul className="flex flex-col gap-3 text-sm text-gray-300">
            <li>Guess the Fire Emblem character of the day. It changes every 24 hours.</li>
            <li>Type a character's name and their attributes will appear as a suggestion.</li>
            <li>After each guess, the cells are color-coded to show how close you were:</li>
            <li className="flex flex-col gap-1 pl-2">
              <div className="flex items-center gap-3">
                <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold shrink-0">Green</span>
                <span>Exact match.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold shrink-0">Orange</span>
                <span>Partial match — some overlap with the answer.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-red-700 text-white px-2 py-0.5 rounded text-xs font-bold shrink-0">Red</span>
                <span>No match.</span>
              </div>
            </li>
            <li>⬆️ ⬇️ Arrows on the <strong className="text-white">Game</strong> column indicate whether the correct answer is an earlier or later release than your guess.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold mb-3 uppercase tracking-wide text-xs text-gray-400">Notes</h3>
          <ul className="flex flex-col gap-3 text-sm text-gray-300">
            <li>If a game has a remake, the remake fully replaces the original in release order, so the order goes: Shadow Dragon, Echoes, New Mystery, Genealogy…</li>
            <li>All character data, except hair color, comes from <span className="text-blue-400">fireemblemwiki.org</span>.</li>
            <li>A character's class and weapons are always those from their <strong className="text-white">first appearance</strong>. For example, Abel is a Cavalier, not a Paladin as in New Mystery.</li>
            <li>Hair color is a category I added to help with guessing, but it's subjective and assigned from my own perspective, don't be too upset if you disagree with a choice.</li>
            <li>DLC characters are included. Amiibo, einherjar, SpotPass, trial maps, Creature Campaign and capturable units (Fates) are not.</li>
            <li>Kris has no canon class and is not in the database. Morgan has no canon class either, but is closely tied to Robin's, so they use Tactician.</li>
            <li>If the same character appears under different names, they count as separate entries (e.g. Owain / Odin). If they share the same name, they appear across all games they feature in.</li>
            <li>Thracia 776 weapon ranks does not account for the dismount mechanic.</li>
            <li>I've done my best to unify equivalent terms across games — for example, a character who uses Fire, Thunder, and Wind magic together (Tellius / Genealogy) is a perfect match for Anima Magic (GBA), Tomes (Fates / Archanea), and Black Magic (Echoes / Three Houses). The same logic applies to many class names.</li>
            <li>Three Houses uses each unit's predominant weapon proficiencies. The three house leaders and Byleth use the first unique class they unlock. The Ashen Wolves use their canonical Cindered Shadows DLC classes, to avoid an overload of Noble / Commoner entries.</li>
            <li>Engage uses custom naming for protagonist-exclusive classes to allow useful overlaps: Diamant is listed as <strong className="text-white">Lord(Diamant)</strong> (similar to Mercenary) and Alcryst as <strong className="text-white">Lord(Alcryst)</strong> (similar to Archer).</li>
          </ul>
        </section>

        <button
          onClick={onClose}
          className="mt-8 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
        >
          Got it!
        </button>

      </div>
    </div>
  )
}
