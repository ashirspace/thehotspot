export default function CTA({ onGetStarted }) {
  return (
    <section className="cta-section">
      <div className="cta-section__inner">
        <h2 className="cta-section__h2">
          Stop sending emails into the void.
        </h2>
        <p className="cta-section__sub">
          Join 500+ teams using AI to fill their pipeline on autopilot.
          First 14 days are on us.
        </p>
        <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
          Start free trial
        </button>
        <p className="cta-section__fine-print">
          No credit card · Cancel anytime · 14-day trial
        </p>
      </div>
    </section>
  );
}
