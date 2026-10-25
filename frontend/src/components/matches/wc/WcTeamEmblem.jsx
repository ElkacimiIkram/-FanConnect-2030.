export default function WcTeamEmblem({ crest, flagUrl, initials, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-14 w-14 sm:h-16 sm:w-16';

  return (
    <div className={`wc-team-emblem ${sizeClass}`}>
      {crest ? (
        <img src={crest} alt="" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-ink-muted">
          {initials}
        </div>
      )}
      {flagUrl && (
        <img src={flagUrl} alt="" className="wc-team-flag" loading="lazy" />
      )}
    </div>
  );
}