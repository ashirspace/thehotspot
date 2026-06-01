"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff, X, TrendingUp, Users, Inbox, Sparkles } from "lucide-react";

type Props = { onClose: () => void };

const FEATURES = [
  { icon: Users,      text: "Import leads from any CSV in seconds" },
  { icon: Sparkles,   text: "AI writes a personalised email per contact" },
  { icon: Inbox,      text: "All replies land in one unified inbox" },
  { icon: TrendingUp, text: "Live campaign analytics from day one" },
];

export default function SignInModal({ onClose }: Props) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]       = useState("");

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      window.location.href = result?.url || "/";
    }
  }

  function handleGoogle() {
    setGLoading(true);
    signIn("google", { callbackUrl: "/" });
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)", background: "rgba(15,23,42,0.45)", animation: "fadeIn .2s ease" }}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 grid w-full grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl sm:grid-cols-[1fr_300px]"
        style={{ maxWidth: 780, maxHeight: "92vh", overflowY: "auto", animation: "modalIn .3s cubic-bezier(.34,1.1,.64,1)" }}
      >
        {/* ── Left: form ── */}
        <div className="flex flex-col px-8 py-10 sm:px-10">
          <button onClick={onClose} className="mb-4 self-end text-slate-300 transition hover:text-slate-500" aria-label="Close">
            <X size={18} />
          </button>

          <div className="mb-7">
            <p className="text-2xl font-bold tracking-tight text-slate-950">Welcome back</p>
            <p className="mt-1 text-sm text-slate-500">Sign in to your outreach dashboard.</p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {gLoading ? (
              <Dots />
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          <Divider />

          {/* Email / password form */}
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Dots white /> : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            No account?{" "}
            <a href="/signup" className="font-semibold text-emerald-600 hover:underline" onClick={onClose}>
              Get started free
            </a>
          </p>
        </div>

        {/* ── Right: feature panel (hidden on mobile) ── */}
        <div
          className="hidden sm:flex flex-col justify-center p-8"
          style={{ background: "linear-gradient(160deg,#f0fdf9 0%,#e0f2fe 100%)", borderLeft: "1px solid rgba(16,185,129,0.12)" }}
        >
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-600">thehotspot</p>
          <p className="mb-6 text-lg font-bold leading-snug text-slate-950">Cold outreach that<br />gets replies.</p>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Icon size={14} />
                </span>
                <span className="pt-0.5 text-xs leading-relaxed text-slate-600">{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-emerald-100 bg-white/70 p-4">
            <p className="text-xs italic leading-relaxed text-slate-500">
              "First campaign was live in under five minutes. The replies proved it wasn't templated."
            </p>
            <p className="mt-2 text-xs font-semibold text-emerald-600">— Verified user</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0}                       to{opacity:1}              }
        @keyframes modalIn { from{opacity:0;transform:scale(.96)}  to{opacity:1;transform:scale(1)} }
      `}</style>
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
