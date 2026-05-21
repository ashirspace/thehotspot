import { useLandingContent } from "../hooks/useLandingContent.js";

const STAT_KEYS = ["stat_01", "stat_02", "stat_03", "stat_04"];

export default function Stats() {
  const c = useLandingContent();

  return (
    <section className="lp-stats">
      <div className="lp-container">
        <div className="lp-stats-grid">
          {STAT_KEYS.map((key) => (
            <div key={key}>
              <div className="lp-stat-num">—</div>
              <div className="lp-stat-label">{c[`${key}_label`]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
