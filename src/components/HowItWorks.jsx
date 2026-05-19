import { useRef, useState, useEffect } from "react";

const STEPS = [
  {
    num: "01",
    label: "Step 1",
    title: "Import your contacts",
    desc: "Upload a CSV or let our Lead Finder AI discover qualified prospects in your target industry. Every contact is instantly ready for outreach.",
  },
  {
    num: "02",
    label: "Step 2",
    title: "AI writes every email",
    desc: "Our Email Writer Agent crafts a unique, personalized cold email for each contact — referencing their company, role, and context. No templates.",
  },
  {
    num: "03",
    label: "Step 3",
    title: "Launch and watch replies come in",
    desc: "Hit send. thehotspot delivers from your Gmail, tracks opens, and automatically fires follow-ups for contacts who haven't responded.",
  },
];

export default function HowItWorks() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const idx = Math.round(track.scrollLeft / (track.clientWidth * 0.6));
      setActive(Math.min(idx, STEPS.length - 1));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: track.clientWidth * 0.6 * i, behavior: "smooth" });
  };

  return (
    <section className="hiw-section" id="how-it-works">
      <div className="hiw-section__head">
        <p className="lp-eyebrow" style={{ marginBottom: 12 }}>How it works</p>
        <h2 className="lp-h2">Up and running in three steps.</h2>
      </div>

      <div className="hiw-track" ref={trackRef}>
        {STEPS.map((step) => (
          <div key={step.num} className="hiw-card">
            <div>
              <div className="hiw-card__step-label">{step.label}</div>
              <h3 className="hiw-card__title">{step.title}</h3>
              <p className="hiw-card__desc">{step.desc}</p>
            </div>
            <div className="hiw-card__num" aria-hidden="true">{step.num}</div>
          </div>
        ))}
      </div>

      <div className="hiw-dots">
        {STEPS.map((_, i) => (
          <button
            key={i}
            className={`hiw-dot${active === i ? " active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
