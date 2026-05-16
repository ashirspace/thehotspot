import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

export function getDb() {
  if (!DATABASE_URL) throw new Error("DATABASE_URL environment variable is not set");
  return neon(DATABASE_URL);
}

export async function initDb(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password TEXT,
      full_name TEXT,
      company TEXT,
      role_title TEXT,
      website TEXT,
      phone TEXT,
      profile_complete BOOLEAN DEFAULT FALSE,
      gmail_refresh_token TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT,
      company TEXT,
      website TEXT,
      category TEXT,
      country TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      category TEXT,
      offer_context TEXT,
      sent_count INTEGER DEFAULT 0,
      failed_count INTEGER DEFAULT 0,
      cancelled BOOLEAN DEFAULT FALSE,
      status TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS campaign_emails (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER,
      contact_email TEXT,
      company TEXT,
      subject TEXT,
      body TEXT,
      thread_id TEXT,
      sent_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS scheduled_campaigns (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      scheduled_for TIMESTAMPTZ,
      category TEXT,
      offer_context TEXT,
      max_chars INTEGER,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS email_events (
      id SERIAL PRIMARY KEY,
      track_id TEXT,
      type TEXT,
      contact_email TEXT,
      clicked_url TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
