import { randomBytes, createHash } from "node:crypto";
import { handle, methodNotAllowed, publicBaseUrl } from "../_shared";

function buildState(): string {
  const rand = randomBytes(16).toString("base64url");
  const mac = createHash("sha256")
    .update(rand + (process.env.GOOGLE_CLIENT_SECRET ?? ""))
    .digest("hex")
    .slice(0, 16);
  return `${rand}.${mac}`;
}

export default handle(async function handler(request: Request) {
  if (request.method !== "GET") return methodNotAllowed();

  const base = publicBaseUrl(request);
  const redirectUri = `${base}/api/auth/google-callback`;
  const state = buildState();

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    302,
  );
});
