import { useState, useEffect } from "react";

const LINKS = [
  { label: "About", href: "/#about" },
  { label: "Product", href: "/#product-overview" },
  { label: "Services", href: "/#what-we-provide" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Resources", href: "/#resources" },
  { label: "LinkedIn DM", href: "/dashboard" },
];

function Wordmark() {
  return (
    <span className="lp-nav-logo">
      <img className="lp-nav-logo-mark" src="/logo.png" alt="" aria-hidden="true" />
      thehotspot
    </span>
  );
}

export default function Navbar({ onSignIn, onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const scroller = document.querySelector(".lp-page");
    if (!scroller) return;
    const onScroll = () => setScrolled(scroller.scrollTop > 8);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <nav className={`lp-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <a href="/" aria-label="thehotspot home">
            <Wordmark />
          </a>

          <div className="lp-nav-links">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} className="lp-nav-link">
                {l.label}
              </a>
            ))}
          </div>

          <div className="lp-nav-right">
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={onSignIn}
            >
              Sign in
            </button>
            <button
              type="button"
              className="lp-btn lp-btn-primary lp-btn-sm"
              onClick={onGetStarted}
            >
              Get Started
            </button>
            <button
              type="button"
              className="lp-nav-burger"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M3 6h16M3 11h16M3 16h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className={`lp-drawer${drawerOpen ? " is-open" : ""}`}>
        <div className="lp-drawer-scrim" onClick={closeDrawer} />
        <div className="lp-drawer-panel" role="dialog" aria-label="Menu">
          <div className="lp-drawer-head">
            <Wordmark />
            <button
              type="button"
              className="lp-announce-close"
              style={{ position: "static", transform: "none", color: "var(--text-soft)" }}
              aria-label="Close menu"
              onClick={closeDrawer}
            >
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="lp-drawer-links">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="lp-drawer-link"
                onClick={closeDrawer}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="lp-drawer-cta">
            <button
              type="button"
              className="lp-btn lp-btn-outline lp-btn-block"
              onClick={() => {
                closeDrawer();
                onSignIn?.();
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className="lp-btn lp-btn-primary lp-btn-block"
              onClick={() => {
                closeDrawer();
                onGetStarted?.();
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
