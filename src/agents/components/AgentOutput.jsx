export function TextOutput({ text, label = "Result" }) {
  if (!text) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <div className="bg-card border border-line rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {text}
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(text)}
        className="self-start text-xs text-muted hover:text-accent transition-colors"
      >
        Copy to clipboard
      </button>
    </div>
  );
}

export function TableOutput({ rows = [], columns = [], label = "Results" }) {
  if (!rows.length) return null;
  const cols = columns.length ? columns : Object.keys(rows[0] || {});
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label} ({rows.length})</p>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-card">
              {cols.map(c => (
                <th key={c} className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-line last:border-0 hover:bg-card/60 transition-colors">
                {cols.map(c => (
                  <td key={c} className="px-3 py-2.5 text-foreground">
                    {row[c] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ScoreOutput({ score, label, reasoning }) {
  if (score == null) return null;
  const pct = Math.min(Math.max(score / 10, 0), 1);
  const color = score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col gap-3 bg-card border border-line rounded-lg p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{label || "Score"}</p>
        <span className="text-2xl font-bold" style={{ color }}>{score}/10</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, background: color }} />
      </div>
      {reasoning && <p className="text-sm text-muted leading-relaxed">{reasoning}</p>}
    </div>
  );
}
