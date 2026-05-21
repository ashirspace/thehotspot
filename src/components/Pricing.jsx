import { useLandingContent } from "../hooks/useLandingContent.js";

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

const PLAN_META = [
  { key: "01", variant: "lp-btn-outline",  popular: false },
  { key: "02", variant: "lp-btn-primary",  popular: true  },
  { key: "03", variant: "lp-btn-outline",  popular: false },
];

export default function Pricing({ onGetStarted }) {
  const c = useLandingContent();

  const plans = PLAN_META.map(({ key, variant, popular }) => ({
    key,
    variant,
    popular,
    name:     c[`plan_${key}_name`],
    price:    Number(c[`plan_${key}_price`]) || 0,
    desc:     c[`plan_${key}_desc`],
    cta:      c[`plan_${key}_cta`],
    features: (c[`plan_${key}_features`] || "").split("\n").filter(Boolean),
  }));

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
          {plans.map((p) => (
            <article
              key={p.key}
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
                <span className="lp-price-amount-unit">/month</span>
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
