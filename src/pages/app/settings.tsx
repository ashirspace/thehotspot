import { Cable, KeyRound, LogOut, Webhook } from "lucide-react";
import { Badge, Button, Card, Field, Input } from "../../components/ui";
import { useSaveWorkspaceSettings } from "../../lib/data-hooks";
import { useAuth } from "../../state/use-auth";

export function SettingsPage() {
  const { signOut, workspace } = useAuth();
  const saveWorkspace = useSaveWorkspaceSettings();
  const integrations = [
    { label: "Supabase Auth + RLS", status: "configured", Icon: KeyRound },
    { label: "OpenAI JSON mode", status: "env required", Icon: KeyRound },
    { label: "ESP / Gmail API", status: "env required", Icon: Cable },
    { label: "Slack / Zapier / N8N webhooks", status: "optional", Icon: Webhook },
    { label: "Stripe billing", status: "phase 4", Icon: KeyRound },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading italic text-[clamp(2.3rem,4vw,4rem)] font-normal leading-[1] tracking-[-0.02em]">Settings + Integrations</h1>
        <p className="mt-2 text-slate-600">Workspace membership, provider secrets, webhooks, billing, and compliance controls.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Workspace</h2>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              saveWorkspace.mutate({
                name: String(form.get("name") || workspace.name),
                physicalAddress: String(form.get("physicalAddress") || ""),
                webhookUrl: String(form.get("webhookUrl") || "") || null,
              });
            }}
          >
            <Field label="Workspace name"><Input name="name" defaultValue={workspace.name} /></Field>
            <Field label="Plan"><Input defaultValue={workspace.plan} disabled /></Field>
            <Field label="Physical mailing address"><Input name="physicalAddress" placeholder="Required before email campaigns launch" /></Field>
            <Field label="Webhook URL"><Input name="webhookUrl" placeholder="https://hooks.zapier.com/..." /></Field>
            <Button disabled={saveWorkspace.isPending}>{saveWorkspace.isPending ? "Saving..." : "Save workspace settings"}</Button>
          </form>
        </Card>
        <Card>
          <h2 className="font-semibold">Integrations</h2>
          <div className="mt-5 grid gap-3">
            {integrations.map(({ label, status, Icon }) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 text-[var(--orange)]" />
                  {label}
                </div>
                <Badge tone={status === "configured" ? "green" : "slate"}>{status}</Badge>
              </div>
            ))}
          </div>
          <Button variant="secondary" className="mt-5 w-full" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </Card>
      </section>
    </div>
  );
}
