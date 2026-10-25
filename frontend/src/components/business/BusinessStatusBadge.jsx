const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  DISABLED: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS = {
  PENDING: 'Pending approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DISABLED: 'Disabled',
};

export default function BusinessStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] || STATUS_STYLES.DISABLED
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}