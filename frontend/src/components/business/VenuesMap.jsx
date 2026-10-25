import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { getBusinessCoordinates, withResolvedCoordinates } from '../../utils/businessLocation';
import { getBusinessImageUrl } from '../../utils/businessImage';
import {
  getOccupancyDescription,
  getOccupancyDotStyle,
  getOccupancyLabel,
  resolveOccupancyLevel,
} from '../../utils/occupancy';
import OccupancyMapLegend from './OccupancyMapLegend';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [33.5731, -7.5898];
const DEFAULT_ZOOM = 11;
const FOCUS_ZOOM = 16;

const PIN_GRADIENTS = {
  GREEN: 'linear-gradient(135deg, #16b364, #0b7f47)',
  ORANGE: 'linear-gradient(135deg, #fbbf24, #d97706)',
  RED: 'linear-gradient(135deg, #f87171, #dc2626)',
  DEFAULT: 'linear-gradient(135deg, #16b364, #0b7f47)',
};

const TYPE_LABELS = {
  CAFE: 'Café',
  RESTAURANT: 'Restaurant',
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getOccupancyLevelForBusiness(businessId, occupancyMap) {
  const occ = occupancyMap?.[businessId];
  if (!occ) return null;
  return occ.level || resolveOccupancyLevel(occ.occupancyPercentage ?? 0);
}

function createVenueIcon(name, isHighlighted, occupancyLevel) {
  const shortName = name.length > 12 ? `${name.slice(0, 10)}…` : name;
  const level = occupancyLevel || 'DEFAULT';
  const gradient = PIN_GRADIENTS[level] || PIN_GRADIENTS.DEFAULT;
  const pulseClass = level === 'RED' ? 'venue-marker-pin--pulse' : '';

  return L.divIcon({
    className: 'venue-marker-icon',
    html: `
      <div class="venue-marker ${isHighlighted ? 'venue-marker--active' : ''} ${occupancyLevel ? `venue-marker--${(occupancyLevel || 'green').toLowerCase()}` : ''}">
        <div class="venue-marker-pin ${pulseClass}" style="background: ${gradient}"></div>
        <div class="venue-marker-label">${escapeHtml(shortName)}</div>
      </div>
    `,
    iconSize: [1, 1],
    iconAnchor: [14, 40],
    popupAnchor: [0, -38],
  });
}

function MapFocusController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 0.7 });
    }
  }, [center, zoom, map]);

  return null;
}

function VenuePopupContent({ business, occupancy, matchId }) {
  const imageUrl = getBusinessImageUrl(business);
  const level = occupancy?.level || (occupancy ? resolveOccupancyLevel(occupancy.occupancyPercentage) : null);

  return (
    <div>
      <img
        src={imageUrl}
        alt={business.name}
        className="venue-popup-image"
        loading="lazy"
      />
      <div className="venue-popup-body space-y-2 text-sm">
        <p className="font-bold text-gray-900">{business.name}</p>
        <p className="text-gray-500">
          {TYPE_LABELS[business.businessType] || business.businessType}
          {business.city ? ` · ${business.city}` : ''}
        </p>
        {business.address && <p className="text-xs text-gray-500">{business.address}</p>}

        {occupancy && level && (
          <div className={`rounded-lg border px-3 py-2 text-xs ${
            level === 'RED' ? 'border-red-200 bg-red-50 text-red-800'
              : level === 'ORANGE' ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}>
            <p className="flex items-center gap-1.5 font-bold">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${getOccupancyDotStyle(level)}`} />
              {getOccupancyLabel(level)} — {Math.round(occupancy.occupancyPercentage)}%
            </p>
            <p className="mt-1 opacity-90">{getOccupancyDescription(level)}</p>
            {occupancy.availableSeats != null && (
              <p className="mt-1 font-semibold">{occupancy.availableSeats} places libres</p>
            )}
          </div>
        )}

        {business.distanceKm != null && (
          <p className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            À {Number(business.distanceKm).toFixed(1)} km
          </p>
        )}
        {business.minMatchDayPrice != null && (
          <p className="text-xs text-gray-600">
            À partir de <strong>{Number(business.minMatchDayPrice).toFixed(0)} MAD</strong>
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <Link
            to={ROUTES.CAFE_DETAILS(business.id)}
            className="flex-1 rounded-lg bg-primary-600 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-primary-700"
          >
            Détails
          </Link>
          <Link
            to={ROUTES.BOOK({ businessId: business.id, matchId })}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Réserver
          </Link>
        </div>
      </div>
    </div>
  );
}

function VenueMarker({ business, isHighlighted, onMarkerClick, occupancy, matchId }) {
  const markerRef = useRef(null);
  const coords = getBusinessCoordinates(business);
  const occupancyLevel = getOccupancyLevelForBusiness(business.id, occupancy ? { [business.id]: occupancy } : {});

  useEffect(() => {
    if (isHighlighted && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isHighlighted]);

  if (!coords) return null;

  return (
    <Marker
      ref={markerRef}
      position={[coords.lat, coords.lng]}
      icon={createVenueIcon(business.name, isHighlighted, occupancyLevel)}
      zIndexOffset={isHighlighted ? 1000 : occupancyLevel === 'RED' ? 500 : 0}
      eventHandlers={{ click: () => onMarkerClick?.(business.id) }}
    >
      <Popup minWidth={240} maxWidth={280}>
        <VenuePopupContent business={business} occupancy={occupancy} matchId={matchId} />
      </Popup>
    </Marker>
  );
}

export default function VenuesMap({
  businesses = [],
  userLat = null,
  userLng = null,
  highlightedBusinessId = null,
  onMarkerClick,
  singleBusiness = false,
  occupancyMap = null,
  matchId = null,
  showOccupancyLegend = true,
  className = '',
}) {
  const resolvedBusinesses = useMemo(
    () => businesses.map(withResolvedCoordinates).filter((b) => getBusinessCoordinates(b)),
    [businesses]
  );

  const occupancyStats = useMemo(() => {
    if (!occupancyMap) return null;
    const counts = { GREEN: 0, ORANGE: 0, RED: 0 };
    resolvedBusinesses.forEach((b) => {
      const level = getOccupancyLevelForBusiness(b.id, occupancyMap);
      if (level && counts[level] != null) counts[level] += 1;
    });
    return counts;
  }, [occupancyMap, resolvedBusinesses]);

  const focusCenter = useMemo(() => {
    if (highlightedBusinessId != null) {
      const highlighted = resolvedBusinesses.find((b) => b.id === highlightedBusinessId);
      const coords = getBusinessCoordinates(highlighted);
      if (coords) return [coords.lat, coords.lng];
    }
    if (singleBusiness && resolvedBusinesses.length === 1) {
      const coords = getBusinessCoordinates(resolvedBusinesses[0]);
      if (coords) return [coords.lat, coords.lng];
    }
    if (userLat != null && userLng != null) return [userLat, userLng];
    if (resolvedBusinesses.length > 0) {
      const latSum = resolvedBusinesses.reduce((sum, b) => sum + Number(b.latitude), 0);
      const lngSum = resolvedBusinesses.reduce((sum, b) => sum + Number(b.longitude), 0);
      return [latSum / resolvedBusinesses.length, lngSum / resolvedBusinesses.length];
    }
    return DEFAULT_CENTER;
  }, [highlightedBusinessId, resolvedBusinesses, singleBusiness, userLat, userLng]);

  const zoom = highlightedBusinessId != null || singleBusiness ? FOCUS_ZOOM : userLat != null ? 13 : DEFAULT_ZOOM;

  if (resolvedBusinesses.length === 0 && userLat == null) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br from-slate-50 to-primary-50/30 p-10 text-center text-sm text-gray-500 ${className}`}>
        Aucune localisation disponible pour le moment.
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-medium text-gray-600">
        {userLat != null && (
          <span className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500" />
            Votre position
          </span>
        )}
        <span className="flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-primary-700">
          <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
          {resolvedBusinesses.length} lieu{resolvedBusinesses.length > 1 ? 'x' : ''}
        </span>
        {occupancyStats && (
          <>
            {occupancyStats.GREEN > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {occupancyStats.GREEN} dispo
              </span>
            )}
            {occupancyStats.ORANGE > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {occupancyStats.ORANGE} modéré
              </span>
            )}
            {occupancyStats.RED > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {occupancyStats.RED} complet
              </span>
            )}
          </>
        )}
      </div>

      {showOccupancyLegend && occupancyMap && (
        <OccupancyMapLegend className="mb-4" compact />
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200/80 shadow-card ring-1 ring-black/5">
        <MapContainer
          center={focusCenter}
          zoom={zoom}
          scrollWheelZoom
          className="z-0 h-[380px] w-full lg:h-[480px]"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapFocusController center={focusCenter} zoom={zoom} />

          {userLat != null && userLng != null && (
            <CircleMarker
              center={[userLat, userLng]}
              radius={10}
              pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }}
            >
              <Popup><strong>Vous êtes ici</strong></Popup>
            </CircleMarker>
          )}

          {resolvedBusinesses.map((business) => (
            <VenueMarker
              key={business.id}
              business={business}
              isHighlighted={highlightedBusinessId === business.id}
              onMarkerClick={onMarkerClick}
              occupancy={occupancyMap?.[business.id]}
              matchId={matchId}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}