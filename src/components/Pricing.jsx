const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="pricing-card__check">
    <path d="M2.5 7L5.5 10L11.5 4" stroke="#0d9488" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PLANS = [
  {
    name: "Starter",
    price: "0",
    desc: "For founders and solo SDRs just getting started with cold outreach.",
    features: [
      "500 contacts",
      "1 active campaign",
      "AI email generation",
      "Gmail integration",
      "Basic analytics",
    ],
    cta: "Start free",
    popular: false,
  },
  {
    name: "Growth",
    price: "49",
    desc: "For growing teams scaling outreach across multiple campaigns and markets.",
    features: [
      "5,000 contacts",
      "10 active campaigns",
      "AI personalization engine",
      "Follow-up sequences",
      "Reply detection",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    popular: true,
  },
  {
    name: "Scale",
    price: "149",
    desc: "For agencies and enterprise teams with high-volume outreach needs.",
    features: [
      "Unlimited contacts",
      "Unlimited campaigns",
      "All AI agents",
      "Custom send schedules",
      "Team collaboration",
      "API access",
      "Dedicated onboarding",
    ],
    cta: "Talk to sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-section__inner">
        <div className="pricing-section__header">
          <p className="lp-eyebrow" style={{ marginBottom: 12 }}>Pricing</p>
          <h2 className="lp-h2">Simple, honest pricing.</h2>
          <p className="lp-lead" style={{ marginTop: 14 }}>
            No hidden fees. No per-seat nonsense. Cancel anytime.
          </p>
        </div>

        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card${plan.popular ? " pricing-card--popular" : ""}`}
            >
              {plan.popular && <div className="pricing-card__tab" />}

              {plan.popular && (
                <div style={{ paddingTop: plan.popular ? 8 : 0 }}>
                  <span className="pricing-card__badge">Most Popular</span>
                </div>
              )}

              <div className="pricing-card__name">{plan.name}</div>

              <div className="pricing-card__price">
                <span className="pricing-card__currency">$</span>
                <span className="pricing-card__amount">{plan.price}</span>
                <span className="pricing-card__period">/mo</span>
              </div>

              <p className="pricing-card__desc">{plan.desc}</p>

              <ul className="pricing-card__features">
                {plan.features.map((f) => (
                  <li key={f} className="pricing-card__feature">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`btn btn-lg${plan.popular ? " btn-primary" : " btn-outline"}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
