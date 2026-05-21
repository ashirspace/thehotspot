import { LuHammer } from "react-icons/lu";

// Shared "coming soon" page for not-yet-built console sections.
export default function StubPage({ eyebrow, title, desc }) {
  return (
    <div>
      <header className="dash-page-head">
        <span className="dash-eyebrow">{eyebrow}</span>
        <h1 className="dash-page-title">{title}</h1>
      </header>
      <div className="console-stub">
        <span className="console-stub-icon">
          <LuHammer size={20} strokeWidth={1.5} />
        </span>
        <h3>Under construction</h3>
        <p>{desc || "This page is queued for a future admin release."}</p>
      </div>
    </div>
  );
}
