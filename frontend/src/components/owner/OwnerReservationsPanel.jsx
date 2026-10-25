import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { ROUTES } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';

const STATUS_LABELS = {
  CONFIRMED: 'À check-in',
  CHECKED_IN: 'Check-in fait',
  PENDING: 'En attente',
  CANCELLED: 'Annulée',
};

const FILTERS = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'CONFIRMED', label: 'À check-in' },
  { id: 'CHECKED_IN', label: 'Check-in fait' },
];

export default function OwnerReservationsPanel({
  reservations,
  highlightId,
  onOpenCheckIn,
}) {
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations.filter((r) => {
      if (filter !== 'ALL' && r.status !== filter) return false;
      if (!q) return true;
      return [r.fanName, r.fanEmail, r.fanPhone, r.matchLabel, r.ticketCode, r.businessName, r.tableNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [reservations, filter, query]);

  useEffect(() => {
    if (!highlightId) return undefined;
    const el = document.getElementById(`owner-reservation-${highlightId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return undefined;
  }, [highlightId, filtered]);

  const confirmedCount = reservations.filter((r) => r.status === 'CONFIRMED').length;
  const checkedInCount = reservations.filter((r) => r.status === 'CHECKED_IN').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Toutes les réservations</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {reservations.length} au total · {confirmedCount} à check-in · {checkedInCount} déjà validées
          </p>
        </div>
        <Link to={ROUTES.OWNER_CHECKIN()}>
          <Button>Ouvrir le check-in QR</Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`nav-pill ${filter === item.id ? 'nav-pill-active' : ''}`}
          >
            {item.label}
          </button>
        ))}
        <Input
          className="ml-auto min-w-[220px] max-w-sm"
          placeholder="Fan, email, ticket, match…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Alert variant="info">
          {reservations.length === 0
            ? 'Aucune réservation payée pour le moment. Elles apparaîtront ici dès qu’un fan réserve.'
            : 'Aucune réservation ne correspond à ce filtre.'}
        </Alert>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const isHighlight = String(r.reservationId) === String(highlightId);
            return (
              <Card
                key={r.reservationId}
                id={`owner-reservation-${r.reservationId}`}
                className={isHighlight ? 'ring-2 ring-primary-500/70' : ''}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-ink">{r.fanName}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          r.status === 'CHECKED_IN'
                            ? 'bg-primary-600/20 text-primary-300'
                            : 'bg-accent-500/15 text-accent-400'
                        }`}
                      >
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                      {isHighlight && (
                        <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-bold text-white">
                          Depuis la notification
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      {r.fanEmail}
                      {r.fanPhone ? ` · ${r.fanPhone}` : ''}
                      {r.fanCity ? ` · ${r.fanCity}` : ''}
                    </p>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Match</dt>
                        <dd className="mt-0.5 font-semibold text-ink">{r.matchLabel || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Table / lieu</dt>
                        <dd className="mt-0.5 text-ink">
                          {r.businessName || '—'}
                          {r.tableNumber ? ` · Table ${r.tableNumber}` : ''}
                          {r.spaceName ? ` · ${r.spaceName}` : ''}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Date</dt>
                        <dd className="mt-0.5 text-ink">
                          {r.reservationDateTime ? formatDateTime(r.reservationDateTime) : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Personnes</dt>
                        <dd className="mt-0.5 text-ink">{r.partySize}</dd>
                      </div>
                    </dl>
                    {r.ticketCode && (
                      <p className="mt-3 font-mono text-xs text-primary-300">Ticket {r.ticketCode}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-right">
                      <span className="block text-xs font-bold uppercase text-ink-faint">Votre part</span>
                      <span className="font-display text-xl font-bold text-primary-300">
                        {r.ownerPayout != null ? `${Number(r.ownerPayout).toFixed(2)} MAD` : '—'}
                      </span>
                    </p>
                    {r.status === 'CONFIRMED' && r.ticketCode && (
                      <Button size="sm" onClick={() => onOpenCheckIn(r.ticketCode)}>
                        Check-in QR
                      </Button>
                    )}
                    {r.status === 'CHECKED_IN' && r.checkedInAt && (
                      <p className="text-xs text-ink-faint">
                        Validé le {formatDateTime(r.checkedInAt)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
