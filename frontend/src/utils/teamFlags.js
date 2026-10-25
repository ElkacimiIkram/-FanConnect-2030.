const FLAG_CDN = 'https://flagcdn.com';

export function flagUrl(code, size = 'w80') {
  if (!code) return null;
  return `${FLAG_CDN}/${size}/${code}.png`;
}

export function teamVisuals(match, side) {
  const crest = side === 'home' ? match.homeTeamCrest : match.awayTeamCrest;
  const flagCode = side === 'home' ? match.homeTeamFlagCode : match.awayTeamFlagCode;
  const name = side === 'home' ? match.homeTeam : match.awayTeam;
  return {
    crest,
    flagUrl: flagUrl(flagCode),
    name,
    initials: name ? name.slice(0, 3).toUpperCase() : '?',
  };
}

export function teamVisualsFromTeam(team) {
  return {
    crest: team?.crestUrl,
    flagUrl: flagUrl(team?.flagCode),
    name: team?.name,
    initials: team?.name ? team.name.slice(0, 3).toUpperCase() : '?',
  };
}