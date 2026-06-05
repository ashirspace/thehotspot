import { db, handle, hashSessionToken, json, methodNotAllowed, getBearerToken } from "../_shared";

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return methodNotAllowed();

  const token = getBearerToken(request);
  if (token) {
    await db()`
      delete from sessions
      where token_hash = ${hashSessionToken(token)}
    `;
  }

  return json({ ok: true });
});
