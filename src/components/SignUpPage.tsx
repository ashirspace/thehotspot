"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff, BadgeCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed.");
      setLoading(false);
      return;
    }

    // Sign in immediately after registration
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    setLoading(false);
    if (result?.error) {
      setError("Account created but sign-in failed. Try signing in manually.");
    } else {
      window.location.href = "/";
    }
  }

  function handleGoogle() {
    setGLoading(true);
    signIn("google", { callbackUrl: "/" });
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-slate-900 no-underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
            <BadgeCheck size={16} />
          </span>
          <span className="font-semibold tracking-tight">thehotspot</span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900">
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col items-start gap-12 px-6 py-12 lg:flex-row lg:items-stretch lg:py-20">
        {/* ── Left: branding panel ── */}
        <aside className="w-full lg:max-w-sm">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-950">
            Start sending smarter outreach today.
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-slate-500">
            Create your free account to build campaigns, import contacts, generate AI-personalised messages, and track replies — all in one place.
          </p>
          <ul className="space-y-3 text-sm text-slate-600">
            {[
              "No credit card required",
              "Set up in under 3 minutes",
              "200 emails/month on the free plan",
              "Upgrade anytime, cancel anytime",
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1.5 5.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Right: form card ── */}
        <div className="w-full flex-1 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:p-10">
          <h2 className="mb-1 text-xl font-bold text-slate-950">Create your account</h2>
          <p className="mb-6 text-sm text-slate-500">Already have an account?{" "}
            <Link href="/?signin=1" className="font-semibold text-emerald-600 hover:underline">Sign in</Link>
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {gLoading ? <Dots /> : <><GoogleIcon /> Continue with Google</>}
          </button>

          <Divider />

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="First and last name"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className={`${inputClass} pr-11`}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Confirm password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConf ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className={`${inputClass} pr-11`}
                  />
                  <button type="button" onClick={() => setShowConf(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !name || !email || !password || !confirm}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Dots white /> : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            By creating an account you agree to our{" "}
            <a href="#" className="underline">Terms of Service</a> and{" "}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">or</span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function Dots({ white = false }: { white?: boolean }) {
  return (
    <span className="flex gap-1">
      {[0,1,2].map(d => (
        <span key={d} className={`inline-block h-1.5 w-1.5 rounded-full ${white ? "bg-white" : "bg-slate-400"}`}
          style={{ animation: `dotPulse 1.2s ease-in-out ${d * 0.2}s infinite` }} />
      ))}
      <style>{`@keyframes dotPulse { 0%,80%,100%{opacity:.3} 40%{opacity:1} }`}</style>
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
