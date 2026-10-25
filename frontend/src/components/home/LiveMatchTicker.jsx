import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchApi } from '../../api/matchApi';
import { getApiData, getApiError } from '../../utils/apiHelpers';
import { ROUTES } from '../../utils/constants';

function flattenLiveMatches(feed) {
  const groups = feed?.liveNowGroups?.length
    ? feed.liveNowGroups
    : feed?.groups || [];

  return groups.flatMap((group) =>
    (group.matches || []).filter((m) => m.status === 'LIVE')
  );
}

function matchHref(match) {
  if (match.externalId) return ROUTES.MATCH_LIVE_DETAIL(match.externalId);
  if (match.localId) return ROUTES.MATCH_DETAIL(match.localId);
  return ROUTES.MATCHES;
}

export default function LiveMatchTicker() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await matchApi.liveFeed({ status: 'LIVE', refresh: false });
      const feed = getApiData(response);
      const live = flattenLiveMatches(feed);
      setMatches(live.length > 0 ? live : flattenLiveMatches({ groups: feed?.groups }));
      setError('');
    } catch (err) {
      setError(getApiError(err));
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const tickerItems = useMemo(() => {
    if (matches.length === 0) return [];
    return [...matches, ...matches];
  }, [matches]);

  if (error || matches.length === 0) return null;

  return (
    <div className="fc-live-ticker" aria-label="Matchs en direct">
      <div className="fc-live-ticker__label">
        <span className="fc-live-ticker__dot" />
        LIVE
      </div>
      <div className="fc-live-ticker__track">
        <div
          className="fc-live-ticker__content"
          style={{ '--ticker-count': matches.length }}
        >
          {tickerItems.map((match, index) => (
            <Link
              key={`${match.externalId || match.localId}-${index}`}
              to={matchHref(match)}
              className="fc-live-ticker__item"
            >
              <span className="font-semibold text-white">
                {match.homeTeam} {match.homeScore ?? 0}-{match.awayScore ?? 0} {match.awayTeam}
              </span>
              {match.matchMinute != null && (
                <span className="ml-2 text-xs text-red-400">{match.matchMinute}&apos;</span>
              )}
              {match.competitionName && (
                <span className="ml-3 text-xs text-white/50">{match.competitionName}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}