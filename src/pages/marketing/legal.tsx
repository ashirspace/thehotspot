export function LegalPage({ type }: { type: "privacy" | "terms" }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading italic text-[clamp(2.6rem,5vw,5rem)] font-normal leading-[1] tracking-[-0.02em]">
        {type === "privacy" ? "Privacy Policy" : "Terms of Service"}
      </h1>
      <p className="mt-4 text-sm text-slate-500">Last updated: June 4, 2026</p>
      <div className="prose prose-slate mt-8 max-w-none">
        <p>
          This page is preserved as a production legal surface and should be reviewed by counsel before launch. The
          platform stores workspace-scoped lead data, message events, sender identities, suppression records, and user
          membership data in Supabase with Row Level Security.
        </p>
        <p>
          Users are responsible for lawful outreach, honoring opt-outs, maintaining a physical mailing address for email
          campaigns, and using only official social messaging channels.
        </p>
      </div>
    </main>
  );
}
