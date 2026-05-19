const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2V9zM4 6a2 2 0 100-4 2 2 0 000 4z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const PRODUCT_LINKS = ["Features", "Pricing", "Changelog", "Roadmap"];
const COMPANY_LINKS = ["About", "Blog", "Careers", "Contact"];
const LEGAL_LINKS   = ["Privacy", "Terms", "Security", "GDPR"];

export default function Footer({ onGetStarted }) {
  return (
    <footer className="lp-footer">
      {/* Top CTA row */}
      <div className="lp-footer__top">
        <div className="lp-footer__cta-head">
          Ready to grow connections?
        </div>
        <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
          Start free trial →
        </button>
      </div>

      {/* Mid — columns */}
      <div className="lp-footer__mid">
        <div>
          <div className="lp-footer__brand-name">thehotspot</div>
          <p className="lp-footer__tagline">
            Grow Connections Easily. AI-powered cold outreach that gets real replies.
            By Ibra Digitals Branding Services LLC.
          </p>
        </div>

        <div>
          <div className="lp-footer__col-title">Product</div>
          <ul className="lp-footer__links">
            {PRODUCT_LINKS.map((l) => (
              <li key={l}><a className="lp-footer__link" href="#">{l}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <div className="lp-footer__col-title">Company</div>
          <ul className="lp-footer__links">
            {COMPANY_LINKS.map((l) => (
              <li key={l}><a className="lp-footer__link" href="#">{l}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <div className="lp-footer__col-title">Legal</div>
          <ul className="lp-footer__links">
            {LEGAL_LINKS.map((l) => (
              <li key={l}><a className="lp-footer__link" href="#">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="lp-footer__bottom">
        <span className="lp-footer__copy">
          © 2026 Ibra Digitals · All rights reserved
        </span>

        <span className="lp-footer__made">Made with care in India 🇮🇳</span>

        <div className="lp-footer__socials">
          <a className="lp-footer__social" href="#" aria-label="X / Twitter">
            <TwitterIcon />
          </a>
          <a className="lp-footer__social" href="#" aria-label="LinkedIn">
            <LinkedInIcon />
          </a>
          <a className="lp-footer__social" href="#" aria-label="GitHub">
            <GitHubIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
