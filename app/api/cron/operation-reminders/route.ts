import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db()<Array<{ task_id: string; service_date: string; organization_id: string; user_id: string; title: string; due_time: string; reminder_minutes: number }>>`
    with due_tasks as (
      select t.id task_id,t.organization_id,t.title,t.due_time,t.reminder_minutes,current_date service_date,e.user_id
      from operation_daily_tasks t
      join employees e on e.id=t.assigned_employee_id and e.organization_id=t.organization_id and e.active and e.user_id is not null
      where t.active and t.due_time is not null and t.reminder_minutes is not null
        and (t.repeat_unit='NONE' and t.due_date=current_date
          or t.repeat_unit='DAY' and mod(current_date-t.due_date,t.repeat_interval)=0
          or t.repeat_unit='WEEK' and extract(dow from current_date)=t.weekday and mod((current_date-t.due_date)/7,t.repeat_interval)=0
          or t.repeat_unit='MONTH' and extract(day from current_date)=extract(day from t.due_date) and mod((extract(year from current_date)-extract(year from t.due_date))*12+extract(month from current_date)-extract(month from t.due_date),t.repeat_interval)=0
          or t.repeat_unit='YEAR' and extract(month from current_date)=extract(month from t.due_date) and extract(day from current_date)=extract(day from t.due_date) and mod(extract(year from current_date)-extract(year from t.due_date),t.repeat_interval)=0)
        and (t.repeat_end_date is null or current_date<=t.repeat_end_date)
    )
    select * from due_tasks where now() >= current_date + due_time - make_interval(mins => reminder_minutes) and now() < current_date + due_time - make_interval(mins => reminder_minutes) + interval '15 minutes'`;
  let sent = 0;
  for (const row of rows) {
    const [reminder] = await db()<Array<{ task_id: string }>>`
      insert into operation_task_reminders(task_id,service_date,organization_id,reminder_at,notified_at)
      values(${row.task_id},${row.service_date}::date,${row.organization_id},current_date+${row.due_time}::time-make_interval(mins=>${row.reminder_minutes}),now())
      on conflict(task_id,service_date) do nothing returning task_id`;
    if (!reminder) continue;
    await db()`insert into notifications(organization_id,user_id,type,title,body,href) values(${row.organization_id},${row.user_id},'OPERATION_TASK_REMINDER',${`Task reminder: ${row.title}`},${`Due at ${String(row.due_time).slice(0, 5)}`},'/operation')`;
    sent += 1;
  }
  return NextResponse.json({ ok: true, sent });
}
