export default function CTA({ onGetStarted }) {
  return (
    <section className="lp-cta">
      <div className="lp-container">
        <div className="lp-cta-inner">
          <span className="lp-eyebrow">Get started</span>
          <h2 className="lp-cta-h2">Stop sending emails into the void.</h2>
          <p className="lp-cta-sub">
            Launch your first campaign today and watch the replies come in
            by the end of the week.
          </p>
          <button
            type="button"
            className="lp-btn lp-btn-primary"
            onClick={onGetStarted}
          >
            Start free trial
          </button>
          <p className="lp-hero-fineprint">
            No credit card · Cancel anytime · 14-day trial
          </p>
        </div>
      </div>
    </section>
  );
}
