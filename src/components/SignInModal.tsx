"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import {
  BadgeCheck,
  TrendingUp,
  Users,
  Inbox,
  Sparkles,
  X,
} from "lucide-react";

type Mode = "signin" | "signup";

type Props = {
  mode: Mode;
  onClose: () => void;
};

const FEATURES = [
  { icon: Users, text: "Import leads from any CSV in seconds" },
  { icon: Sparkles, text: "AI writes a personalised DM per contact" },
  { icon: Inbox, text: "All replies land in one unified inbox" },
  { icon: TrendingUp, text: "Live campaign analytics from day one" },
];

export default function SignInModal({ mode, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  function handleLinkedIn() {
    setLoading(true);
    signIn("linkedin", { callbackUrl: "/dashboard" });
  }

  const isSignup = mode === "signup";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)", background: "rgba(15,23,42,0.45)", animation: "fadeIn .2s ease" }}
    >
      {/* Backdrop closes modal */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 grid w-full grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl sm:grid-cols-[1fr_300px]"
        style={{ maxWidth: 800, maxHeight: "92vh", overflowY: "auto", animation: "modalIn .3s cubic-bezier(.34,1.1,.64,1)" }}
      >
        {/* Left — form panel */}
        <div className="flex flex-col p-10">
          <button
            onClick={onClose}
            className="mb-4 self-end text-slate-300 hover:text-slate-500 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="mb-8">
            <p className="mb-1 text-2xl font-bold tracking-tight text-slate-950">
              {isSignup ? "Get started free" : "Welcome back"}
            </p>
            <p className="text-sm text-slate-500">
              {isSignup
                ? "Create your account to start running outreach campaigns."
                : "Sign in to your outreach dashboard."}
            </p>
          </div>

          <button
            onClick={handleLinkedIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#004182] disabled:opacity-60"
          >
            {loading ? (
              <span className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="inline-block h-1.5 w-1.5 rounded-full bg-white"
                    style={{ animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite` }}
                  />
                ))}
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                  <rect width="34" height="34" rx="4" fill="white" />
                  <path d="M8 13h4v13H8V13zm2-6a2 2 0 110 4 2 2 0 010-4zm6 6h4v1.8c.6-1 1.9-2 4-2 4.2 0 5 2.8 5 6.4V26h-4v-6.4c0-1.5-.03-3.4-2.1-3.4-2.1 0-2.4 1.6-2.4 3.3V26h-4V13z" fill="#0A66C2" />
                </svg>
                Continue with LinkedIn
              </>
            )}
          </button>

          <p className="mt-6 text-center text-xs text-slate-400">
            {isSignup ? "Already have an account? " : "No account? "}
            <button
              className="font-semibold text-emerald-600 hover:underline"
              onClick={onClose}
            >
              {isSignup ? "Sign in" : "Get started free"}
            </button>
          </p>

          <p className="mt-8 text-xs text-slate-400 leading-relaxed">
            Sessions are persisted with NextAuth. LinkedIn tokens are stored
            server-side through Prisma and Neon.
          </p>
        </div>

        {/* Right — feature panel (hidden on mobile) */}
        <div
          className="hidden sm:flex flex-col justify-center p-8"
          style={{ background: "linear-gradient(160deg, #f0fdf9 0%, #e0f2fe 100%)", borderLeft: "1px solid rgba(16,185,129,0.12)" }}
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">thehotspot</p>
          <p className="mb-6 text-lg font-bold leading-snug text-slate-950">
            Cold outreach that<br />gets replies.
          </p>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Icon size={14} />
                </div>
                <span className="pt-1 text-xs leading-relaxed text-slate-600">{text}</span>
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
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes modalIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse { 0%,80%,100%{opacity:0.3} 40%{opacity:1} }
      `}</style>
    </div>
  );
}
