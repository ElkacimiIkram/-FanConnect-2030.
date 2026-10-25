import FanBookingCard from './FanBookingCard';
import { formatDateTime } from '../../utils/formatDate';

export default function FanMatchGroup({
  matchLabel,
  competition,
  matchDate,
  bookings,
  getOccupancy,
  onCancel,
  cancellingId,
  onDownloadPdf,
}) {
  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center gap-3 rounded-xl border border-primary-200 bg-gradient-to-r from-primary-50 to-surface-card px-4 py-3">
        <span className="text-2xl">⚽</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary-700">
            {competition || 'Coupe du Monde'}
          </p>
          <h2 className="font-display text-lg font-bold text-ink">{matchLabel}</h2>
          {matchDate && (
            <p className="text-xs text-ink-muted">{formatDateTime(matchDate)}</p>
          )}
        </div>
        <span className="ml-auto rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white">
          {bookings.length} réservation{bookings.length > 1 ? 's' : ''}
        </span>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {bookings.map((booking) => (
          <FanBookingCard
            key={booking.id}
            booking={booking}
            occupancy={getOccupancy?.(booking.matchId, booking.businessId)}
            onCancel={onCancel}
            cancelling={cancellingId === booking.id}
            onDownloadPdf={onDownloadPdf}
          />
        ))}
      </div>
    </section>
  );
}