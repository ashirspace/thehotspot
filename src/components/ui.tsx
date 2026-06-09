import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "dark" }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[var(--teal)] text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] hover:bg-[var(--teal-deep)]",
        variant === "secondary" && "border border-[var(--surface-border-strong)] bg-transparent text-[var(--text-primary)] hover:border-[var(--teal)] hover:bg-[var(--teal-pale)]/40",
        variant === "ghost" && "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]",
        variant === "dark" && "border border-white/15 bg-transparent text-[var(--dark-text)] hover:bg-white/[0.04]",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("precision-card p-5", className)} {...props} />;
}

export function Badge({
  className,
  tone = "slate",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "orange" | "green" | "red" | "teal" | "slate" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border-l-2 bg-[var(--surface-raised)] px-2.5 py-1 text-xs font-medium",
        tone === "orange" && "border-l-[var(--orange)] text-[var(--orange-dim)]",
        tone === "green" && "border-l-[var(--green)] text-[var(--green)]",
        tone === "red" && "border-l-[var(--red)] text-[var(--red)]",
        tone === "teal" && "border-l-[var(--teal)] text-[var(--teal)]",
        tone === "slate" && "border-l-[var(--surface-border)] text-[var(--text-secondary)]",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="precision-label">{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--text-secondary)]">{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="h-10 rounded border border-[var(--surface-border)] bg-[var(--surface-base)] px-3 text-sm text-[var(--text-primary)] shadow-none outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--orange)] focus:ring-2 focus:ring-teal-500/15"
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-28 rounded border border-[var(--surface-border)] bg-[var(--surface-base)] px-3 py-2 text-sm leading-6 text-[var(--text-primary)] shadow-none outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--orange)] focus:ring-2 focus:ring-teal-500/15"
      {...props}
    />
  );
}

export function SidebarLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/app"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 border-l-[3px] px-3 py-2.5 text-sm font-normal transition",
          isActive
            ? "nav-item-active border-l-[var(--orange)] bg-transparent font-medium text-[var(--text-primary)]"
            : "border-l-transparent text-[var(--text-secondary)] hover:border-l-[var(--surface-border)] hover:text-[var(--text-primary)]",
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

export function HubLogo({ dark = false }: { dark?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2 font-sans text-lg font-semibold tracking-[-0.01em]", dark ? "text-[var(--dark-text)]" : "text-[var(--text-primary)]")}>
      <img src="/brand/thehotspot-logo.png" alt="" className="h-9 w-[30px] object-contain" />
      thehotspot.in
    </span>
  );
}
