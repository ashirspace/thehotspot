import { useEffect, useRef, useState } from "react";

const PIPELINE_COLS = [
  { label: "New", cards: ["Razorpay", "Swiggy"] },
  { label: "Emailed", cards: ["CRED", "Zoho", "Groww"] },
  { label: "Replied", cards: ["Freshworks"] },
  { label: "Closed", cards: ["Postman", "Clevertap"] },
];

const CAL_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);
const SCHEDULED = [3, 7, 10, 14, 17, 21, 24];

function useBentoReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, visible];
}

export default function Features() {
  const [gridRef, gridVisible] = useBentoReveal();

  const cardClass = (extra = "") =>
    `bento-card${gridVisible ? " in-view" : ""}${extra ? " " + extra : ""}`;

  return (
    <section className="features-section" id="features">
      <div className="features-section__inner">
        <div className="section-header">
          <p className="lp-eyebrow">Features</p>
          <h2 className="lp-h2">
            Everything you need to run<br />outreach that converts.
          </h2>
          <p className="lp-lead" style={{ marginTop: 14 }}>
            Six modules working in lockstep — from prospect discovery to reply tracking.
          </p>
        </div>

        <div className="bento" ref={gridRef}>
          {/* 01 — Wide: AI email typing */}
          <div className={cardClass("bento-card--wide")} style={{ transitionDelay: "0ms" }}>
            <div className="bento-card__num">01</div>
            <div className="bento-card__demo">
              <div className="demo-typing">
                <div className="demo-typing__label">AI composing email for Razorpay…</div>
                <div className="demo-typing__line" />
                <div className="demo-typing__line" />
                <div className="demo-typing__line" />
                <div className="demo-typing__line" />
                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                  <div className="demo-tag demo-tag--teal">Subject ready</div>
                  <div className="demo-tag demo-tag--slate">Personalized ×1</div>
                </div>
              </div>
            </div>
            <div>
              <div className="bento-card__title">AI Email Generation</div>
              <p className="bento-card__desc">
                Unique, personalized emails for every contact — written by AI, never copy-paste.
              </p>
            </div>
          </div>

          {/* 02 — Tall: inbox */}
          <div className={cardClass("bento-card--tall")} style={{ transitionDelay: "80ms" }}>
            <div className="bento-card__num">02</div>
            <div className="bento-card__demo">
              <div className="demo-inbox">
                {[
                  { name: "Priya S.", text: "Interested — let's connect", unread: true },
                  { name: "David K.", text: "Can you send pricing?", unread: false },
                  { name: "Meera R.", text: "Got your email, thanks", unread: false },
                  { name: "Arjun T.", text: "Yes, happy to chat", unread: false },
                  { name: "Sofia L.", text: "Send me the deck please", unread: false },
                ].map((item, i) => (
                  <div key={i} className="demo-inbox__item">
                    {item.unread && <div className="demo-inbox__dot" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: item.unread ? 600 : 400, fontSize: 12, marginBottom: 1 }}>{item.name}</div>
                      <div style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-faint)" }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bento-card__title">Reply Detection</div>
              <p className="bento-card__desc">
                Monitors Gmail threads and stops follow-ups the moment a prospect replies.
              </p>
            </div>
          </div>

          {/* 03 — Categories */}
          <div className={cardClass()} style={{ transitionDelay: "160ms" }}>
            <div className="bento-card__num">03</div>
            <div className="bento-card__demo">
              <div className="demo-tags">
                <span className="demo-tag demo-tag--teal">Network</span>
                <span className="demo-tag demo-tag--blue">SaaS</span>
                <span className="demo-tag demo-tag--amber">Agency</span>
                <span className="demo-tag demo-tag--slate">E-commerce</span>
                <span className="demo-tag demo-tag--teal">Fintech</span>
                <span className="demo-tag demo-tag--blue">B2B</span>
              </div>
            </div>
            <div>
              <div className="bento-card__title">Contact Segmentation</div>
              <p className="bento-card__desc">
                Organize contacts across categories for targeted campaign control.
              </p>
            </div>
          </div>

          {/* 04 — Live counter */}
          <div className={cardClass()} style={{ transitionDelay: "240ms" }}>
            <div className="bento-card__num">04</div>
            <div className="bento-card__demo">
              <div className="demo-counter">
                <div className="demo-counter__num">847</div>
                <div className="demo-counter__lbl">Emails sent today</div>
              </div>
            </div>
            <div>
              <div className="bento-card__title">Live Analytics</div>
              <p className="bento-card__desc">
                Real-time open and delivery tracking on every email you send.
              </p>
            </div>
          </div>

          {/* 05 — Wide: pipeline kanban */}
          <div className={cardClass("bento-card--wide")} style={{ transitionDelay: "320ms" }}>
            <div className="bento-card__num">05</div>
            <div className="bento-card__demo">
              <div className="demo-pipeline">
                {PIPELINE_COLS.map((col) => (
                  <div key={col.label} className="demo-pipeline__col">
                    <div className="demo-pipeline__col-label">{col.label}</div>
                    {col.cards.map((c) => (
                      <div key={c} className="demo-pipeline__card">{c}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bento-card__title">Pipeline View</div>
              <p className="bento-card__desc">
                See every prospect's status across your outreach funnel at a glance.
              </p>
            </div>
          </div>

          {/* 06 — Calendar */}
          <div className={cardClass()} style={{ transitionDelay: "400ms" }}>
            <div className="bento-card__num">06</div>
            <div className="bento-card__demo">
              <div className="demo-calendar">
                {CAL_DAYS.map((d) => (
                  <div
                    key={d}
                    className={`demo-calendar__day${d === 17 ? " demo-calendar__day--active" : SCHEDULED.includes(d) ? " demo-calendar__day--scheduled" : ""}`}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bento-card__title">Send Scheduling</div>
              <p className="bento-card__desc">
                Queue campaigns in advance with smart send-time optimization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
