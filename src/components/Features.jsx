import { useEffect, useRef, useState } from "react";
import { useLandingContent } from "../hooks/useLandingContent.js";

function TypingVisual() {
  return (
    <div className="lp-bento-typing">
      <div className="lp-bento-typing-meta">Draft · personalized</div>
      <div className="lp-bento-typing-line">
        Hi Maya — saw Razorpay just shipped UPI on credit...
      </div>
    </div>
  );
}

function InboxVisual() {
  const rows = [
    { name: "Maya R.", tag: "Replied" },
    { name: "Dev K.", tag: "Opened" },
    { name: "Sara L.", tag: "Replied" },
    { name: "Arjun M.", tag: "Opened" },
    { name: "Nina P.", tag: "Replied" },
  ];
  return (
    <div className="lp-bento-inbox">
      {rows.map((r) => (
        <div className="lp-bento-inbox-row" key={r.name}>
          <span className="lp-bento-inbox-dot" aria-hidden="true" />
          <span className="lp-bento-inbox-name">{r.name}</span>
          <span className="lp-bento-inbox-tag">{r.tag}</span>
        </div>
      ))}
    </div>
  );
}

function ChipsVisual() {
  const chips = [
    ["SaaS", false], ["Fintech", true], ["Agency", false],
    ["Founder", true], ["SDR", false], ["Series A", false],
  ];
  return (
    <div className="lp-chips">
      {chips.map(([label, teal]) => (
        <span
          key={label}
          className={`lp-chip${teal ? " lp-chip-teal" : ""}`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function CounterVisual() {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const target = 847;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / 1400, 1);
          setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div className="lp-counter">{val.toLocaleString()}</div>
      <div className="lp-counter-tick">&uarr; emails sent today</div>
    </div>
  );
}

function KanbanVisual() {
  const cols = [
    { head: "Queued", cards: ["Cohort A", "Cohort B"] },
    { head: "Sent", cards: ["Fintech Q2"] },
    { head: "Replied", cards: ["Agencies", "Founders"] },
  ];
  return (
    <div className="lp-kanban">
      {cols.map((c) => (
        <div className="lp-kanban-col" key={c.head}>
          <div className="lp-kanban-head">{c.head}</div>
          {c.cards.map((card) => (
            <div className="lp-kanban-card" key={card}>{card}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ScheduleVisual() {
  const active = new Set([1, 2, 3, 8, 9, 10, 15, 16, 17, 22, 23, 24]);
  const mid = new Set([4, 11, 18, 25]);
  return (
    <div className="lp-schedule">
      {Array.from({ length: 28 }, (_, i) => (
        <div
          key={i}
          className={
            "lp-schedule-cell" +
            (active.has(i) ? " is-active" : mid.has(i) ? " is-mid" : "")
          }
        />
      ))}
    </div>
  );
}


function BentoCard({ card }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={`lp-bento-card lp-reveal ${card.cls}${shown ? " in-view" : ""}`}
    >
      <span className="lp-bento-num">{card.num}</span>
      <div className="lp-bento-visual">{card.visual}</div>
      <div className="lp-bento-body">
        <h3 className="lp-h3">{card.title}</h3>
        <p className="lp-bento-desc">{card.desc}</p>
      </div>
    </article>
  );
}

export default function Features() {
  const lc = useLandingContent();

  const CARDS = [
    { num: "01", cls: "lp-bento-card-wide", visual: <TypingVisual />, title: lc.feature_01_title, desc: lc.feature_01_desc },
    { num: "02", cls: "lp-bento-card-tall", visual: <InboxVisual />,  title: lc.feature_02_title, desc: lc.feature_02_desc },
    { num: "03", cls: "",                   visual: <ChipsVisual />,  title: lc.feature_03_title, desc: lc.feature_03_desc },
    { num: "04", cls: "",                   visual: <CounterVisual />,title: lc.feature_04_title, desc: lc.feature_04_desc },
    { num: "05", cls: "lp-bento-card-full", visual: <KanbanVisual />, title: lc.feature_05_title, desc: lc.feature_05_desc },
    { num: "06", cls: "",                   visual: <ScheduleVisual />,title: lc.feature_06_title, desc: lc.feature_06_desc },
  ];

  return (
    <section className="lp-features" id="features">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-eyebrow">{lc.features_eyebrow}</span>
          <h2 className="lp-h2">{lc.features_headline}</h2>
          <p className="lp-lead" style={{ maxWidth: 560 }}>{lc.features_subheadline}</p>
        </div>

        <div className="lp-bento">
          {CARDS.map((c) => (
            <BentoCard key={c.num} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
