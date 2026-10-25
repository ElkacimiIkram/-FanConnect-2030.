export default function WcDashboardHeader({ feed }) {
  const liveCount = feed?.liveMatchCount ?? 0;
  const scheduledCount = feed?.scheduledMatchCount ?? 0;
  const finishedCount = feed?.finishedMatchCount ?? 0;

  return (
    <header className="wc-hero">
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="badge-gold border-white/20 bg-white/10 text-white">FIFA World Cup</span>
            <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-5xl">
              Match Center
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary-100 sm:text-base">
              Tableau de bord premium pour les fans — scores en direct, classements, équipes
              et réservation dans les cafés partenaires.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {liveCount > 0 && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-2 text-center backdrop-blur-sm">
                <p className="font-display text-2xl font-black text-white">{liveCount}</p>
                <p className="text-[10px] font-bold uppercase text-red-100">En direct</p>
              </div>
            )}
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
              <p className="font-display text-2xl font-black text-white">{scheduledCount}</p>
              <p className="text-[10px] font-bold uppercase text-primary-100">À venir</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
              <p className="font-display text-2xl font-black text-white">{finishedCount}</p>
              <p className="text-[10px] font-bold uppercase text-primary-100">Terminés</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}