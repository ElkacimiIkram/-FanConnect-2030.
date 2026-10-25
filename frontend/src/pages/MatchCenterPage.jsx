import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { matchApi } from '../api/matchApi';
import WcDashboardHeader from '../components/matches/wc/WcDashboardHeader';
import WcFeedToolbar, { todayIso } from '../components/matches/wc/WcFeedToolbar';
import WcGroupsTab from '../components/matches/wc/WcGroupsTab';
import WcMatchesTab from '../components/matches/wc/WcMatchesTab';
import WcScheduleTab, { toMonthKey } from '../components/matches/wc/WcScheduleTab';
import WcStandingsTab from '../components/matches/wc/WcStandingsTab';
import WcTabBar from '../components/matches/wc/WcTabBar';
import WcTeamsTab from '../components/matches/wc/WcTeamsTab';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { getApiData, getApiError } from '../utils/apiHelpers';

const TAB_IDS = ['matches', 'standings', 'groups', 'teams', 'schedule'];

export default function MatchCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    TAB_IDS.includes(tabFromUrl) ? tabFromUrl : 'matches'
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'matches' ? {} : { tab }, { replace: true });
  };

  useEffect(() => {
    if (tabFromUrl && TAB_IDS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  const [navigation, setNavigation] = useState([]);
  const [feed, setFeed] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [standings, setStandings] = useState(null);
  const [teams, setTeams] = useState([]);

  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [calendarMonth, setCalendarMonth] = useState(toMonthKey(todayIso()));
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(todayIso());
  const [activeNavId, setActiveNavId] = useState('all');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState('TIME');

  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [error, setError] = useState('');

  const loadFeed = useCallback(
    async ({ silent = false, forceRefresh = false } = {}) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError('');
      try {
        const response = await matchApi.liveFeed({
          date: selectedDate,
          nav: activeNavId,
          status,
          sort,
          refresh: forceRefresh,
        });
        setFeed(getApiData(response));
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedDate, activeNavId, status, sort]
  );

  const loadCalendar = useCallback(async () => {
    setCalendarLoading(true);
    try {
      const response = await matchApi.calendar({
        month: calendarMonth,
        nav: activeNavId,
        selectedDate: calendarSelectedDate,
      });
      setCalendar(getApiData(response));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setCalendarLoading(false);
    }
  }, [calendarMonth, activeNavId, calendarSelectedDate]);

  const loadStandings = useCallback(async () => {
    setStandingsLoading(true);
    try {
      const code = activeNavId === 'wc2030' ? 'WC2030' : 'WC';
      const response = await matchApi.standings(code);
      setStandings(getApiData(response));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setStandingsLoading(false);
    }
  }, [activeNavId]);

  const loadTeams = useCallback(async () => {
    setTeamsLoading(true);
    try {
      const response = await matchApi.teams(activeNavId);
      setTeams(getApiData(response) || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setTeamsLoading(false);
    }
  }, [activeNavId]);

  useEffect(() => {
    const loadNav = async () => {
      try {
        const response = await matchApi.navigation();
        setNavigation(getApiData(response) || []);
      } catch {
        setNavigation([]);
      }
    };
    loadNav();
  }, []);

  useEffect(() => {
    if (activeTab !== 'matches') return undefined;
    loadFeed();
    return undefined;
  }, [activeTab, loadFeed]);

  useEffect(() => {
    if (activeTab !== 'matches') return undefined;
    const intervalMs = (feed?.refreshIntervalSeconds ?? 60) * 1000;
    const interval = setInterval(() => loadFeed({ silent: true }), intervalMs);
    return () => clearInterval(interval);
  }, [activeTab, feed?.refreshIntervalSeconds, loadFeed]);

  useEffect(() => {
    if (activeTab === 'schedule') loadCalendar();
  }, [activeTab, loadCalendar]);

  useEffect(() => {
    if (activeTab === 'standings' || activeTab === 'groups') loadStandings();
  }, [activeTab, loadStandings]);

  useEffect(() => {
    if (activeTab === 'teams') loadTeams();
  }, [activeTab, loadTeams]);

  const handleCalendarDateSelect = (iso) => {
    setCalendarSelectedDate(iso);
    setSelectedDate(iso);
    setActiveTab('matches');
  };

  const handleSeedDemo = async () => {
    setSeedingDemo(true);
    setError('');
    try {
      await matchApi.seedDemo();
      setSelectedDate(todayIso());
      await loadFeed({ forceRefresh: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSeedingDemo(false);
    }
  };

  const navItems = navigation.flatMap((section) => section.items || []);

  return (
    <div className="wc-dashboard">
      <WcDashboardHeader feed={feed} />

      <WcTabBar
        activeTab={activeTab}
        onChange={handleTabChange}
        liveCount={feed?.liveMatchCount ?? 0}
      />

      {navItems.length > 0 && activeTab !== 'standings' && (
        <div className="border-b border-surface-border bg-surface-card">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-3 sm:px-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNavId(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  activeNavId === item.id
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'matches' && (
        <WcFeedToolbar
          feed={feed}
          selectedDate={selectedDate}
          status={status}
          sort={sort}
          onDateChange={setSelectedDate}
          onStatusChange={setStatus}
          onSortChange={setSort}
          onRefresh={() => loadFeed({ silent: true, forceRefresh: true })}
          onSeedDemo={handleSeedDemo}
          refreshing={refreshing}
          seedingDemo={seedingDemo}
        />
      )}

      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        {feed?.demoMode && activeTab === 'matches' && !loading && (
          <Alert variant="info" className="mb-4">
            Mode démonstration CDM 2026 / 2030 — matchs générés autour d&apos;aujourd&apos;hui
            pour la soutenance (en direct, à venir et terminés). Cliquez sur{' '}
            <strong>Actualiser</strong> pour recaler les horaires.
          </Alert>
        )}

        {!feed?.apiConfigured && !feed?.demoMode && activeTab === 'matches' && !loading && (
          <Alert variant="info" className="mb-4">
            Configurez <code className="text-xs font-bold">FOOTBALL_DATA_API_KEY</code> pour synchroniser
            la CDM 2026 en arrière-plan, ou chargez les matchs de démonstration ci-dessous.
          </Alert>
        )}

        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {(error || (!loading && feed && (feed.totalMatches ?? 0) === 0 && !(feed.liveNowGroups?.length) && !(feed.upcomingGroups?.length))) && activeTab === 'matches' && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-surface-border bg-surface-card p-4">
            <p className="text-sm text-ink-muted">
              Aucun match live pour cette date. Chargez le jeu de test CDM 2026 et 2030
              (scores en direct, réservations, classements).
            </p>
            <button
              type="button"
              onClick={handleSeedDemo}
              disabled={seedingDemo}
              className="btn-arena-outline py-2 text-xs"
            >
              {seedingDemo ? 'Chargement…' : 'Charger les matchs de démonstration'}
            </button>
          </div>
        )}

        {activeTab === 'matches' && (
          <>
            {loading && <Spinner label="Chargement des matchs..." />}
            {!loading && <WcMatchesTab feed={feed} />}
          </>
        )}

        {activeTab === 'standings' && (
          <WcStandingsTab standings={standings} loading={standingsLoading} />
        )}

        {activeTab === 'groups' && (
          <WcGroupsTab standings={standings} loading={standingsLoading} />
        )}

        {activeTab === 'teams' && (
          <WcTeamsTab teams={teams} loading={teamsLoading} />
        )}

        {activeTab === 'schedule' && (
          <WcScheduleTab
            calendar={calendar}
            monthKey={calendarMonth}
            selectedDate={calendarSelectedDate}
            onMonthChange={setCalendarMonth}
            onSelectDate={handleCalendarDateSelect}
            loading={calendarLoading}
          />
        )}
      </div>
    </div>
  );
}