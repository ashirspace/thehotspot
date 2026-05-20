import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 500, prefix: "", suffix: "+", label: "Campaigns launched" },
  { value: 98, prefix: "", suffix: "%", label: "Delivery rate" },
  { value: 40, prefix: "", suffix: "+", label: "Industries served" },
  { value: 3, prefix: "", suffix: " min", label: "Avg setup time" },
];

function StatItem({ stat, run }) {
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
      <div className="lp-stat-label">{stat.label}</div>
    </div>
  );
}

export default function Stats() {
  const ref = useRef(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="lp-stats" ref={ref}>
      <div className="lp-container">
        <div className="lp-stats-grid">
          {STATS.map((s) => (
            <StatItem key={s.label} stat={s} run={run} />
          ))}
        </div>
      </div>
    </section>
  );
}
