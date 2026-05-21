import { useLandingContent } from "../hooks/useLandingContent.js";

const STATS = [
  { num: "10+",   key: "stat_01" },
  { num: "98%",   key: "stat_02" },
  { num: "5+",    key: "stat_03" },
  { num: "3 min", key: "stat_04" },
];

export default function Stats() {
  const c = useLandingContent();

  return (
    <section className="lp-stats">
      <div className="lp-container">
        <div className="lp-stats-grid">
          {STATS.map((s) => (
            <div key={s.key}>
              <div className="lp-stat-num">{s.num}</div>
              <div className="lp-stat-label">{c[`${s.key}_label`]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
