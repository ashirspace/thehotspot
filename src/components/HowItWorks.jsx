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

        <div className="lp-how-grid">
          {STEPS.map((s) => (
            <article className="lp-how-card" key={s.num}>
              <span className="lp-how-num" aria-hidden="true">{s.num}</span>
              <h3 className="lp-how-title">{s.title}</h3>
              <p className="lp-how-desc">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
