import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, jsonError, readJsonObject, uuid } from "@/lib/http";

const managerRoles = ["OWNER", "ADMIN", "MANAGER"] as const;

export async function GET(request: Request) {
  try {
    const user = await requireUser([...managerRoles]);
    const locationId = uuid(new URL(request.url).searchParams.get("locationId"), "locationId");
    const [location] = await db()`select id from locations where id=${locationId} and organization_id=${user.organizationId} and active=true`;
    if (!location) throw new ApiError(404, "Location not found");
    const [settings] = await db()`
      select location_id, allow_mobile_clock, allow_kiosk_clock, allow_unscheduled_clock,
             require_location_check, early_clock_in_minutes, late_clock_out_minutes,
             rounding_minutes, auto_approve_within_minutes
      from time_clock_settings
      where organization_id=${user.organizationId} and location_id=${locationId}
    `;
    return NextResponse.json(settings || {
      location_id: locationId,
      allow_mobile_clock: true,
      allow_kiosk_clock: true,
      allow_unscheduled_clock: false,
      require_location_check: false,
      early_clock_in_minutes: 15,
      late_clock_out_minutes: 60,
      rounding_minutes: 0,
      auto_approve_within_minutes: null,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser([...managerRoles]);
    const body = await readJsonObject(request);
    const locationId = uuid(body.locationId, "locationId");
    const [location] = await db()`select id from locations where id=${locationId} and organization_id=${user.organizationId} and active=true`;
    if (!location) throw new ApiError(404, "Location not found");

    const allowMobile = Boolean(body.allowMobileClock);
    const allowKiosk = Boolean(body.allowKioskClock);
    const allowUnscheduled = Boolean(body.allowUnscheduledClock);
    const requireLocation = Boolean(body.requireLocationCheck);
    const early = Math.max(0, Math.min(240, Number(body.earlyClockInMinutes ?? 15)));
    const late = Math.max(0, Math.min(720, Number(body.lateClockOutMinutes ?? 60)));
    const rounding = Number(body.roundingMinutes ?? 0);
    if (![0, 5, 6, 10, 15].includes(rounding)) throw new ApiError(400, "Invalid rounding interval");
    const autoApproveRaw = body.autoApproveWithinMinutes;
    const autoApprove = autoApproveRaw === null || autoApproveRaw === "" || typeof autoApproveRaw === "undefined"
      ? null
      : Math.max(0, Math.min(240, Number(autoApproveRaw)));

    const rows = await db().begin(async (sql) => {
      const result = await sql`
        insert into time_clock_settings(
          location_id, organization_id, allow_mobile_clock, allow_kiosk_clock,
          allow_unscheduled_clock, require_location_check, early_clock_in_minutes,
          late_clock_out_minutes, rounding_minutes, auto_approve_within_minutes, updated_at
        ) values(
          ${locationId}, ${user.organizationId}, ${allowMobile}, ${allowKiosk},
          ${allowUnscheduled}, ${requireLocation}, ${early}, ${late}, ${rounding}, ${autoApprove}, now()
        )
        on conflict(location_id) do update set
          allow_mobile_clock=excluded.allow_mobile_clock,
          allow_kiosk_clock=excluded.allow_kiosk_clock,
          allow_unscheduled_clock=excluded.allow_unscheduled_clock,
          require_location_check=excluded.require_location_check,
          early_clock_in_minutes=excluded.early_clock_in_minutes,
          late_clock_out_minutes=excluded.late_clock_out_minutes,
          rounding_minutes=excluded.rounding_minutes,
          auto_approve_within_minutes=excluded.auto_approve_within_minutes,
          updated_at=now()
        where time_clock_settings.organization_id=${user.organizationId}
        returning *
      `;
      await sql`
        insert into audit_logs(organization_id, location_id, actor_user_id, action, entity_type, entity_id, after_data)
        values(${user.organizationId}, ${locationId}, ${user.userId}, 'TIME_CLOCK_SETTINGS_UPDATED', 'time_clock_settings', ${locationId}, ${JSON.stringify(result[0])}::jsonb)
      `;
      return result;
    });
    return NextResponse.json(rows[0]);
  } catch (error) {
    return jsonError(error);
  }
}
