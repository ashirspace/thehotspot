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
        "inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[var(--orange)] text-white hover:bg-[var(--orange-hover)]",
        variant === "secondary" && "border border-[var(--surface-border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-raised)]",
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
      className="h-10 rounded border border-[var(--surface-border)] bg-[var(--surface-base)] px-3 text-sm text-[var(--text-primary)] shadow-none outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--orange)] focus:ring-2 focus:ring-orange-500/15"
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-28 rounded border border-[var(--surface-border)] bg-[var(--surface-base)] px-3 py-2 text-sm leading-6 text-[var(--text-primary)] shadow-none outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--orange)] focus:ring-2 focus:ring-orange-500/15"
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
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <circle cx="15" cy="15" r="5" fill="#fe6e00" />
        <circle cx="6" cy="8" r="3" fill="#fe6e00" opacity="0.75" />
        <circle cx="24" cy="8" r="3" fill="#fe6e00" opacity="0.75" />
        <circle cx="8" cy="24" r="3" fill="#fe6e00" opacity="0.75" />
        <circle cx="24" cy="23" r="3" fill="#fe6e00" opacity="0.75" />
        <path d="M8 9.5 12.5 13M21.8 9.5 17.8 13M10.5 22 13 18.8M21.5 21.5 18 18" stroke="#fe6e00" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      thehotspot.in
    </span>
  );
}
