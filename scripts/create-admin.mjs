/**
 * Creates (or resets) a local admin user in the Neon database.
 *
 * Usage:
 *   node scripts/create-admin.mjs
 *   node scripts/create-admin.mjs --email you@example.com --password yourpassword
 *
 * Defaults (override via flags or ADMIN_EMAIL / ADMIN_PASSWORD env vars):
 *   email:    admin@localhost
 *   password: admin1234
 */

/* global Buffer, console, process */

import { neon } from "@neondatabase/serverless";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const scrypt = promisify(scryptCb);

// ── Load .env.local or .env ─────────────────────────────────────────────────
function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    try {
      const lines = readFileSync(resolve(process.cwd(), name), "utf8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
      break;
    } catch {
      // file not found — try the next one
    }
  }
}
loadEnv();

// ── Parse CLI flags ──────────────────────────────────────────────────────────
function flag(name) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const email    = flag("email")    || process.env.ADMIN_EMAIL    || "admin@localhost";
const password = flag("password") || process.env.ADMIN_PASSWORD || "admin1234";
const name     = flag("name")     || process.env.ADMIN_NAME     || "Local Admin";

// ── Validate ─────────────────────────────────────────────────────────────────
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("ERROR: DATABASE_URL_UNPOOLED or DATABASE_URL must be set.");
  console.error("       Create a .env.local file with those values first.\n");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ERROR: password must be at least 8 characters.");
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function hashPassword(plain) {
  const salt = randomBytes(16).toString("base64url");
  const hash = await scrypt(plain, salt, 64);
  return `scrypt$${salt}$${Buffer.from(hash).toString("base64url")}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const sql = neon(url);

console.log("\n── thehotspot admin seed ───────────────────────────────");
console.log(`  email    : ${email}`);
console.log(`  password : ${password}`);
console.log(`  name     : ${name}`);
console.log("────────────────────────────────────────────────────────\n");

const passwordHash = await hashPassword(password);
const normalizedEmail = email.trim().toLowerCase();

// Upsert user — preserves existing data if the account already exists,
// only updates the password hash and marks the email as verified.
const [user] = await sql`
  insert into users (email, full_name, password_hash, email_verified_at)
  values (
    ${normalizedEmail},
    ${name},
    ${passwordHash},
    now()
  )
  on conflict (email) do update
    set password_hash      = excluded.password_hash,
        full_name          = coalesce(users.full_name, excluded.full_name),
        email_verified_at  = coalesce(users.email_verified_at, now())
  returning id, email::text as email, full_name
`;

console.log(`✓ user upserted  — id: ${user.id}`);

// Ensure a workspace exists (idempotent)
const existingWs = await sql`
  select w.id, w.name
  from workspaces w
  join members m on m.workspace_id = w.id
  where m.user_id = ${user.id}
  limit 1
`;

if (existingWs.length > 0) {
  console.log(`✓ workspace found — "${existingWs[0].name}" (${existingWs[0].id})`);
} else {
  const wsName = `${name.split(" ")[0]}'s workspace`;
  const [ws] = await sql`
    insert into workspaces (name, owner_id, plan)
    values (${wsName}, ${user.id}, 'starter'::workspace_plan)
    returning id, name
  `;
  await sql`
    insert into members (workspace_id, user_id, role)
    values (${ws.id}, ${user.id}, 'owner'::workspace_role)
  `;
  await sql`
    insert into workspace_settings (workspace_id)
    values (${ws.id})
    on conflict (workspace_id) do nothing
  `;
  console.log(`✓ workspace created — "${ws.name}" (${ws.id})`);
}

console.log(`
────────────────────────────────────────────────────────
  Admin account ready. Sign in at:

    http://localhost:5173/login

    Email    : ${email}
    Password : ${password}
────────────────────────────────────────────────────────
`);
