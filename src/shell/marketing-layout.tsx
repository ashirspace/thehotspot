import { Link, Outlet } from "react-router-dom";
import { Button, HubLogo } from "../components/ui";

export function MarketingLayout() {
  return (
    <div className="precision-surface min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--surface-border)] bg-[var(--surface-base)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="thehotspot.in home">
            <HubLogo />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link to="/#about" className="marketing-nav-link">About</Link>
            <Link to="/#product-overview" className="marketing-nav-link">Product</Link>
            <Link to="/#what-we-provide" className="marketing-nav-link">Services</Link>
            <Link to="/pricing" className="marketing-nav-link">Pricing</Link>
            <Link to="/#resources" className="marketing-nav-link">Resources</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] sm:block">Sign in</Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
