import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Button, Field, Input } from "../../components/ui";
import { Turnstile } from "../../components/Turnstile";
import { useAuth } from "../../state/use-auth";

type OtpStep = "idle" | "sending" | "sent" | "verifying";

const GOOGLE_ERRORS: Record<string, string> = {
  google_denied: "Google sign-in was cancelled.",
  google_unverified: "Google account email is not verified.",
  google_token_exchange: "Google sign-in failed. Please try again.",
  invalid_state: "Sign-in state was invalid. Please try again.",
};

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, error, signIn, sendOtp, verifyOtp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [otpStep, setOtpStep] = useState<OtpStep>("idle");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const turnstileRequired = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
  const turnstileReady = !turnstileRequired || Boolean(turnstileToken);

  const urlError = searchParams.get("error");
  const displayError = error || (urlError ? (GOOGLE_ERRORS[urlError] ?? "An error occurred. Please try again.") : null);

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user, navigate]);

  const handlePasswordSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    try {
      await signIn(String(form.get("email")), String(form.get("password")), turnstileToken ?? undefined);
      navigate("/app");
    } catch {
      // error set in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!otpEmail) return;
    setOtpStep("sending");
    try {
      await sendOtp(otpEmail, turnstileToken ?? undefined);
      setOtpStep("sent");
    } catch {
      setOtpStep("idle");
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) return;
    setOtpStep("verifying");
    try {
      await verifyOtp(otpEmail, otpCode);
      navigate("/app");
    } catch {
      setOtpStep("sent");
    }
  };

  const handleResendOtp = async () => {
    setOtpCode("");
    setOtpStep("sending");
    try {
      await sendOtp(otpEmail, turnstileToken ?? undefined);
      setOtpStep("sent");
    } catch {
      setOtpStep("idle");
    }
  };

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center py-12">
      <div className="w-full">
        <div className="precision-card p-8">
          <h1 className="font-heading text-3xl font-normal italic text-[var(--text-primary)]">Sign in</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Welcome back to your workspace.</p>

          <form className="mt-6 grid gap-4" onSubmit={handlePasswordSignIn}>
            <Field label="Email">
              <Input name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Button
              type="submit"
              className="h-12 w-full"
              disabled={isSubmitting || !turnstileReady}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--surface-border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-[var(--text-tertiary)]">or continue with</span>
            </div>
          </div>

          <div className="grid gap-3">
            {otpStep === "idle" || otpStep === "sending" ? (
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  placeholder="Email for one-time code"
                  className="flex-1"
                  aria-label="Email for OTP"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendOtp}
                  disabled={otpStep === "sending" || !otpEmail || !turnstileReady}
                  className="shrink-0"
                >
                  <Mail size={15} />
                  {otpStep === "sending" ? "Sending…" : "Send OTP"}
                </Button>
              </div>
            ) : (
              <div className="grid gap-2">
                <p className="text-xs text-[var(--text-secondary)]">
                  Code sent to <span className="font-medium text-[var(--text-primary)]">{otpEmail}</span>
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="flex-1 font-mono tracking-widest"
                    aria-label="One-time code"
                    autoFocus
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpStep === "verifying" || otpCode.length < 6}
                    className="shrink-0"
                  >
                    {otpStep === "verifying" ? "Verifying…" : "Verify"}
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-left text-xs text-[var(--text-secondary)] underline underline-offset-2 hover:text-[var(--text-primary)]"
                >
                  Resend code
                </button>
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => { window.location.href = "/api/auth/google"; }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </Button>
          </div>

          <div className="mt-6 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] p-4">
            <p className="mb-3 text-xs font-medium text-[var(--text-secondary)]">Human verification</p>
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
              onVerify={handleTurnstileVerify}
            />
          </div>

          {displayError ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {displayError}
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            No account?{" "}
            <Link className="font-semibold text-[var(--orange)] hover:text-[var(--orange-hover)]" to="/signup">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
