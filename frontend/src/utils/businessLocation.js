import { parseGoogleMapsCoordinates } from './parseMapsUrl';

export function getBusinessCoordinates(business) {
  if (!business) {
    return null;
  }

  const lat = Number(business.latitude);
  const lng = Number(business.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }

  return parseGoogleMapsCoordinates(business.googleMapsUrl);
}

export function hasBusinessLocation(business) {
  return getBusinessCoordinates(business) != null;
}

export function withResolvedCoordinates(business) {
  const coords = getBusinessCoordinates(business);
  if (!coords) {
    return business;
  }
  return {
    ...business,
    latitude: coords.lat,
    longitude: coords.lng,
  };
}