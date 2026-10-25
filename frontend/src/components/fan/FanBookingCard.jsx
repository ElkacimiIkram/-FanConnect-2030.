import { Link } from 'react-router-dom';
import OccupancyBadge from '../business/OccupancyBadge';
import OccupancyBar from '../business/OccupancyBar';
import OccupancyInsight from '../business/OccupancyInsight';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { bookingApi } from '../../api/bookingApi';
import { ROUTES } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';
import { getOccupancyDescription } from '../../utils/occupancy';

const STATUS_STYLES = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  CANCELLED: 'border-surface-border bg-surface-muted text-ink-muted',
  CHECKED_IN: 'border-primary-200 bg-primary-50 text-primary-800',
};

const STATUS_LABELS = {
  PENDING: 'En attente de paiement',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  CHECKED_IN: 'Check-in effectué',
};

export default function FanBookingCard({
  booking,
  occupancy = null,
  onCancel,
  cancelling = false,
  onDownloadPdf,
}) {
  const isMatchDay = booking.matchId != null || booking.businessId != null;

  return (
    <Card className="magic-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-border bg-surface-muted/50 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-700">
            {booking.competition || 'Match-day'}
          </p>
          <h3 className="font-display text-base font-bold text-ink">
            {booking.matchLabel || booking.businessName || booking.cafeName}
          </h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            STATUS_STYLES[booking.status] || 'bg-surface-muted text-ink-muted'
          }`}
        >
          {STATUS_LABELS[booking.status] || booking.status}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">Date</p>
            <p className="text-sm font-semibold text-ink">
              {formatDateTime(booking.reservationDateTime)}
            </p>
            {booking.partySize > 0 && (
              <p className="mt-1 text-xs text-ink-muted">{booking.partySize} personnes</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">Lieu</p>
            <p className="text-sm font-semibold text-ink">
              {booking.businessName || booking.cafeName}
            </p>
            {(booking.spaceName || booking.tableNumber) && (
              <p className="mt-1 text-xs text-ink-muted">
                {[booking.spaceName, booking.tableNumber && `Table ${booking.tableNumber}`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
        </div>

        {occupancy && (
          <div className="mt-4 rounded-xl border border-surface-border bg-surface p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                Affluence pour ce match
              </p>
              <OccupancyBadge
                level={occupancy.level}
                percentage={occupancy.occupancyPercentage}
              />
            </div>
            <div className="mt-2">
              <OccupancyBar occupancy={occupancy} showLegend={false} />
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              {getOccupancyDescription(occupancy.level)}
              {occupancy.availableSeats != null && (
                <span className="font-semibold text-ink">
                  {' '}— {occupancy.availableSeats} places encore libres
                </span>
              )}
            </p>
            <OccupancyInsight occupancy={occupancy} />
          </div>
        )}

        {booking.ticketCode && (
          <p className="mt-4 font-mono text-sm font-semibold text-primary-700">
            Ticket : {booking.ticketCode}
          </p>
        )}
        {booking.totalPrice != null && (
          <p className="mt-1 text-sm text-ink-muted">
            {Number(booking.totalPrice).toFixed(0)} MAD
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {booking.status === 'PENDING' && isMatchDay && (
            <Link to={ROUTES.BOOK({ bookingId: booking.id })}>
              <Button>Finaliser le paiement</Button>
            </Link>
          )}
          {booking.ticketCode && booking.status === 'CONFIRMED' && onDownloadPdf && (
            <Button variant="secondary" onClick={() => onDownloadPdf(booking)}>
              Ticket PDF
            </Button>
          )}
          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && onCancel && (
            <Button
              variant="danger"
              onClick={() => onCancel(booking.id)}
              disabled={cancelling}
            >
              {cancelling ? 'Annulation…' : 'Annuler'}
            </Button>
          )}
          {booking.businessId && (
            <Link to={ROUTES.CAFE_DETAILS(booking.businessId)} className="btn-arena-outline py-2 text-xs">
              Voir le lieu
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

export async function downloadBookingPdf(booking) {
  const response = await bookingApi.downloadTicketPdf(booking.id);
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ticket-${booking.ticketCode || booking.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}