export default function CmsField({
  id, label, hint, value, onChange,
  multiline = false, rows = 3,
  maxChars = 200, context = "", required = false,
}) {
  const pct = value.length / maxChars;
  const warnClass = pct >= 0.9 ? "cms-char-warn" : "cms-char-ok";

  return (
    <div className="cms-field">
      <div className="cms-field-header">
        <label htmlFor={id}>{label}</label>
        {required && <span className="cms-field-required">*</span>}
        {hint && <span className="cms-field-hint">{hint}</span>}
      </div>

      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={Math.floor(maxChars * 1.1)}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={Math.floor(maxChars * 1.1)}
        />
      )}

      <div className="cms-field-meta">
        <span className={warnClass}>{value.length}/{maxChars}</span>
        {context && <span>· shown on {context}</span>}
      </div>
    </div>
  );
}
