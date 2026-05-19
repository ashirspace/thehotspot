const REPLIES = [
  { name: "Priya S.", text: "Thanks — when can we hop on a call?" },
  { name: "David K.", text: "This is exactly what we needed." },
  { name: "Meera R.", text: "Interested. Send me the deck." },
];

const BARS = [35, 55, 42, 68, 80, 95];

export default function Hero({ onGetStarted, onSignIn }) {
  return (
    <section className="hero">
      <div className="hero__dot-grid" aria-hidden="true" />

      <div className="hero__inner">
        {/* Left — text */}
        <div className="hero__text">
          <span className="hero__eyebrow">Outreach Automation · Built for 2026</span>

          <h1 className="hero__h1">
            Cold outreach that<br />
            <em>actually</em>{" "}
            <span className="highlight">gets replies</span>.
          </h1>

          <p className="hero__sub">
            Automated email campaigns powered by AI personalization.
            Send 1,000 cold emails a day that read like you wrote each
            one by hand.
          </p>

          <p className="hero__social-proof">
            <strong>Trusted by 500+ teams</strong> · 4.9 ★ on Product Hunt
          </p>

          <div className="hero__actions">
            <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
              Start free trial
            </button>
            <button className="btn btn-ghost btn-lg" onClick={onSignIn}>
              Watch 2-min demo →
            </button>
          </div>

          <p className="hero__fine-print">
            No credit card · 14-day trial · Setup in 3 min
          </p>
        </div>

        {/* Right — browser mockup */}
        <div className="hero__mockup">
          <div className="browser">
            <div className="browser__bar">
              <div className="browser__dots">
                <div className="browser__dot browser__dot--red" />
                <div className="browser__dot browser__dot--yel" />
                <div className="browser__dot browser__dot--grn" />
              </div>
              <div className="browser__url">thehotspot.in/app</div>
            </div>

            <div className="dash-mock">
              <div className="dash-mock__stats">
                <div className="dash-mock__stat">
                  <div className="dash-mock__stat-val">12</div>
                  <div className="dash-mock__stat-lbl">Campaigns</div>
                </div>
                <div className="dash-mock__stat">
                  <div className="dash-mock__stat-val">847</div>
                  <div className="dash-mock__stat-lbl">Sent today</div>
                </div>
                <div className="dash-mock__stat">
                  <div className="dash-mock__stat-val" style={{ color: "var(--teal)" }}>38%</div>
                  <div className="dash-mock__stat-lbl">Reply rate</div>
                </div>
              </div>

              <div className="dash-mock__bar-chart">
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    className="dash-mock__bar"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className="dash-mock__replies">
                {REPLIES.map((r, i) => (
                  <div key={i} className="dash-mock__reply">
                    <div className="dash-mock__reply-dot" />
                    <span className="dash-mock__reply-name">{r.name}</span>
                    <span style={{ color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="browser__live-badge">
            <div className="browser__live-dot" />
            Live
          </div>
        </div>
      </div>
    </section>
  );
}
