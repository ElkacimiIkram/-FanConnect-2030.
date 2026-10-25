import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import OccupancyBadge from './OccupancyBadge';
import { ROUTES } from '../../utils/constants';

export default function CafeCard({ cafe, occupancy }) {
  return (
    <Card className="flex h-full flex-col transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{cafe.name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {cafe.city} · {cafe.address}
          </p>
        </div>
        {occupancy && (
          <OccupancyBadge level={occupancy.level} percentage={occupancy.occupancyPercentage} />
        )}
      </div>

      <p className="mt-4 flex-1 text-sm text-gray-600 line-clamp-3">{cafe.description}</p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-gray-500">Capacity: {cafe.capacity}</span>
        <Link
          to={ROUTES.CAFE_DETAILS(cafe.id)}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View details
        </Link>
      </div>
    </Card>
  );
}