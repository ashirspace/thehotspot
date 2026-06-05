import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button, Field, Input } from "../../components/ui";
import { Turnstile } from "../../components/Turnstile";
import { useAuth } from "../../state/use-auth";

const DIGIT_COUNT = 6;

export function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sendOtp, verifyOtp } = useAuth();

  const initialEmail = (location.state as { email?: string } | null)?.email ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState<string[]>(Array(DIGIT_COUNT).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const turnstileRequired = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
  const turnstileReady = !turnstileRequired || Boolean(turnstileToken);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user, navigate]);

  const handleSendOtp = async () => {
    if (!email || !turnstileReady) return;
    setSendError(null);
    setIsSending(true);
    try {
      await sendOtp(email, turnstileToken ?? undefined);
      setOtpSent(true);
      setDigits(Array(DIGIT_COUNT).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send code. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async () => {
    setSendError(null);
    setVerifyError(null);
    setDigits(Array(DIGIT_COUNT).fill(""));
    setIsSending(true);
    try {
      await sendOtp(email, turnstileToken ?? undefined);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setIsSending(false);
    }
  };

  const submitOtp = useCallback(
    async (code: string) => {
      if (code.length < DIGIT_COUNT) return;
      setVerifyError(null);
      setIsVerifying(true);
      try {
        await verifyOtp(email, code);
        navigate("/app");
      } catch (err) {
        setVerifyError(err instanceof Error ? err.message : "Invalid or expired code.");
        setDigits(Array(DIGIT_COUNT).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } finally {
        setIsVerifying(false);
      }
    },
    [email, verifyOtp, navigate],
  );

  const handleDigitChange = (index: number, value: string) => {
    // Handle paste: distribute digits across boxes
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, DIGIT_COUNT);
      const next = [...digits];
      for (let i = 0; i < DIGIT_COUNT; i++) {
        next[i] = pasted[i] ?? "";
      }
      setDigits(next);
      const focusIndex = Math.min(pasted.length, DIGIT_COUNT - 1);
      inputRefs.current[focusIndex]?.focus();
      if (pasted.length === DIGIT_COUNT) submitOtp(pasted);
      return;
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = next.join("");
    if (code.length === DIGIT_COUNT && !next.includes("")) {
      submitOtp(code);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const allFilled = digits.every(Boolean);

  return (
    <main className="flex flex-1 items-center justify-center py-12">
      <div className="w-full">
        <div className="precision-card p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[var(--orange)]">
            <Mail size={22} />
          </div>

          <h1 className="font-heading text-3xl font-normal italic text-[var(--text-primary)]">
            {otpSent ? "Enter your code" : "Sign in with email"}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {otpSent
              ? `We sent a 6-digit code to ${email}. It expires in 10 minutes.`
              : "We'll send a one-time code to your email address."}
          </p>

          {/* Email field — editable until OTP is sent */}
          {!otpSent ? (
            <div className="mt-6">
              <Field label="Email address">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoFocus={!initialEmail}
                />
              </Field>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] px-3 py-2">
              <Mail size={14} className="shrink-0 text-[var(--text-tertiary)]" />
              <span className="flex-1 truncate text-sm text-[var(--text-primary)]">{email}</span>
              <button
                type="button"
                onClick={() => { setOtpSent(false); setDigits(Array(DIGIT_COUNT).fill("")); }}
                className="text-xs text-[var(--text-secondary)] underline underline-offset-2 hover:text-[var(--text-primary)]"
              >
                Change
              </button>
            </div>
          )}

          {/* 6-digit OTP boxes */}
          {otpSent && (
            <div className="mt-6">
              <p className="precision-label mb-3">One-time code</p>
              <div className="flex gap-2">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    disabled={isVerifying}
                    className="h-12 w-full rounded border border-[var(--surface-border)] bg-[var(--surface-base)] text-center font-mono text-lg font-semibold text-[var(--text-primary)] outline-none transition focus:border-[var(--orange)] focus:ring-2 focus:ring-orange-500/15 disabled:opacity-50"
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>
              {verifyError && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {verifyError}
                </p>
              )}
              <Button
                type="button"
                className="mt-4 h-12 w-full"
                onClick={() => submitOtp(digits.join(""))}
                disabled={!allFilled || isVerifying}
              >
                {isVerifying ? "Verifying…" : "Verify code"}
              </Button>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSending}
                  className="text-sm text-[var(--text-secondary)] underline underline-offset-2 hover:text-[var(--text-primary)] disabled:opacity-50"
                >
                  {isSending ? "Sending…" : "Resend code"}
                </button>
              </div>
            </div>
          )}

          {/* CAPTCHA + Get OTP button */}
          {!otpSent && (
            <>
              <div className="mt-6 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] p-4">
                <p className="mb-3 text-xs font-medium text-[var(--text-secondary)]">Human verification</p>
                <Turnstile
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                  onVerify={handleTurnstileVerify}
                />
              </div>

              {sendError && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {sendError}
                </p>
              )}

              <Button
                type="button"
                className="mt-4 h-12 w-full"
                onClick={handleSendOtp}
                disabled={!email || !turnstileReady || isSending}
              >
                <Mail size={16} />
                {isSending ? "Sending code…" : "Get OTP"}
              </Button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            <Link
              to={-1 as unknown as string}
              className="font-medium text-[var(--text-secondary)] underline underline-offset-2 hover:text-[var(--text-primary)]"
              onClick={(e) => { e.preventDefault(); navigate(-1); }}
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
