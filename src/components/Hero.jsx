const CHART = [38, 52, 44, 67, 58, 79, 71, 88, 94];

const REPLIES = [
  { initials: "MR", name: "Maya Rao", snippet: "Yes — let's set up a call this week.", time: "2m" },
  { initials: "DK", name: "Dev Kapoor", snippet: "Interested. What does pricing look like?", time: "14m" },
  { initials: "SL", name: "Sara Lin", snippet: "This is exactly what we needed. Thanks!", time: "1h" },
];

export default function Hero({ onGetStarted, onSignIn }) {
  return (
    <header className="lp-hero" id="top">
      <div className="lp-hero-grid" aria-hidden="true" />
      <div className="lp-hero-inner">
        <div className="lp-hero-copy">
          <span className="lp-eyebrow">Outreach Automation · Built for 2026</span>

          <h1 className="lp-hero-h1">
            Cold outreach that<br />
            <span className="lp-italic">actually</span>{" "}
            <span className="lp-highlight">gets replies</span>.
          </h1>

          <p className="lp-lead">
            Automated email campaigns powered by AI personalization. Send
            1,000 cold emails a day that read like you wrote each one by hand.
          </p>

          <div className="lp-hero-proof">
            <span>Trusted by 500+ teams</span>
            <span className="lp-hero-proof-sep" aria-hidden="true" />
            <span>4.9 &#9733; on Product Hunt</span>
          </div>

          <div className="lp-hero-ctas">
            <button
              type="button"
              className="lp-btn lp-btn-primary"
              onClick={onGetStarted}
            >
              Start free trial
            </button>
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={onSignIn}
            >
              Watch 2-min demo &rarr;
            </button>
          </div>

          <p className="lp-hero-fineprint">
            No credit card · 14-day trial · Setup in 3 min
          </p>
        </div>

        <div className="lp-mock">
          <div className="lp-mock-chrome">
            <div className="lp-mock-dots" aria-hidden="true">
              <span /><span /><span />
            </div>
            <div className="lp-mock-url">thehotspot.in/app</div>
          </div>

          <div className="lp-mock-live">
            <span className="lp-mock-live-dot" aria-hidden="true" />
            Live
          </div>

          <div className="lp-mock-body">
            <div className="lp-mock-stats">
              <div className="lp-mock-stat">
                <div className="lp-mock-stat-label">Campaigns</div>
                <div className="lp-mock-stat-val">12</div>
              </div>
              <div className="lp-mock-stat">
                <div className="lp-mock-stat-label">Sent today</div>
                <div className="lp-mock-stat-val">847</div>
              </div>
              <div className="lp-mock-stat">
                <div className="lp-mock-stat-label">Reply rate</div>
                <div className="lp-mock-stat-val"><em>38%</em></div>
              </div>
            </div>

            <div className="lp-mock-chart" aria-hidden="true">
              {CHART.map((h, i) => (
                <div
                  key={i}
                  className="lp-mock-bar"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div className="lp-mock-inbox">
              {REPLIES.map((r) => (
                <div className="lp-mock-row" key={r.initials}>
                  <span className="lp-mock-row-avatar">{r.initials}</span>
                  <span className="lp-mock-row-name">{r.name}</span>
                  <span className="lp-mock-row-snippet">{r.snippet}</span>
                  <span className="lp-mock-row-tag">Replied</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
