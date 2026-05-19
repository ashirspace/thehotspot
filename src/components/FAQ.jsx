import { useState } from "react";

const FAQS = [
  {
    q: "Does it really send from my Gmail?",
    a: "Yes. thehotspot connects to your Gmail account via OAuth. Emails go out from your own address, so inbox placement is real and reply threads land back in your Gmail. No shared IP, no shared reputation.",
  },
  {
    q: "What happens when a prospect replies?",
    a: "Our Reply Detection agent monitors your Gmail in real time. The moment a reply comes in on any thread, the follow-up sequence for that contact is automatically stopped. You take over from there.",
  },
  {
    q: "How is this different from Mailshake or Lemlist?",
    a: "Those tools help you send sequences. thehotspot writes the emails too. Our AI personalizes every single message using the contact's company, role, and context — no manual copywriting required.",
  },
  {
    q: "Is there a sending limit?",
    a: "Gmail's API allows roughly 500 emails per day on a standard account. With G Suite or Google Workspace, this can be higher. We optimize send timing to keep you within safe limits automatically.",
  },
  {
    q: "Can I import my existing contacts?",
    a: "Yes. Upload any CSV with name, email, company, and optional fields. Our system normalizes and deduplicates the list before your first send.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(new Set());

  const toggle = (i) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <section className="faq-section" id="faq">
      <div className="faq-section__inner">
        <div className="faq-section__left">
          <p className="lp-eyebrow" style={{ marginBottom: 12 }}>FAQ</p>
          <h2 className="lp-h2">Questions we get a lot.</h2>
          <p className="faq-section__contact">
            Still curious?{" "}
            <a href="mailto:hello@thehotspot.in">Email us →</a>
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map((item, i) => (
            <div key={i} className={`faq-item${open.has(i) ? " open" : ""}`}>
              <button
                className="faq-item__trigger"
                onClick={() => toggle(i)}
                aria-expanded={open.has(i)}
              >
                <span className="faq-item__question">{item.q}</span>
                <span className="faq-item__icon" aria-hidden="true">+</span>
              </button>
              <div className="faq-item__answer">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
