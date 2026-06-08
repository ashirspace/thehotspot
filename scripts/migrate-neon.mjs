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

function splitSqlStatements(source) {
  const statements = [];
  let current = "";
  let singleQuote = false;
  let doubleQuote = false;
  let lineComment = false;
  let blockComment = false;
  let dollarQuote = null;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (lineComment) {
      current += char;
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      current += char;
      if (char === "*" && next === "/") {
        current += next;
        i += 1;
        blockComment = false;
      }
      continue;
    }

    if (dollarQuote) {
      if (source.startsWith(dollarQuote, i)) {
        current += dollarQuote;
        i += dollarQuote.length - 1;
        dollarQuote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (singleQuote) {
      current += char;
      if (char === "'" && next === "'") {
        current += next;
        i += 1;
      } else if (char === "'") {
        singleQuote = false;
      }
      continue;
    }

    if (doubleQuote) {
      current += char;
      if (char === "\"" && next === "\"") {
        current += next;
        i += 1;
      } else if (char === "\"") {
        doubleQuote = false;
      }
      continue;
    }

    if (char === "-" && next === "-") {
      current += char + next;
      i += 1;
      lineComment = true;
      continue;
    }

    if (char === "/" && next === "*") {
      current += char + next;
      i += 1;
      blockComment = true;
      continue;
    }

    if (char === "'") {
      current += char;
      singleQuote = true;
      continue;
    }

    if (char === "\"") {
      current += char;
      doubleQuote = true;
      continue;
    }

    if (char === "$") {
      const match = source.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
      if (match) {
        dollarQuote = match[0];
        current += dollarQuote;
        i += dollarQuote.length - 1;
        continue;
      }
    }

    if (char === ";") {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
      continue;
    }

    current += char;
  }

  const statement = current.trim();
  if (statement) statements.push(statement);
  return statements;
}

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
  for (const statement of splitSqlStatements(migrationSql)) {
    await sql.query(statement);
  }
  await sql`insert into schema_migrations (version) values (${file})`;
}

console.log("Neon migrations complete.");
