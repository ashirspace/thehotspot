import { neon } from "@neondatabase/serverless";

export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

export async function initDb(sql) {
  await sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT, password TEXT, full_name TEXT, company TEXT, role_title TEXT, website TEXT, phone TEXT, profile_complete BOOLEAN DEFAULT FALSE, gmail_refresh_token TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS contacts (id SERIAL PRIMARY KEY, name TEXT, email TEXT, company TEXT, website TEXT, category TEXT, country TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS campaigns (id SERIAL PRIMARY KEY, user_id TEXT, category TEXT, offer_context TEXT, sent_count INTEGER DEFAULT 0, failed_count INTEGER DEFAULT 0, cancelled BOOLEAN DEFAULT FALSE, status TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS campaign_emails (id SERIAL PRIMARY KEY, campaign_id INTEGER, contact_email TEXT, company TEXT, subject TEXT, body TEXT, thread_id TEXT, sent_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS scheduled_campaigns (id SERIAL PRIMARY KEY, user_id TEXT, scheduled_for TIMESTAMPTZ, category TEXT, offer_context TEXT, max_chars INTEGER, status TEXT DEFAULT 'pending', sent_count INTEGER DEFAULT 0, failed_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS email_events (id SERIAL PRIMARY KEY, track_id TEXT, type TEXT, contact_email TEXT, clicked_url TEXT, timestamp TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS sequences (id SERIAL PRIMARY KEY, contact_email TEXT, company TEXT, campaign_id TEXT, thread_id TEXT, step INTEGER DEFAULT 1, sent_at TIMESTAMPTZ DEFAULT NOW(), next_send_at TIMESTAMPTZ, last_sent_at TIMESTAMPTZ, replied_at TIMESTAMPTZ, status TEXT DEFAULT 'active')`;
  // Column migrations — safe to run on existing tables
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role         TEXT    NOT NULL DEFAULT 'user'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone        TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name    TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company      TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role_title   TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS website      TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT`;
  // Editable site content (one row per key, e.g. key='login')
  await sql`CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, data JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ DEFAULT NOW(), updated_by TEXT)`;
  // Admin console audit log
  await sql`CREATE TABLE IF NOT EXISTS audit (id SERIAL PRIMARY KEY, actor TEXT, action TEXT, target TEXT, detail TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`;
}
