import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card } from "../../components/ui";

const plans: Array<{ name: string; price: string; desc: string; features: string[] }> = [
  { name: "Starter", price: "$0", desc: "For founders testing outbound", features: ["1 workspace", "1 sending identity", "1,000 leads", "Basic AI personalization"] },
  { name: "Growth", price: "$49", desc: "For active outbound teams", features: ["3 workspaces", "5 sending identities", "25,000 leads", "Sequences and reply inbox"] },
  { name: "Scale", price: "$149", desc: "For agencies and high-volume BD", features: ["Unlimited client workspaces", "Advanced deliverability", "CRM/webhook sync", "Priority support"] },
];

export function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="precision-label text-[var(--teal-deep)]">Pricing</p>
      <h1 className="mt-5 font-heading text-[clamp(3rem,6vw,5.8rem)] leading-[0.95] tracking-[-0.03em]">Pricing that scales with replies.</h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">Every plan includes workspace isolation, suppression lists, and safety-first sending controls.</p>
      <div className="mt-10 grid items-stretch gap-0 overflow-hidden rounded border border-[var(--surface-border)] bg-[var(--surface-card)] lg:grid-cols-3">
        {plans.map(({ name, price, desc, features }) => (
          <Card
            key={name}
            className={`relative rounded-none border-0 border-b border-[var(--surface-border)] p-8 lg:border-b-0 lg:border-r last:border-r-0 ${
              name === "Growth" ? "z-10 -my-3 border-2 !border-[var(--teal)] bg-[var(--surface-card)] py-11" : name === "Scale" ? "bg-[var(--surface-raised)]" : ""
            }`}
          >
            {name === "Growth" ? (
              <span className="absolute right-3 top-3 rotate-6 bg-[var(--teal)] px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-white">
                Most popular
              </span>
            ) : null}
            <h2 className="font-sans text-[1.1rem] font-medium">{name}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{desc}</p>
            <div className="mt-6 font-heading text-5xl font-normal tracking-[-0.03em]">{price}<span className="font-sans text-sm font-medium text-[var(--text-secondary)]">/month</span></div>
            <ul className="mt-6 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--teal)]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button variant={name === "Growth" ? "primary" : "secondary"} className="mt-8 w-full border-[var(--text-primary)]">
                Choose {name}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
}
