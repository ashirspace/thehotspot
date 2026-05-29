import { useLandingContent } from "../hooks/useLandingContent.js";

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M12.6 1.5h2.3l-5 5.7 5.9 7.8h-4.6L7.5 10 3.4 15h-2.3l5.4-6.1L0.8 1.5h4.7l3.3 4.3 3.8-4.3z"
      fill="currentColor"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3.4 5.5H1.1V14h2.3V5.5zM2.25 1.5A1.35 1.35 0 100 2.85 1.35 1.35 0 002.25 1.5zM14.9 9.3c0-2.4-1.3-3.5-3-3.5a2.6 2.6 0 00-2.35 1.3V5.5H7.25V14h2.3V9.5c0-1.2.23-2.35 1.7-2.35s1.45 1.36 1.45 2.43V14h2.2V9.3z"
      fill="currentColor"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 .5a7.5 7.5 0 00-2.37 14.62c.37.07.5-.16.5-.36v-1.3c-2.08.45-2.52-1-2.52-1-.34-.87-.83-1.1-.83-1.1-.68-.46.05-.45.05-.45.76.05 1.15.78 1.15.78.67 1.14 1.75.81 2.18.62.07-.48.26-.81.47-1-1.66-.19-3.4-.83-3.4-3.7 0-.82.29-1.49.78-2.01-.08-.19-.34-.96.07-2 0 0 .63-.2 2.07.77a7.2 7.2 0 013.78 0c1.44-.97 2.07-.77 2.07-.77.41 1.04.15 1.81.07 2 .49.52.78 1.19.78 2.01 0 2.88-1.75 3.51-3.42 3.7.27.23.5.68.5 1.37v2.03c0 .2.14.44.5.36A7.5 7.5 0 008 .5z"
      fill="currentColor"
    />
  </svg>
);

const COLUMNS = [
  {
    head: "Product",
    links: [
      { label: "Product Overview", href: "/#product-overview" },
      { label: "What We Provide", href: "/#what-we-provide" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "/changelog.html" },
      { label: "Roadmap", href: "/roadmap.html" },
    ],
  },
  {
    head: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Resources", href: "/#resources" },
      { label: "Careers", href: "/careers.html" },
      { label: "Contact", href: "/contact.html" },
    ],
  },
  {
    head: "Legal",
    links: [
      { label: "Privacy", href: "/privacy.html" },
      { label: "Terms", href: "/terms.html" },
      { label: "Security", href: "/security.html" },
      { label: "GDPR", href: "/gdpr.html" },
    ],
  },
];

export default function Footer({ onGetStarted }) {
  const c = useLandingContent();
  return (
    <footer className="lp-footer" id="changelog">
      <div className="lp-container">
        <div className="lp-footer-top">
          <h2 className="lp-footer-h">{c.footer_cta_heading}</h2>
          <button
            type="button"
            className="lp-btn lp-btn-primary"
            onClick={onGetStarted}
          >
            {c.footer_cta_btn}
          </button>
        </div>

        <div className="lp-footer-cols">
          <div className="lp-footer-brand">
            <span className="lp-footer-wordmark">
              <span className="lp-nav-logo-dot" aria-hidden="true" />
              thehotspot
            </span>
            <p className="lp-footer-tag">{c.footer_tagline}</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.head}>
              <div className="lp-footer-col-h">{col.head}</div>
              <div className="lp-footer-col-links">
                {col.links.map((link) => (
                  <a key={link.label} href={link.href}>{link.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lp-footer-bottom">
          <span>{c.footer_copyright}</span>
          <span className="lp-footer-credit">{c.footer_made_in}</span>
          <div className="lp-footer-socials">
            <a href="#top" aria-label="thehotspot on X"><TwitterIcon /></a>
            <a href="#top" aria-label="thehotspot on LinkedIn"><LinkedInIcon /></a>
            <a href="#top" aria-label="thehotspot on GitHub"><GitHubIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
