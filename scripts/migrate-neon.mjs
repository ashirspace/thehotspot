/* global console, process */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Set DATABASE_URL_UNPOOLED or DATABASE_URL before running Neon migrations.");
}

const sql = neon(connectionString);
const migrationsDir = join(process.cwd(), "neon", "migrations");
const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

await sql.query(`
  create table if not exists schema_migrations (
    version text primary key,
    applied_at timestamptz not null default now()
  )
`);

const appliedRows = await sql.query("select version from schema_migrations");
const applied = new Set(appliedRows.map((row) => row.version));

for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip ${file}`);
    continue;
  }

  const migrationSql = await readFile(join(migrationsDir, file), "utf8");
  console.log(`apply ${file}`);
  await sql.transaction([
    sql.query(migrationSql),
    sql`insert into schema_migrations (version) values (${file})`,
  ]);
}

console.log("Neon migrations complete.");
