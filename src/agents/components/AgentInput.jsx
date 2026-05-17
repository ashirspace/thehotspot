export function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder = "", disabled = false }) {
  return (
    <input
      className="bg-card border border-line rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent disabled:opacity-50"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

export function TextArea({ value, onChange, placeholder = "", rows = 4, disabled = false }) {
  return (
    <textarea
      className="bg-card border border-line rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent disabled:opacity-50 resize-none"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
    />
  );
}

export function Select({ value, onChange, options = [], disabled = false }) {
  return (
    <select
      className="bg-card border border-line rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent disabled:opacity-50"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function RunButton({ onClick, loading, label = "Run Agent" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 bg-accent hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Running...
        </>
      ) : label}
    </button>
  );
}
