import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { writeAudit } from "@/lib/services/audit";
import { ApiError, jsonError, readJsonObject } from "@/lib/http";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;

type AvailabilityInput = {
  weekday?: number;
  date?: string;
  available?: boolean;
  availableFrom?: string | null;
  availableTo?: string | null;
  note?: string | null;
};

function monthBounds(month: string) {
  if (!MONTH_PATTERN.test(month)) throw new ApiError(400, "month must use YYYY-MM");
  const [year, monthNumber] = month.split("-").map(Number);
  const first = `${month}-01`;
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return { first, last: `${month}-${String(lastDay).padStart(2, "0")}` };
}

function validTime(value: unknown) {
  return value == null || value === "" || (typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
}

function normalizeRule(value: unknown): AvailabilityInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(400, "Invalid availability rule");
  const rule = value as AvailabilityInput;
  if (!validTime(rule.availableFrom) || !validTime(rule.availableTo)) throw new ApiError(400, "Availability times must use HH:MM");
  if (rule.note != null && (typeof rule.note !== "string" || rule.note.length > 500)) throw new ApiError(400, "Availability note is too long");
  return rule;
}

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user?.employeeId) return NextResponse.json({ error: "Employee profile required" }, { status: 403 });
    const month = new URL(req.url).searchParams.get("month");
    if (month) {
      const { first, last } = monthBounds(month);
      const [weekly, dates] = await Promise.all([
        db()`select id,weekday,available_from,available_to,available,note from availability_rules where organization_id=${user.organizationId} and employee_id=${user.employeeId} and valid_from is null and valid_until is null order by weekday`,
        db()`select id,weekday,valid_from,valid_until,available_from,available_to,available,note from availability_rules where organization_id=${user.organizationId} and employee_id=${user.employeeId} and valid_from between ${first}::date and ${last}::date and valid_until=valid_from order by valid_from`,
      ]);
      return NextResponse.json({ weekly, dates });
    }
    return NextResponse.json(await db()`select * from availability_rules where organization_id=${user.organizationId} and employee_id=${user.employeeId} and valid_from is null and valid_until is null order by weekday`);
  } catch (error) {
    return jsonError(error, req);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user?.employeeId) return NextResponse.json({ error: "Employee profile required" }, { status: 403 });
    const body = await readJsonObject(req);
    const mode = body.mode === "MONTH" ? "MONTH" : "WEEKLY";
    if (!Array.isArray(body.rules)) throw new ApiError(400, "rules must be an array");
    const rules = body.rules.map(normalizeRule);

    if (mode === "MONTH") {
      const month = typeof body.month === "string" ? body.month : "";
      const { first, last } = monthBounds(month);
      const expectedDates = new Set<string>();
      for (const rule of rules) {
        if (typeof rule.date !== "string" || !DATE_PATTERN.test(rule.date) || !rule.date.startsWith(`${month}-`)) throw new ApiError(400, "Each monthly rule must belong to the selected month");
        const parsed = new Date(`${rule.date}T00:00:00Z`);
        if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== rule.date) throw new ApiError(400, "Invalid availability date");
        if (expectedDates.has(rule.date)) throw new ApiError(400, "Duplicate availability date");
        expectedDates.add(rule.date);
      }
      await db().begin(async tx => {
        await tx`delete from availability_rules where organization_id=${user.organizationId} and employee_id=${user.employeeId} and valid_from between ${first}::date and ${last}::date and valid_until=valid_from`;
        for (const rule of rules) {
          const date = rule.date as string;
          const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
          const available = rule.available !== false;
          const availableFrom: string | null = available ? rule.availableFrom ?? null : null;
          const availableTo: string | null = available ? rule.availableTo ?? null : null;
          const note: string | null = rule.note ?? null;
          await tx`insert into availability_rules(organization_id,employee_id,weekday,available_from,available_to,available,valid_from,valid_until,note) values(${user.organizationId},${user.employeeId},${weekday},${availableFrom},${availableTo},${available},${date}::date,${date}::date,${note})`;
        }
      });
      await writeAudit({ organizationId: user.organizationId, actorUserId: user.userId, action: "MONTHLY_AVAILABILITY_UPDATED", entityType: "employee", entityId: user.employeeId, after: { month, rules } });
      return NextResponse.json({ ok: true });
    }

    const weeklyRules = rules.map(rule => {
      const weekday = rule.weekday;
      if (typeof weekday !== "number" || !Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
        throw new ApiError(400, "weekday must be between 0 and 6");
      }
      const available = rule.available !== false;
      return {
        weekday,
        availableFrom: available ? rule.availableFrom ?? null : null,
        availableTo: available ? rule.availableTo ?? null : null,
        available,
        note: rule.note ?? null,
      };
    });
    await db().begin(async tx => {
      await tx`delete from availability_rules where organization_id=${user.organizationId} and employee_id=${user.employeeId} and valid_from is null and valid_until is null`;
      for (const rule of weeklyRules) {
        await tx`insert into availability_rules(organization_id,employee_id,weekday,available_from,available_to,available,note) values(${user.organizationId},${user.employeeId},${rule.weekday},${rule.availableFrom},${rule.availableTo},${rule.available},${rule.note})`;
      }
    });
    await writeAudit({ organizationId: user.organizationId, actorUserId: user.userId, action: "AVAILABILITY_UPDATED", entityType: "employee", entityId: user.employeeId, after: weeklyRules });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, req);
  }
}
