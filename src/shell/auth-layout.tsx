import { Link, Outlet } from "react-router-dom";
import { HubLogo } from "../components/ui";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--surface-base)]">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 sm:px-6">
        <header className="flex h-20 items-center justify-between">
          <Link to="/">
            <HubLogo />
          </Link>
          <Link to="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Back to site
          </Link>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
