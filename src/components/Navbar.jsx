import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Features",    href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing",     href: "#pricing" },
  { label: "FAQ",         href: "#faq" },
];

export default function Navbar({ onSignIn, onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = document.querySelector(".lp-scroll");
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 8);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
        <a className="lp-nav__brand" href="/">
          <span className="lp-nav__brand-dot" />
          thehotspot
        </a>

        <ul className="lp-nav__links">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a className="lp-nav__link" href={href}>{label}</a>
            </li>
          ))}
        </ul>

        <div className="lp-nav__actions">
          <button className="lp-nav__signin" onClick={onSignIn}>Sign in</button>
          <button className="btn btn-primary" onClick={onGetStarted}>Get Started</button>
          <button
            className="lp-nav__hbg"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {open && (
        <>
          <div className="lp-nav__drawer-overlay" onClick={() => setOpen(false)} />
          <div className={`lp-nav__drawer${open ? " open" : ""}`}>
            <button
              className="lp-nav__drawer-close"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >×</button>
            <div style={{ marginTop: 40 }}>
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  className="lp-nav__drawer-link"
                  href={href}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              ))}
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  className="btn btn-outline"
                  style={{ width: "100%" }}
                  onClick={() => { setOpen(false); onSignIn(); }}
                >Sign in</button>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => { setOpen(false); onGetStarted(); }}
                >Get Started</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
