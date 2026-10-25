import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { matchApi } from '../api/matchApi';
import MatchCountdown from '../components/matches/MatchCountdown';
import StickyReserveBar from '../components/matches/StickyReserveBar';
import MatchRecommendationsPanel from '../components/recommendations/MatchRecommendationsPanel';
import WcTeamEmblem from '../components/matches/wc/WcTeamEmblem';
import { useMatchRecommendations } from '../hooks/useMatchRecommendations';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { getApiData, getApiError } from '../utils/apiHelpers';
import { ROUTES } from '../utils/constants';
import { formatDateTime } from '../utils/formatDate';
import { MATCH_IMPORTANCE_LABELS, MATCH_STATUS_LABELS } from '../utils/matchLabels';
import { flagUrl } from '../utils/teamFlags';

const STAT_LABELS = {
  ball_possession: 'Possession',
  shots: 'Tirs',
  shots_on_goal: 'Tirs cadrés',
  shots_off_goal: 'Tirs non cadrés',
  corner_kicks: 'Corners',
  fouls: 'Fautes',
  yellow_cards: 'Cartons jaunes',
  red_cards: 'Cartons rouges',
  offsides: 'Hors-jeu',
  saves: 'Arrêts',
};

const PRIORITY_STATS = [
  'ball_possession',
  'shots',
  'shots_on_goal',
  'corner_kicks',
  'fouls',
  'yellow_cards',
  'red_cards',
];

function LineupBlock({ team, flagCode, align = 'left' }) {
  if (!team) return null;
  const isRight = align === 'right';

  return (
    <div className={`match-panel ${isRight ? 'text-right' : ''}`}>
      <div className={`flex items-center gap-3 ${isRight ? 'flex-row-reverse' : ''}`}>
        <WcTeamEmblem
          crest={team.crest}
          flagUrl={flagUrl(flagCode)}
          initials={team.name?.slice(0, 3).toUpperCase()}
        />
        <div>
          <h3 className="font-bold text-ink">{team.name}</h3>
          {team.formation && <p className="text-xs text-ink-faint">Formation {team.formation}</p>}
          {team.coachName && <p className="text-xs text-ink-faint">Coach : {team.coachName}</p>}
        </div>
      </div>

      {team.lineup?.length > 0 && (
        <div className="mt-4">
          <p className="match-panel-title mb-2">Titulaires</p>
          <ul className="space-y-1">
            {team.lineup.map((player) => (
              <li key={`${player.shirtNumber}-${player.name}`} className="text-sm text-ink-muted">
                <span className="font-semibold text-ink">{player.shirtNumber}.</span> {player.name}
                {player.position && <span className="text-xs text-ink-faint"> · {player.position}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {team.bench?.length > 0 && (
        <div className="mt-4">
          <p className="match-panel-title mb-2">Remplaçants</p>
          <ul className="space-y-1">
            {team.bench.map((player) => (
              <li key={`bench-${player.shirtNumber}-${player.name}`} className="text-sm text-ink-muted">
                {player.shirtNumber}. {player.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatsCompare({ homeTeam, awayTeam }) {
  const homeStats = homeTeam?.statistics || {};
  const awayStats = awayTeam?.statistics || {};
  const keys = PRIORITY_STATS.filter(
    (key) => homeStats[key] != null || awayStats[key] != null
  );

  if (keys.length === 0) {
    const fallbackKeys = [...new Set([...Object.keys(homeStats), ...Object.keys(awayStats)])];
    if (fallbackKeys.length === 0) return null;
    return (
      <div className="match-panel">
        <h3 className="match-panel-title mb-4">Statistiques</h3>
        <div className="space-y-3">
          {fallbackKeys.map((key) => (
            <div key={key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
              <span className="text-right font-semibold text-ink">{homeStats[key] ?? '—'}</span>
              <span className="text-center text-xs text-ink-faint">{STAT_LABELS[key] || key}</span>
              <span className="font-semibold text-ink">{awayStats[key] ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="match-panel">
      <h3 className="match-panel-title mb-4">Statistiques</h3>
      <div className="space-y-4">
        {keys.map((key) => {
          const homeVal = parseStat(homeStats[key]);
          const awayVal = parseStat(awayStats[key]);
          const total = homeVal + awayVal || 1;
          const homePct = (homeVal / total) * 100;

          return (
            <div key={key}>
              <div className="mb-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                <span className="text-right font-bold text-ink">{homeStats[key] ?? '—'}</span>
                <span className="text-center text-[10px] font-bold uppercase text-ink-faint">
                  {STAT_LABELS[key] || key}
                </span>
                <span className="font-bold text-ink">{awayStats[key] ?? '—'}</span>
              </div>
              <div className="flex gap-1">
                <div className="wc-stat-bar">
                  <div className="wc-stat-bar-fill ml-auto bg-primary-600" style={{ width: `${homePct}%` }} />
                </div>
                <div className="wc-stat-bar">
                  <div className="wc-stat-bar-fill bg-accent-500" style={{ width: `${100 - homePct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function parseStat(value) {
  if (value == null) return 0;
  const num = parseFloat(String(value).replace('%', ''));
  return Number.isNaN(num) ? 0 : num;
}

export default function MatchDetailPage({ mode = 'live' }) {
  const { externalId, localId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    data: recommendationsData,
    recommendations,
    loading: venuesLoading,
    error: venuesError,
    geoEnabled,
    refreshWithLocation,
  } = useMatchRecommendations(match?.localId ?? null);

  useEffect(() => {
    const id = mode === 'local' ? localId : externalId;
    if (!id) return undefined;

    const load = async (showSpinner = false) => {
      if (showSpinner) setLoading(true);
      setError('');
      try {
        const response = mode === 'local'
          ? await matchApi.localDetail(localId)
          : await matchApi.liveDetail(externalId);
        setMatch(getApiData(response));
      } catch (err) {
        setError(getApiError(err));
      } finally {
        if (showSpinner) setLoading(false);
      }
    };

    load(true);
    const interval = mode === 'live' ? setInterval(() => load(false), 10000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [externalId, localId, mode]);

  if (loading) {
    return (
      <div className="page-container">
        <Spinner label="Chargement de la fiche match..." />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="page-container">
        <Alert variant="error">{error || 'Match introuvable'}</Alert>
        <Link to={ROUTES.MATCHES} className="mt-4 inline-block text-sm font-semibold text-primary-700">
          ← Retour au Match Center
        </Link>
      </div>
    );
  }

  const isLive = match.status === 'LIVE';
  const isScheduled = match.status === 'SCHEDULED';
  const canReserve = match.bookable && match.localId && match.status !== 'FINISHED';
  const importance = MATCH_IMPORTANCE_LABELS[match.matchImportance] || match.stage;

  return (
    <div className={`page-container page-enter max-w-5xl ${canReserve ? 'pb-24' : ''}`}>
      <Link to={ROUTES.MATCHES} className="text-sm font-semibold text-primary-700 hover:text-primary-800">
        ← Retour au Match Center
      </Link>

      <header className="wc-detail-hero relative mt-4">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            {match.competitionEmblem && (
              <img src={match.competitionEmblem} alt="" className="h-8 w-8 object-contain" />
            )}
            <div>
              <p className="text-sm font-semibold text-white/80">
                {match.competitionName}
                {match.groupName ? ` · ${match.groupName}` : ''}
              </p>
              <p className="text-xs text-white/60">{formatDateTime(match.matchDate)}</p>
            </div>
            {importance && (
              <span className="wc-importance-badge border-white/20 bg-white/10 text-white">
                {importance}
              </span>
            )}
            <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
              isLive ? 'bg-red-500 text-white animate-pulse-glow' : 'bg-white/15 text-white'
            }`}>
              {isLive && match.matchMinute != null
                ? `${match.matchMinute}'${match.injuryTime ? `+${match.injuryTime}` : ''}`
                : MATCH_STATUS_LABELS[match.status] || match.status}
            </span>
          </div>

          {isScheduled && match.matchDate && (
            <div className="mt-6">
              <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-white/70">
                Coup d&apos;envoi dans
              </p>
              <MatchCountdown matchDate={match.matchDate} />
            </div>
          )}

          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex flex-col items-center gap-3 text-center sm:items-end">
              <WcTeamEmblem
                crest={match.homeTeam?.crest}
                flagUrl={flagUrl(match.homeTeamFlagCode)}
                initials={match.homeTeam?.name?.slice(0, 3).toUpperCase()}
                size="lg"
              />
              <h1 className="text-lg font-bold sm:text-xl">{match.homeTeam?.name}</h1>
            </div>

            <div className="text-center">
              <div className="font-display text-5xl font-black tabular-nums sm:text-6xl">
                {isScheduled ? 'vs' : `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`}
              </div>
              {(match.halfTimeHomeScore != null || match.halfTimeAwayScore != null) && (
                <p className="mt-2 text-xs text-white/60">
                  Mi-temps : {match.halfTimeHomeScore ?? 0} - {match.halfTimeAwayScore ?? 0}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 text-center sm:items-start">
              <WcTeamEmblem
                crest={match.awayTeam?.crest}
                flagUrl={flagUrl(match.awayTeamFlagCode)}
                initials={match.awayTeam?.name?.slice(0, 3).toUpperCase()}
                size="lg"
              />
              <h1 className="text-lg font-bold sm:text-xl">{match.awayTeam?.name}</h1>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-white/70">
            {match.venueName && <span>📍 {match.venueName}</span>}
            {match.city && <span>{match.city}</span>}
            {match.country && <span>{match.country}</span>}
            {match.refereeName && <span>Arbitre : {match.refereeName}</span>}
            {match.attendance && <span>{match.attendance.toLocaleString()} spectateurs</span>}
          </div>
        </div>
      </header>

      {canReserve && (
        <section id="match-reserve-cta" className="cta-banner mt-6 animate-scale-in">
          <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
            Réservez une place pour regarder ce match
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Cafés et restaurants partenaires approuvés — occupation en temps réel et tables disponibles.
          </p>
          <Link to={ROUTES.BOOK({ matchId: match.localId })} className="mt-4 inline-block">
            <Button>Réserver maintenant</Button>
          </Link>
        </section>
      )}

      {match.localId && (
        <section className="match-panel mt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="badge-gold">AI Recommendations</span>
              <h2 className="mt-2 font-display text-lg font-bold text-ink">
                Lieux recommandés pour ce match
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Proximité d&apos;abord — occupation actuelle, prédiction et score IA.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <MatchRecommendationsPanel
              data={recommendationsData}
              recommendations={recommendations}
              loading={venuesLoading}
              error={venuesError}
              geoEnabled={geoEnabled}
              matchId={canReserve ? match.localId : null}
              onRefreshLocation={refreshWithLocation}
            />
          </div>
        </section>
      )}

      {match.goals?.length > 0 && (
        <section className="match-panel mt-6">
          <h2 className="match-panel-title mb-3">Fil du match</h2>
          <ul className="space-y-2">
            {match.goals.map((goal, index) => (
              <li key={`${goal.minute}-${goal.scorerName}-${index}`} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="w-10 font-bold text-ink-faint">{goal.minute}&apos;</span>
                <span className="font-semibold text-ink">⚽ {goal.scorerName}</span>
                <span className="text-ink-muted">({goal.teamName})</span>
                {goal.assistName && <span className="text-ink-faint">Passe : {goal.assistName}</span>}
                {goal.homeScore != null && (
                  <span className="ml-auto font-bold text-ink-muted">
                    {goal.homeScore} - {goal.awayScore}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6">
        <StatsCompare homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <LineupBlock team={match.homeTeam} flagCode={match.homeTeamFlagCode} />
        <LineupBlock team={match.awayTeam} flagCode={match.awayTeamFlagCode} align="right" />
      </div>

      {match.substitutions?.length > 0 && (
        <section className="match-panel mt-6">
          <h2 className="match-panel-title mb-3">Remplacements</h2>
          <ul className="space-y-2 text-sm">
            {match.substitutions.map((sub, index) => (
              <li key={`${sub.minute}-${sub.playerIn}-${index}`}>
                <span className="font-bold text-ink-faint">{sub.minute}&apos;</span>{' '}
                <span className="text-red-600">{sub.playerOut}</span>
                <span className="text-ink-faint"> → </span>
                <span className="text-primary-700">{sub.playerIn}</span>
                <span className="text-ink-faint"> ({sub.teamName})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {match.bookings?.length > 0 && (
        <section className="match-panel mt-6">
          <h2 className="match-panel-title mb-3">Cartons</h2>
          <ul className="space-y-2 text-sm">
            {match.bookings.map((card, index) => (
              <li key={`${card.minute}-${card.playerName}-${index}`}>
                <span className="font-bold text-ink-faint">{card.minute}&apos;</span>{' '}
                <span className={card.card === 'RED' ? 'text-red-700' : 'text-accent-600'}>
                  {card.card === 'RED' ? '🟥' : '🟨'}
                </span>{' '}
                {card.playerName} <span className="text-ink-faint">({card.teamName})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <StickyReserveBar match={match} />
    </div>
  );
}