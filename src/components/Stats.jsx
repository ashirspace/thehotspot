import { useEffect, useRef, useState } from "react";

const STATS = [
  { target: 500, suffix: "+", label: "Campaigns launched" },
  { target: 98,  suffix: "%", label: "Delivery rate" },
  { target: 40,  suffix: "+", label: "Industries served" },
  { target: 3,   suffix: " min", label: "Avg setup time" },
];

function useCounter(target, active) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!active) return;
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, target]);

  return count;
}

function StatItem({ stat, active }) {
  const count = useCounter(stat.target, active);
  return (
    <div className="stat-item">
      <div className="stat-item__num">
        {count}{stat.suffix}
      </div>
      <div className="stat-item__label">{stat.label}</div>
    </div>
  );
}

export default function Stats() {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); io.disconnect(); } },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="stats-section" ref={ref}>
      <div className="stats-section__inner">
        {STATS.map((stat) => (
          <StatItem key={stat.label} stat={stat} active={active} />
        ))}
      </div>
    </section>
  );
}
