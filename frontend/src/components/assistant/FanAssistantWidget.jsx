import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { assistantApi } from '../../api/assistantApi';
import { ROUTES } from '../../utils/constants';
import { getApiData, getApiError } from '../../utils/apiHelpers';
import { getOccupancyLabel, getOccupancyStyle } from '../../utils/occupancy';
import { requestUserLocation } from '../../utils/geolocation';

const WELCOME =
  "Salut ! Je suis **FanBot**. Pose-moi une question ou choisis une **question fréquente** ci-dessous.";

const FALLBACK_CHIPS = [
  'Café le plus proche',
  'Où regarder le match du Maroc ?',
  'Quels matchs sont en direct ?',
  'Cafés calmes à Casablanca',
];

function renderText(text) {
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function MatchCard({ match }) {
  if (!match?.id) return null;
  const live = match.status === 'LIVE';
  return (
    <Link
      to={ROUTES.MATCH_DETAIL(match.id)}
      className="block rounded-xl border border-surface-border bg-navy-800/80 p-3 transition hover:border-primary-500/40"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-ink">
          {match.homeTeam} vs {match.awayTeam}
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            live ? 'bg-red-500/20 text-red-300' : 'bg-primary-600/20 text-primary-300'
          }`}
        >
          {live ? `Live ${match.matchMinute || ''}'`.trim() : match.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        {[match.city, match.venueName].filter(Boolean).join(' · ')}
      </p>
    </Link>
  );
}

function VenueCard({ venue }) {
  if (!venue?.id) return null;
  return (
    <div className="rounded-xl border border-surface-border bg-navy-800/80 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ink">{venue.name}</p>
          <p className="text-xs text-ink-muted">{venue.city}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getOccupancyStyle(venue.occupancyLevel)}`}>
          {getOccupancyLabel(venue.occupancyLevel)}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-faint">
        {venue.distanceKm != null ? `${Math.round(venue.distanceKm)} km · ` : ''}
        {Math.round(venue.occupancyPct || 0)}% · {venue.availableSeats} places
      </p>
      <Link
        to={ROUTES.BOOK({ matchId: venue.matchId, businessId: venue.id })}
        className="mt-2 inline-flex rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-500"
      >
        Réserver
      </Link>
    </div>
  );
}

export default function FanAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chips, setChips] = useState(FALLBACK_CHIPS);
  const [messages, setMessages] = useState([
    { role: 'bot', reply: WELCOME, suggestions: FALLBACK_CHIPS },
  ]);
  const bottomRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    assistantApi
      .suggestions()
      .then((response) => {
        const data = getApiData(response);
        if (Array.isArray(data) && data.length) setChips(data);
      })
      .catch(() => {});
    requestUserLocation()
      .then((coords) => {
        locationRef.current = coords;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  const send = async (text) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', reply: message }]);
    setLoading(true);
    try {
      if (!locationRef.current && /proche|près|pres de moi/i.test(message)) {
        try {
          locationRef.current = await requestUserLocation();
        } catch {
          /* city in the message is enough */
        }
      }
      const response = await assistantApi.chat({
        message,
        latitude: locationRef.current?.lat,
        longitude: locationRef.current?.lng,
      });
      const data = getApiData(response);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          reply: data?.reply || 'Je n’ai pas pu répondre.',
          matches: data?.matches || [],
          venues: data?.venues || [],
          suggestions: data?.suggestions || chips,
          source: data?.source,
          intent: data?.intent,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', reply: getApiError(error), suggestions: chips },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fc-fanbot">
      {open && (
        <section className="fc-fanbot__panel" aria-label="Assistant FanBot">
          <header className="fc-fanbot__header">
            <div>
              <p className="font-display text-base font-bold text-ink">FanBot</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-300">
                Assistant CDM 2030
              </p>
            </div>
            <button type="button" className="fc-fanbot__close" onClick={() => setOpen(false)} aria-label="Fermer">
              ×
            </button>
          </header>

          <div className="fc-fanbot__messages">
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`fc-fanbot__bubble fc-fanbot__bubble--${msg.role}`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{renderText(msg.reply)}</p>
                {msg.matches?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.matches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                )}
                {msg.venues?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.venues.map((venue) => (
                      <VenueCard key={venue.id} venue={venue} />
                    ))}
                  </div>
                )}
                {(msg.source || msg.intent) && (
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-ink-faint">
                    {msg.source === 'GROK'
                      ? 'Grok · SpaceXAI'
                      : msg.source === 'TRAINED'
                        ? 'FAQ entraînée'
                        : 'Assistant local'}
                    {msg.intent ? ` · ${msg.intent}` : ''}
                  </p>
                )}
              </div>
            ))}
            {loading && (
              <div className="fc-fanbot__bubble fc-fanbot__bubble--bot">
                <p className="text-sm text-ink-muted">FanBot réfléchit…</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="fc-fanbot__chips">
            <p className="fc-fanbot__chips-label">Questions fréquentes</p>
            {(messages[messages.length - 1]?.suggestions || chips).slice(0, 8).map((chip) => (
              <button key={chip} type="button" className="fc-fanbot__chip" onClick={() => send(chip)}>
                {chip}
              </button>
            ))}
          </div>

          <form
            className="fc-fanbot__form"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ex. café proche à Oualidia…"
              maxLength={800}
              className="fc-fanbot__input"
            />
            <button type="submit" className="fc-fanbot__send" disabled={loading || !input.trim()}>
              Envoyer
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="fc-fanbot__launcher"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Fermer FanBot' : 'Ouvrir FanBot'}
      >
        {open ? '×' : 'AI'}
      </button>
    </div>
  );
}
