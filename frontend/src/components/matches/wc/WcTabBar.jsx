const TABS = [
  { id: 'matches', label: 'Matchs', icon: '⚽' },
  { id: 'standings', label: 'Classements', icon: '🏆' },
  { id: 'groups', label: 'Groupes', icon: '📊' },
  { id: 'teams', label: 'Équipes', icon: '🌍' },
  { id: 'schedule', label: 'Calendrier', icon: '📅' },
];

export default function WcTabBar({ activeTab, onChange, liveCount = 0 }) {
  return (
    <div className="wc-tab-bar">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pt-2 sm:px-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`wc-tab ${activeTab === tab.id ? 'wc-tab-active' : 'wc-tab-idle'}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.id === 'matches' && liveCount > 0 && (
              <span className="wc-tab-badge">{liveCount}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}