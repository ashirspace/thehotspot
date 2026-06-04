import { Link, useNavigate } from "react-router-dom";
import { Button, Field, Input } from "../../components/ui";

export function SignupPage() {
  const navigate = useNavigate();

  return (
    <main className="grid flex-1 items-center py-12 lg:grid-cols-[1fr_480px] lg:gap-16">
      <section className="hidden lg:block">
        <p className="precision-label text-orange-400">Start safely</p>
        <h1 className="mt-4 max-w-2xl font-heading text-[clamp(3.2rem,6vw,6rem)] font-normal italic leading-[0.95] tracking-[-0.03em]">
          Connect mailbox, verify domain, import leads, build sequence, launch.
        </h1>
        <ul className="mt-8 grid gap-3 text-white/70">
          {["No sending until SPF, DKIM, and DMARC pass.", "Every workspace has isolated data policies.", "Suppression checks run before every send."].map((item) => (
            <li key={item} className="rounded border border-white/10 bg-white/[0.04] px-4 py-3">{item}</li>
          ))}
        </ul>
      </section>
      <section className="rounded border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="font-heading text-3xl font-normal italic">Create account</h2>
        <p className="mt-2 text-sm text-white/60">Production auth is Supabase Auth with RLS-backed workspace membership.</p>
        <form
          className="mt-6 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            navigate("/app");
          }}
        >
          <Field label="Full name"><Input required placeholder="Ashir Aryan" /></Field>
          <Field label="Work email"><Input type="email" required placeholder="you@company.com" /></Field>
          <Field label="Password"><Input type="password" required minLength={8} placeholder="Minimum 8 characters" /></Field>
          <Button type="submit" className="h-12 rounded">Create workspace</Button>
          <Button type="button" variant="dark" className="h-12">Continue with Google</Button>
        </form>
        <p className="mt-6 text-center text-sm text-white/60">
          Already have an account? <Link className="font-semibold text-orange-400" to="/login">Login</Link>
        </p>
        <p className="mt-4 text-xs leading-5 text-white/45">
          By creating an account, you agree to the Terms and Privacy Policy.
        </p>
      </section>
    </main>
  );
}
