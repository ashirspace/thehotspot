import { useEffect, useRef, useState } from "react";
import { useLandingContent } from "../hooks/useLandingContent.js";

function StatItem({ stat, label, run }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!run) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1600, 1);
      setVal(Math.round(stat.value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, stat.value]);

  return (
    <div>
      <div className="lp-stat-num">
        {stat.prefix}{val}{stat.suffix}
      </div>
      <div className="lp-stat-label">{label}</div>
    </div>
  );
}

export default function Stats() {
  const c = useLandingContent();
  const ref = useRef(null);
  const [run, setRun] = useState(false);
  const [liveStats, setLiveStats] = useState({ campaigns: null, companies: null });

  useEffect(() => {
    fetch("/api/db?entity=stats")
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        if (j) setLiveStats({ campaigns: j.campaigns, companies: j.companies });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setRun(true); io.disconnect(); }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const STAT_NUMS = [
    { value: liveStats.campaigns ?? 0, prefix: "", suffix: "+",    key: "stat_01" },
    { value: 98,                        prefix: "", suffix: "%",    key: "stat_02" },
    { value: liveStats.companies ?? 0,  prefix: "", suffix: "+",   key: "stat_03" },
    { value: 3,                         prefix: "", suffix: " min", key: "stat_04" },
  ];

  return (
    <section className="lp-stats" ref={ref}>
      <div className="lp-container">
        <div className="lp-stats-grid">
          {STAT_NUMS.map((s) => (
            <StatItem key={s.key} stat={s} label={c[`${s.key}_label`]} run={run} />
          ))}
        </div>
      </div>
    </section>
  );
}
