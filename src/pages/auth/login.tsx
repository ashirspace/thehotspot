import { Link, useNavigate } from "react-router-dom";
import { Button, Field, Input } from "../../components/ui";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="grid flex-1 items-center py-12 lg:grid-cols-[1fr_440px] lg:gap-16">
      <section className="hidden lg:block">
        <p className="precision-label text-orange-400">Welcome back</p>
        <h1 className="mt-4 max-w-2xl font-heading text-[clamp(3.2rem,6vw,6rem)] font-normal italic leading-[0.95] tracking-[-0.03em]">
          Return to your outreach command center.
        </h1>
        <p className="mt-5 max-w-xl text-[0.9375rem] leading-[1.75] text-[var(--dark-text)]/65">
          Campaigns, sender health, reply inbox, and workspace-safe automation are waiting behind a secure session.
        </p>
      </section>
      <section className="rounded border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="font-heading text-3xl font-normal italic">Login</h2>
        <p className="mt-2 text-sm text-white/60">Use Supabase email/password or Google OAuth in production.</p>
        <form
          className="mt-6 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            navigate("/app");
          }}
        >
          <Field label="Email">
            <Input type="email" required defaultValue="founder@acme.co" />
          </Field>
          <Field label="Password">
            <Input type="password" required defaultValue="password" />
          </Field>
          <Button type="submit" className="h-12 rounded">Login to dashboard</Button>
          <Button type="button" variant="dark" className="h-12">Continue with Google</Button>
        </form>
        <p className="mt-6 text-center text-sm text-white/60">
          No account? <Link className="font-semibold text-orange-400" to="/signup">Create one</Link>
        </p>
      </section>
    </main>
  );
}
