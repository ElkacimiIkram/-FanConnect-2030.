export const OCCUPANCY_THRESHOLDS = {
  GREEN_MAX: 50,
  ORANGE_MAX: 80,
};

export const OCCUPANCY_COLORS = {
  GREEN: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  ORANGE: 'bg-amber-100 text-amber-800 ring-amber-200',
  RED: 'bg-red-100 text-red-800 ring-red-200',
};

export const OCCUPANCY_DOT_COLORS = {
  GREEN: 'bg-emerald-500',
  ORANGE: 'bg-amber-500',
  RED: 'bg-red-500',
};

export const OCCUPANCY_BAR_COLORS = {
  GREEN: 'bg-emerald-500',
  ORANGE: 'bg-amber-500',
  RED: 'bg-red-500',
};

export const OCCUPANCY_LABELS = {
  GREEN: 'Disponible',
  ORANGE: 'Affluence modérée',
  RED: 'Presque complet',
};

export const OCCUPANCY_DESCRIPTIONS = {
  GREEN: 'Encore beaucoup de places pour ce match',
  ORANGE: 'Le café se remplit — réservez vite',
  RED: 'Très peu de places restantes',
};

export function calculateOccupancyPercentage(bookedSeats, capacity) {
  if (!capacity || capacity <= 0) return 100;
  const percentage = (bookedSeats * 100) / capacity;
  return Math.round(Math.min(percentage, 100) * 10) / 10;
}

export function getOccupancyLevel(percentage) {
  return resolveOccupancyLevel(percentage);
}

export function resolveOccupancyLevel(percentage) {
  if (percentage <= OCCUPANCY_THRESHOLDS.GREEN_MAX) return 'GREEN';
  if (percentage <= OCCUPANCY_THRESHOLDS.ORANGE_MAX) return 'ORANGE';
  return 'RED';
}

export function getOccupancyStyle(level) {
  return OCCUPANCY_COLORS[level] || OCCUPANCY_COLORS.GREEN;
}

export function getOccupancyDotStyle(level) {
  return OCCUPANCY_DOT_COLORS[level] || OCCUPANCY_DOT_COLORS.GREEN;
}

export function getOccupancyBarStyle(level) {
  return OCCUPANCY_BAR_COLORS[level] || OCCUPANCY_BAR_COLORS.GREEN;
}

export function getOccupancyLabel(level) {
  return OCCUPANCY_LABELS[level] || 'Inconnu';
}

export function getOccupancyDescription(level) {
  return OCCUPANCY_DESCRIPTIONS[level] || '';
}

export const OCCUPANCY_RISK_LABELS = {
  LOW: 'Faible risque de saturation',
  MEDIUM: 'Risque modéré — réservez tôt',
  HIGH: 'Risque élevé — places limitées',
};

export const OCCUPANCY_RISK_STYLES = {
  LOW: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-900 border-amber-200',
  HIGH: 'bg-red-50 text-red-800 border-red-200',
};

export function getOccupancyRiskLabel(risk) {
  return OCCUPANCY_RISK_LABELS[risk] || '';
}

export function getOccupancyRiskStyle(risk) {
  return OCCUPANCY_RISK_STYLES[risk] || OCCUPANCY_RISK_STYLES.LOW;
}