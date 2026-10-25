export const COMPETITION_CATEGORY_LABELS = {
  WORLD_CUP: 'Coupe du Monde',
  CHAMPIONS_LEAGUE: 'Ligue des Champions',
  CAF: 'CAN / CAF',
  LEAGUE: 'Championnat',
  FRIENDLY: 'Match amical',
  OTHER: 'Autre',
};

export const MATCH_STATUS_LABELS = {
  SCHEDULED: 'À venir',
  LIVE: 'En direct',
  FINISHED: 'Terminé',
  CANCELLED: 'Annulé',
};

export const MATCH_IMPORTANCE_LABELS = {
  FINAL: 'Finale',
  SEMI_FINAL: 'Demi-finale',
  QUARTER_FINAL: 'Quart de finale',
  ROUND_OF_16: '8e de finale',
  GROUP_STAGE: 'Phase de groupes',
};

export function formatCountdown(seconds) {
  if (seconds == null || seconds <= 0) {
    return 'Bientôt';
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}j ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}