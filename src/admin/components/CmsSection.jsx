export default function CmsSection({ number, title, desc, children }) {
  const num = String(number).padStart(2, "0");
  return (
    <section className="cms-section">
      <div className="cms-section-header">
        <span className="cms-section-number">{num}</span>
        <h3 className="cms-section-title">{title}</h3>
        {desc && <span className="cms-section-desc">{desc}</span>}
      </div>
      <div className="cms-section-fields">{children}</div>
    </section>
  );
}
