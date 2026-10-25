import Button from '../ui/Button';
import Input from '../ui/Input';

export default function VenueSearchBar({
  search,
  onSearchChange,
  onSubmit,
  onNearMe,
  nearMeLoading = false,
  nearMeActive = false,
  className = '',
}) {
  return (
    <form onSubmit={onSubmit} className={`magic-card p-5 sm:p-6 ${className}`}>
      <p className="font-display text-base font-bold text-ink">
        Trouver un café ou restaurant
      </p>
      <p className="mt-1 text-sm text-ink-muted">Recherche par nom, ville ou position GPS.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base" aria-hidden>
            🔍
          </span>
          <Input
            placeholder="Nom, ville… (ex. Casablanca)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="!pl-11"
          />
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <Button type="submit" className="flex-1 sm:flex-none">
            Rechercher
          </Button>
          <Button
            type="button"
            variant={nearMeActive ? 'primary' : 'secondary'}
            onClick={onNearMe}
            disabled={nearMeLoading}
            className={`flex-1 sm:flex-none ${nearMeActive ? 'shadow-glow' : ''}`}
          >
            {nearMeLoading ? '…' : nearMeActive ? '✓ Près de moi' : '📍 Près de moi'}
          </Button>
        </div>
      </div>
    </form>
  );
}