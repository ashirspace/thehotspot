import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  if (!resend) {
    resend = new Resend(apiKey);
  }

  return resend;
}
