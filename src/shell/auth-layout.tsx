import { Link, Outlet } from "react-router-dom";
import { HubLogo } from "../components/ui";

export function AuthLayout() {
  return (
    <div className="dark-auth min-h-screen overflow-hidden">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        <header className="flex h-20 items-center justify-between">
          <Link to="/">
            <HubLogo dark />
          </Link>
          <Link to="/" className="text-sm font-medium text-[var(--dark-text)]/70 hover:text-[var(--dark-text)]">
            Back to site
          </Link>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
