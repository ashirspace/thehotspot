import { NextRequest, NextResponse } from "next/server";
import { parse } from "papaparse";
import { readSheet, type CellValue } from "read-excel-file/node";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type RawRow = Record<string, string | number | undefined | null>;

const aliases: Record<string, string[]> = {
  firstName: ["firstName", "first_name", "First Name", "firstname"],
  lastName: ["lastName", "last_name", "Last Name", "lastname"],
  fullName: ["fullName", "full_name", "Full Name", "Name", "name"],
  linkedinUrl: ["linkedinUrl", "linkedin_url", "LinkedIn", "LinkedIn URL", "linkedin"],
  email: ["email", "Email"],
  company: ["company", "Company"],
  role: ["role", "title", "Title", "Job Title"],
  profession: ["profession", "Profession"],
  category: ["category", "Category"],
  location: ["location", "Location"],
  profileSummary: ["profileSummary", "profile_summary", "Summary", "Notes"],
};

export async function POST(request: NextRequest) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rows = file.name.toLowerCase().endsWith(".csv") ? parseCsv(buffer) : await parseWorkbook(buffer);
  const validRows = rows.map(normalizeRow).filter((row) => row.fullName || row.firstName);
  const invalidCount = Math.max(0, rows.length - validRows.length);
  const prisma = getPrisma();

  const batch = await prisma.importBatch.create({
    data: {
      ownerId: userId!,
      filename: file.name,
      source: file.name.toLowerCase().endsWith(".csv") ? "CSV" : "EXCEL",
      rowCount: rows.length,
      validCount: validRows.length,
      invalidCount,
      mapping: aliases,
      validationLog: {
        invalidCount,
        required: ["fullName or firstName"],
      },
    },
  });

  if (validRows.length) {
    await prisma.recipient.createMany({
      data: validRows.map((row) => {
        const fullName = row.fullName || [row.firstName, row.lastName].filter(Boolean).join(" ");
        return {
          ownerId: userId!,
          importedBatchId: batch.id,
          firstName: row.firstName || fullName.split(" ")[0] || "Unknown",
          lastName: row.lastName || null,
          fullName,
          linkedinUrl: row.linkedinUrl || null,
          email: row.email || null,
          company: row.company || null,
          role: row.role || null,
          profession: row.profession || null,
          category: row.category || null,
          location: row.location || null,
          profileSummary: row.profileSummary || null,
          source: file.name.toLowerCase().endsWith(".csv") ? "CSV" : "EXCEL",
        };
      }),
    });
  }

  await prisma.activityEvent.create({
    data: {
      type: "IMPORTED",
      metadata: {
        filename: file.name,
        validCount: validRows.length,
        invalidCount,
      },
    },
  });

  return NextResponse.json({
    batchId: batch.id,
    validCount: validRows.length,
    invalidCount,
  });
}

function parseCsv(buffer: Buffer) {
  const result = parse<RawRow>(buffer.toString("utf8"), {
    header: true,
    skipEmptyLines: true,
  });

  return result.data;
}

async function parseWorkbook(buffer: Buffer) {
  const [headers = [], ...dataRows] = (await readSheet(buffer)) as CellValue[][];
  const normalizedHeaders = headers.map((header: CellValue) => String(header || "").trim());

  return dataRows.map((row) =>
    Object.fromEntries(
      normalizedHeaders.map((header: string, index: number) => [
        header,
        row[index] == null ? "" : String(row[index]),
      ]),
    ),
  ) as RawRow[];
}

function normalizeRow(row: RawRow) {
  return Object.fromEntries(
    Object.entries(aliases).map(([target, keys]) => [
      target,
      String(keys.map((key) => row[key]).find((value) => value !== undefined && value !== null && String(value).trim()) || "").trim(),
    ]),
  ) as Record<keyof typeof aliases, string>;
}
