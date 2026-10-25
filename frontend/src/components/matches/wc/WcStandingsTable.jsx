import { flagUrl } from '../../../utils/teamFlags';

export default function WcStandingsTable({ rows, compact = false }) {
  if (!rows?.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="wc-standings-table">
        <thead className="bg-surface-muted">
          <tr>
            <th>#</th>
            <th>Équipe</th>
            <th>J</th>
            {!compact && (
              <>
                <th>G</th>
                <th>N</th>
                <th>P</th>
                <th>BP</th>
                <th>BC</th>
                <th>+/-</th>
              </>
            )}
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.position}-${row.teamName}`}>
              <td className="font-bold text-ink">{row.position}</td>
              <td>
                <div className="flex items-center gap-2">
                  {row.teamCrest ? (
                    <img src={row.teamCrest} alt="" className="h-5 w-5 object-contain" loading="lazy" />
                  ) : row.teamFlagCode ? (
                    <img src={flagUrl(row.teamFlagCode, 'w40')} alt="" className="h-4 w-6 rounded-sm object-cover" loading="lazy" />
                  ) : null}
                  <span className="font-semibold text-ink">{row.teamName}</span>
                </div>
              </td>
              <td className="text-ink-muted">{row.played}</td>
              {!compact && (
                <>
                  <td className="text-ink-muted">{row.won}</td>
                  <td className="text-ink-muted">{row.draw}</td>
                  <td className="text-ink-muted">{row.lost}</td>
                  <td className="text-ink-muted">{row.goalsFor}</td>
                  <td className="text-ink-muted">{row.goalsAgainst}</td>
                  <td className={`font-semibold ${row.goalDifference > 0 ? 'text-primary-700' : row.goalDifference < 0 ? 'text-red-600' : 'text-ink-muted'}`}>
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                </>
              )}
              <td className="font-bold text-ink">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}