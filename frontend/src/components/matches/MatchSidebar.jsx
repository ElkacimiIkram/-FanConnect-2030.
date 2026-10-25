import { useState } from 'react';

const INITIAL_COUNTRY_LIMIT = 8;

export default function MatchSidebar({
  sections,
  activeNavId,
  onSelectNav,
  loading,
}) {
  const [expandedCountries, setExpandedCountries] = useState(false);

  return (
    <aside className="match-sidebar w-full shrink-0 border-r border-slate-200 bg-white lg:w-72 lg:overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary-700">Compétitions</p>
        <button
          type="button"
          onClick={() => onSelectNav('all')}
          className={`mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
            activeNavId === 'all'
              ? 'bg-primary-50 text-primary-800'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          Tous les matchs
        </button>
      </div>

      <nav className="px-2 py-3">
        {loading && (
          <p className="px-3 py-2 text-sm text-slate-500">Chargement...</p>
        )}

        {sections.map((section) => {
          const isCountrySection = section.id === 'all-countries';
          const visibleItems = isCountrySection && !expandedCountries
            ? section.items.slice(0, INITIAL_COUNTRY_LIMIT)
            : section.items;

          return (
            <div key={section.id} className="mb-4">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {section.title}
              </p>
              <ul className="mt-1 space-y-0.5">
                {visibleItems.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelectNav(item.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                        activeNavId === item.id
                          ? 'bg-slate-900 font-semibold text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>

              {isCountrySection && section.items.length > INITIAL_COUNTRY_LIMIT && (
                <button
                  type="button"
                  onClick={() => setExpandedCountries((v) => !v)}
                  className="mt-1 w-full px-3 py-2 text-left text-xs font-semibold text-primary-700 hover:text-primary-800"
                >
                  {expandedCountries ? 'Afficher moins' : 'Afficher plus'}
                </button>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}