import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { Button, HubLogo } from "../components/ui";

const marketingLinks = [
  ["About", "/#about"],
  ["Product", "/#product-overview"],
  ["Services", "/#what-we-provide"],
  ["Pricing", "/pricing"],
  ["Resources", "/#resources"],
];

export function MarketingLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="precision-surface min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--surface-border)] bg-[var(--surface-base)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="thehotspot.in home" onClick={() => setMobileMenuOpen(false)}>
            <HubLogo />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {marketingLinks.map(([label, to]) => (
              <Link key={label} to={to} className="marketing-nav-link">{label}</Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <Link to="/login" className="hidden text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] sm:block">Sign in</Link>
            <Link to="/signup">
              <Button className="h-10 px-3 text-sm sm:px-4">Get Started</Button>
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--surface-border)] bg-white text-[var(--text-primary)] transition hover:border-[var(--teal)] hover:bg-[var(--teal-pale)]/40 md:hidden"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-marketing-menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div
          id="mobile-marketing-menu"
          className={`border-t border-[var(--surface-border)] bg-[var(--surface-card)] px-4 py-4 shadow-[0_18px_40px_rgba(15,118,110,0.08)] md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
        >
          <nav className="mx-auto grid max-w-7xl gap-1 text-sm font-semibold">
            {marketingLinks.map(([label, to]) => (
              <Link
                key={label}
                to={to}
                className="rounded-md px-3 py-3 text-[var(--text-primary)] transition hover:bg-[var(--teal-pale)]/55"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/login"
              className="rounded-md px-3 py-3 text-[var(--text-secondary)] transition hover:bg-[var(--teal-pale)]/55 hover:text-[var(--text-primary)] sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
