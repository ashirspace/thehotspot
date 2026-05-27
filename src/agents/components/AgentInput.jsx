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
      className="bg-surface border border-line rounded-[8px] px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(204,251,241,0.9)] disabled:opacity-50 font-sans"
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
      className="bg-surface border border-line rounded-[8px] px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(204,251,241,0.9)] disabled:opacity-50 resize-none font-sans"
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
      className="bg-surface border border-line rounded-[8px] px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(204,251,241,0.9)] disabled:opacity-50 font-sans"
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
      className="flex items-center gap-2 bg-accent hover:bg-[#0f766e] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-[8px] transition-colors shadow-[0_8px_18px_rgba(13,148,136,0.16)]"
      style={{ border: "none" }}
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
