import { useRef, useState, useEffect } from "react";

const STEPS = [
  {
    num: "01",
    title: "Import your list",
    desc: "Drop in a CSV or sync from your CRM. thehotspot enriches every contact with live company signals automatically.",
  },
  {
    num: "02",
    title: "Let AI write the first draft",
    desc: "Each email is generated from real context — recent news, role, industry. Edit a few, approve the rest in bulk.",
  },
  {
    num: "03",
    title: "Send, track, and reply",
    desc: "Campaigns send on a safe schedule. Opens and replies stream into one inbox so you only touch the warm ones.",
  },
];

export default function HowItWorks() {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="lp-how" id="how">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-eyebrow">How it works</span>
          <h2 className="lp-h2">From cold list to booked call.</h2>
          <p className="lp-lead">
            Three steps. No onboarding calls, no implementation team.
          </p>
        </div>
      </div>

      <div className="lp-container">
        <div className="lp-how-track-wrap">
          <div className="lp-how-track" ref={trackRef}>
            {STEPS.map((s) => (
              <article className="lp-how-card" key={s.num}>
                <span className="lp-how-num" aria-hidden="true">{s.num}</span>
                <h3 className="lp-how-title">{s.title}</h3>
                <p className="lp-how-desc">{s.desc}</p>
                <div className="lp-how-progress" aria-hidden="true">
                  <div
                    className="lp-how-progress-bar"
                    style={{ width: `${20 + progress * 80}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
