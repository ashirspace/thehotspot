const Bars = ({ values = [38, 46, 64, 58, 76, 88] }) => (
  <div className="lp-mini-bars" aria-hidden="true">
    {values.map((value, index) => (
      <span key={index} style={{ height: `${value}%` }} />
    ))}
  </div>
);

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2.5 7.4 5.6 10.5 11.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SERVICE_ROWS = [
  {
    title: "Lead Discovery & Enrichment",
    copy: "Find ideal prospects and enrich them with verified data and signals.",
    detail: "Prospects",
    items: ["Maya Rao · Head of Growth", "Dev Kapoor · Growth Lead", "Sara Lin · Marketing Dir."],
  },
  {
    title: "AI Personalization",
    copy: "Write hyper-relevant outreach that reflects real context and intent.",
    detail: "Personalize with AI",
    items: ["Saw the product launch", "Matched to role priorities", "Clear reason to reply"],
  },
  {
    title: "Email Automation & Sequences",
    copy: "Multi-step sequences that adapt, follow up, and stop at the right time.",
    detail: "Sequence",
    items: ["Day 1 · Initial email", "Day 3 · Follow up", "Day 6 · Final follow up"],
  },
  {
    title: "Deliverability & Sending",
    copy: "Warmup, inbox placement insight, and sender reputation monitoring.",
    detail: "Score",
    items: ["Inbox placement", "Sender reputation", "Spam-rate checks"],
  },
  {
    title: "Analytics & Reporting",
    copy: "Track performance, reply quality, and pipeline impact in real time.",
    detail: "Performance",
    items: ["Reply rate", "Positive replies", "Opportunities"],
  },
];

const RESOURCES = [
  ["The 2026 cold email benchmark report", "125M+ emails, 41 industries, and what is working now.", "/cold-email-benchmark-report.html"],
  ["Frequently asked questions", "Everything teams usually ask before starting.", "/faq.html"],
  ["Glossary", "Plain-English definitions for outreach terms.", "/glossary.html"],
  ["Changelog", "Product updates, fixes, and roadmap notes.", "/changelog.html"],
];

function MiniPanel({ title, children }) {
  return (
    <div className="lp-mini-panel">
      <div className="lp-mini-panel-head">
        <span>{title}</span>
        <span className="lp-mini-dot" />
      </div>
      {children}
    </div>
  );
}

function AboutSection() {
  return (
    <section className="lp-unified-section lp-about-block" id="about">
      <div className="lp-container">
        <div className="lp-unified-head">
          <span className="lp-eyebrow">About thehotspot</span>
          <h2 className="lp-h2">We built thehotspot to make cold outreach human again.</h2>
          <p className="lp-lead">
            AI-powered outreach that helps teams start real conversations and build pipeline without sacrificing quality.
          </p>
        </div>

        <div className="lp-about-card">
          <article>
            <h3>Our story</h3>
            <p>
              After years of leading growth at SaaS companies, we saw the same problems repeat: generic outreach,
              low reply rates, and tools that added complexity instead of clarity.
            </p>
            <p>
              thehotspot was born from a simple idea: combine authentic personalization with intelligent automation
              to help teams connect at scale.
            </p>
            <div className="lp-founder-signature">
              <span>Ashir Ayaan</span>
              <small>Founder & CEO</small>
            </div>
          </article>

          <article className="lp-principles">
            <h3>Our operating principles</h3>
            {[
              ["People first", "We promote conversations that create real value."],
              ["Simplicity wins", "Powerful automation that is easy to adopt and love."],
              ["Data with respect", "We protect user data and respect your privacy."],
              ["Continuous innovation", "We ship useful improvements without adding clutter."],
            ].map(([title, copy]) => (
              <div className="lp-principle-row" key={title}>
                <span><Check /></span>
                <div>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </div>
              </div>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}

function ProductOverviewSection() {
  return (
    <section className="lp-unified-section" id="product-overview">
      <span id="features" className="lp-anchor-alias" aria-hidden="true" />
      <div className="lp-container">
        <div className="lp-unified-head">
          <span className="lp-eyebrow">Product overview</span>
          <h2 className="lp-h2">Everything you need to run high-performing outreach.</h2>
          <p className="lp-lead">
            AI personalization, smart automation, and actionable insights in one compact platform.
          </p>
        </div>

        <div className="lp-product-grid">
          <article className="lp-product-card lp-product-card-large">
            <div>
              <h3>AI personalization</h3>
              <p>Write highly relevant emails in seconds using signals that matter.</p>
              <a href="#what-we-provide">Learn more</a>
            </div>
            <MiniPanel title="Personalize with AI">
              <div className="lp-message-card">Write a value prop for Acme Corp about improving onboarding.</div>
              <div className="lp-message-card is-muted">Hi Alex, I noticed Acme is scaling fast...</div>
              <button className="lp-mini-button" type="button">Generate</button>
            </MiniPanel>
          </article>

          <article className="lp-product-card">
            <div>
              <h3>Campaign performance</h3>
              <p>See sends, replies, positive replies, and opportunities at a glance.</p>
            </div>
            <Bars values={[36, 48, 42, 64, 58, 76, 84]} />
          </article>

          <article className="lp-product-card">
            <div>
              <h3>Actionable insights</h3>
              <p>Know what is working, what is not, and where to focus next.</p>
              <a href="#resources">Learn more</a>
            </div>
          </article>

          <article className="lp-product-card lp-product-card-large">
            <div>
              <h3>Intelligent sequences</h3>
              <p>Multi-step sequences that adapt, follow up, and stop at the right time.</p>
              <a href="#what-we-provide">Learn more</a>
            </div>
            <MiniPanel title="Sequence">
              {["Day 1 · Initial email", "Day 3 · Follow up", "Day 6 · Final follow up"].map((item, index) => (
                <div className="lp-sequence-row" key={item}>
                  <span>{item}</span>
                  <em>{index === 0 ? "Sent" : index === 1 ? "Opened" : "Replied"}</em>
                </div>
              ))}
            </MiniPanel>
          </article>
        </div>
      </div>
    </section>
  );
}

function WhatWeProvideSection() {
  return (
    <section className="lp-unified-section" id="what-we-provide">
      <div className="lp-container">
        <div className="lp-unified-head">
          <span className="lp-eyebrow">What we provide</span>
          <h2 className="lp-h2">Tools and services to help you start more conversations.</h2>
          <p className="lp-lead">
            Everything you need to find leads, write better emails, and close more deals.
          </p>
        </div>

        <div className="lp-services-list">
          {SERVICE_ROWS.map((service, index) => (
            <article className="lp-service-card" key={service.title}>
              <div>
                <span className="lp-service-index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </div>
              <MiniPanel title={service.detail}>
                {service.items.map((item) => (
                  <div className="lp-service-mini-row" key={item}>
                    <span />
                    <p>{item}</p>
                  </div>
                ))}
              </MiniPanel>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ResourcesSection() {
  return (
    <section className="lp-unified-section lp-resources-block" id="resources">
      <div className="lp-container">
        <div className="lp-unified-head">
          <span className="lp-eyebrow">Resources</span>
          <h2 className="lp-h2">Ideas, playbooks and updates for better outreach.</h2>
          <p className="lp-lead">
            Practical guides, product updates, and operator insights to help you write better emails and get more replies.
          </p>
        </div>

        <div className="lp-resource-grid">
          <article className="lp-resource-feature">
            <span className="lp-eyebrow">Featured report</span>
            <h3>The 2026 cold email benchmark report</h3>
            <p>We analyzed 125M+ emails to uncover what is getting more replies, less wasted volume, and cleaner pipeline.</p>
            <div className="lp-resource-meta">
              <span>May 14, 2026</span>
              <span>12 min read</span>
            </div>
            <a className="lp-btn lp-btn-outline" href="/cold-email-benchmark-report.html">Read report</a>
          </article>

          <div className="lp-resource-list">
            {RESOURCES.map(([title, copy, href]) => (
              <a className="lp-resource-row" href={href} key={title}>
                <span>
                  <strong>{title}</strong>
                  <small>{copy}</small>
                </span>
                <em>→</em>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingConsolidatedSections() {
  return (
    <>
      <AboutSection />
      <ProductOverviewSection />
      <WhatWeProvideSection />
    </>
  );
}
