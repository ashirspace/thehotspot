const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 8.5l3.2 3.2L13 4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PLANS = [
  {
    name: "Starter",
    price: 0,
    unit: "/month",
    desc: "For founders sending their first campaigns.",
    cta: "Start free",
    variant: "lp-btn-outline",
    features: [
      "200 emails / month",
      "1 sending inbox",
      "AI draft generation",
      "Open & reply tracking",
    ],
  },
  {
    name: "Growth",
    price: 49,
    unit: "/month",
    desc: "For SDRs and small teams scaling outreach.",
    cta: "Start free trial",
    variant: "lp-btn-primary",
    popular: true,
    features: [
      "10,000 emails / month",
      "5 sending inboxes",
      "AI personalization from live signals",
      "Inbox warm-up & throttling",
      "Pipeline & campaign analytics",
    ],
  },
  {
    name: "Scale",
    price: 149,
    unit: "/month",
    desc: "For agencies running outreach at volume.",
    cta: "Talk to sales",
    variant: "lp-btn-outline",
    features: [
      "Unlimited emails",
      "Unlimited inboxes",
      "Dedicated deliverability manager",
      "Team workspaces & roles",
      "Priority support",
    ],
  },
];

export default function Pricing({ onGetStarted }) {
  return (
    <section className="lp-pricing" id="pricing">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-eyebrow">Pricing</span>
          <h2 className="lp-h2">Pay for replies, not seats.</h2>
          <p className="lp-lead">
            Every plan includes AI drafting and deliverability tooling.
            Upgrade when your volume does.
          </p>
        </div>

        <div className="lp-pricing-grid">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={`lp-price-card${p.popular ? " is-popular" : ""}`}
            >
              {p.popular && (
                <>
                  <span className="lp-price-card-band" aria-hidden="true" />
                  <span className="lp-price-badge">Most Popular</span>
                </>
              )}

              <span className="lp-eyebrow lp-price-name">{p.name}</span>

              <div className="lp-price-amount">
                <span className="lp-price-amount-num">${p.price}</span>
                <span className="lp-price-amount-unit">{p.unit}</span>
              </div>

              <p className="lp-price-desc">{p.desc}</p>

              <div className="lp-price-divider" />

              <ul className="lp-price-features">
                {p.features.map((f) => (
                  <li className="lp-price-feature" key={f}>
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`lp-btn ${p.variant} lp-btn-block`}
                onClick={onGetStarted}
              >
                {p.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
