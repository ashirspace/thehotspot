import { useState } from "react";

const ITEMS = [
  {
    q: "Will my emails land in spam?",
    a: "Every sending inbox runs through automated warm-up and per-domain throttling. We keep volume inside safe limits and monitor reputation so your messages reach the primary inbox, not the spam folder.",
  },
  {
    q: "How is the AI personalization different from mail merge?",
    a: "Mail merge swaps in a first name. thehotspot reads live company signals — funding rounds, hiring, product launches — and writes a genuinely specific opening line for each contact. You review and approve in bulk.",
  },
  {
    q: "Can I use my own email address?",
    a: "Yes. Connect any Gmail or Outlook inbox. thehotspot sends through your real account, so replies thread normally and prospects see a familiar address.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. The 14-day trial needs no card. You only enter billing details if you decide to continue on a paid plan.",
  },
  {
    q: "What happens when someone replies?",
    a: "Replies are detected automatically, the contact is removed from any further sending, and the conversation surfaces in your unified inbox so you can take it from there.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(new Set([0]));

  const toggle = (i) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <section className="lp-faq" id="faq">
      <div className="lp-container">
        <div className="lp-faq-grid">
          <div className="lp-faq-aside">
            <span className="lp-eyebrow">FAQ</span>
            <h2 className="lp-h2">Questions, answered.</h2>
            <p className="lp-faq-mail">
              Still curious?{" "}
              <a href="mailto:hello@thehotspot.in">Email us</a> — we reply
              within a day.
            </p>
          </div>

          <div className="lp-faq-list">
            {ITEMS.map((item, i) => {
              const isOpen = open.has(i);
              return (
                <div
                  key={item.q}
                  className={`lp-faq-item${isOpen ? " is-open" : ""}`}
                >
                  <button
                    type="button"
                    className="lp-faq-trigger"
                    aria-expanded={isOpen}
                    onClick={() => toggle(i)}
                  >
                    {item.q}
                    <span className="lp-faq-icon" aria-hidden="true" />
                  </button>
                  <div className="lp-faq-panel">
                    <p className="lp-faq-panel-inner">{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
