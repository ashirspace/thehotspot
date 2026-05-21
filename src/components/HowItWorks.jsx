const STEPS = [
  {
    num: "01",
    title: "Import your contacts",
    desc: "Upload a CSV of leads in seconds. Tag them by category, industry, or campaign — your list is ready to go immediately.",
  },
  {
    num: "02",
    title: "AI writes every email",
    desc: "thehotspot drafts a personalised email for each contact based on their role and company. Review, edit, or approve in bulk.",
  },
  {
    num: "03",
    title: "Send and watch replies come in",
    desc: "Campaigns go out on a safe schedule. Replies land in one place so you spend time on warm leads, not your inbox.",
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
