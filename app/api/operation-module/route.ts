import { NextResponse } from "next/server";
import { defaultOperationState } from "@/features/operation/default-content";
import { mapOperationArticle, ownerCanManageOperation, parseOperationBlocks } from "@/features/operation/content";
import { isOperationTaskDue, type OperationDailyTask, type OperationModuleState, type OperationNeed } from "@/features/operation/types";
import { db } from "@/lib/db/client";
import { ApiError, enumValue, finiteNumber, isoDate, jsonError, optionalString, readJsonObject, requiredString, uuid } from "@/lib/http";
import { getSessionUser } from "@/lib/auth/session";

function requireOwner(role: string) {
  if (!ownerCanManageOperation(role)) throw new ApiError(403, "Owner or Admin permission is required");
}

async function requireApiUser() {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Authentication required");
  return user;
}

function weekdayFromDate(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

function isOperationSchemaUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: unknown; message?: unknown };
  const code = String(record.code || "");
  const message = String(record.message || "");
  return (code === "42P01" || code === "42704") && /operation_(articles|daily_tasks|daily_task_completions|needs|article_kind|need_status)/i.test(message)
    || code === "42703" && /(task_type|priority|due_time|reminder_minutes|assigned_employee_id)/i.test(message);
}

function operationMigrationRequired() {
  return NextResponse.json(
    { error: "Operation database migration is required before changes can be saved.", storageStatus: "migration-required" },
    { status: 503, headers: { "cache-control": "no-store", "x-operation-storage": "migration-required" } },
  );
}

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const params = new URL(request.url).searchParams;
    const today = isoDate(params.get("date") || new Date().toISOString().slice(0, 10), "date");
    const [articles, tasks, needs, assignees] = await Promise.all([
      db()<Array<Record<string, unknown>>>`
        select id,kind,category,title,description,content,published,updated_at
        from operation_articles
        where organization_id=${user.organizationId} and (published=true or ${ownerCanManageOperation(user.role)})
        order by kind,category,sort_order,updated_at desc`,
      db()<Array<Record<string, unknown>>>`
        select t.id,t.weekday,t.title,t.description,t.due_date,t.repeat_unit,t.repeat_interval,t.repeat_end_date,t.task_type,t.priority,t.due_time,t.reminder_minutes,t.assigned_employee_id,
               (a.first_name||' '||a.last_name) assigned_employee_name,
               (completed_employee.first_name||' '||completed_employee.last_name) completed_by_name,
               (c.completed_at is not null) completed
        from operation_daily_tasks t
        left join operation_daily_task_completions c
          on c.task_id=t.id and c.service_date=${today}::date and c.organization_id=t.organization_id
        left join employees a on a.id=t.assigned_employee_id and a.organization_id=t.organization_id
        left join employees completed_employee on completed_employee.user_id=c.completed_by and completed_employee.organization_id=t.organization_id
        where t.organization_id=${user.organizationId}
          and (${user.locationId}::uuid is null or t.location_id is null or t.location_id=${user.locationId})
          and t.active=true
        order by t.sort_order,t.created_at`,
      db()<Array<Record<string, unknown>>>`
        select id,title,note,status,created_at
        from operation_needs
        where organization_id=${user.organizationId}
          and (${user.locationId}::uuid is null or location_id is null or location_id=${user.locationId})
          and status='NEEDED'
        order by created_at desc
        limit 100`,
      db()<Array<Record<string, unknown>>>`
        select e.id,e.first_name||' '||e.last_name name
        from employees e
        where e.organization_id=${user.organizationId} and e.active=true
          and (${user.locationId}::uuid is null or exists(select 1 from employee_locations el where el.employee_id=e.id and el.location_id=${user.locationId}))
        order by e.first_name,e.last_name`,
    ]);
    const state: OperationModuleState = {
      userRole: user.role,
      canManageContent: ownerCanManageOperation(user.role),
      storageStatus: "ready",
      today,
      handbook: articles.filter(article => article.kind === "HANDBOOK").map(mapOperationArticle),
      news: articles.filter(article => article.kind === "NEWS").map(mapOperationArticle),
      dailyTasks: tasks.map((task): OperationDailyTask => ({
        id: String(task.id),
        weekday: Number(task.weekday),
        title: String(task.title),
        description: String(task.description || ""),
        dueDate: String(task.due_date),
        repeatUnit: String(task.repeat_unit) as OperationDailyTask["repeatUnit"],
        repeatInterval: Number(task.repeat_interval),
        repeatEndDate: task.repeat_end_date == null ? null : String(task.repeat_end_date),
        dueTime: task.due_time == null ? null : String(task.due_time).slice(0, 5),
        reminderMinutes: task.reminder_minutes == null ? null : Number(task.reminder_minutes),
        priority: String(task.priority) as OperationDailyTask["priority"],
        taskType: String(task.task_type) as OperationDailyTask["taskType"],
        assignedEmployeeId: task.assigned_employee_id == null ? null : String(task.assigned_employee_id),
        assignedEmployeeName: task.assigned_employee_name == null ? null : String(task.assigned_employee_name),
        completedByName: task.completed_by_name == null ? null : String(task.completed_by_name),
        completed: Boolean(task.completed),
      })).filter(task => isOperationTaskDue(task, today)),
      assignees: assignees.map(assignee => ({ id: String(assignee.id), name: String(assignee.name) })),
      needs: needs.map((need): OperationNeed => ({
        id: String(need.id),
        title: String(need.title),
        note: need.note == null ? null : String(need.note),
        status: String(need.status) === "ORDERED" ? "ORDERED" : "NEEDED",
        createdAt: String(need.created_at),
      })),
    };
    return NextResponse.json(state, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (isOperationSchemaUnavailable(error)) {
      const user = await getSessionUser();
      if (user) {
        return NextResponse.json({
          ...defaultOperationState,
          userRole: user.role,
          canManageContent: ownerCanManageOperation(user.role),
          storageStatus: "migration-required",
          today: new Date().toISOString().slice(0, 10),
        } satisfies OperationModuleState, { headers: { "cache-control": "no-store", "x-operation-storage": "migration-required" } });
      }
    }
    return jsonError(error, request);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await readJsonObject(request, 128_000);
    const entity = enumValue(body.entity, "entity", ["article", "dailyTask", "need"] as const);

    if (entity === "article") {
      requireOwner(user.role);
      const kind = enumValue(body.kind, "kind", ["HANDBOOK", "NEWS"] as const);
      const category = requiredString(body, "category", 80);
      const title = requiredString(body, "title", 160);
      const description = requiredString(body, "description", 300);
      const content = parseOperationBlocks(body.content);
      if (!content.length) throw new ApiError(400, "content must contain at least one block");
      const [row] = await db()<Array<Record<string, unknown>>>`
        insert into operation_articles(organization_id,kind,category,title,description,content,created_by,updated_by)
        values(${user.organizationId},${kind},${category},${title},${description},${JSON.stringify(content)}::jsonb,${user.userId},${user.userId})
        returning id,kind,category,title,description,content,published,updated_at`;
      return NextResponse.json(mapOperationArticle(row), { status: 201 });
    }

    if (entity === "dailyTask") {
      requireOwner(user.role);
      const dueDate = isoDate(body.dueDate || new Date().toISOString().slice(0, 10), "dueDate");
      const weekday = weekdayFromDate(dueDate);
      const repeatUnit = enumValue(body.repeatUnit || "NONE", "repeatUnit", ["NONE", "DAY", "WEEK", "MONTH", "YEAR"] as const);
      const repeatInterval = finiteNumber(body.repeatInterval ?? 1, "repeatInterval", { min: 1, max: 365, integer: true });
      const repeatEndDate = body.repeatEndDate == null || body.repeatEndDate === "" ? null : isoDate(body.repeatEndDate, "repeatEndDate");
      const dueTime = body.dueTime == null || body.dueTime === "" ? null : requiredString(body, "dueTime", 5);
      if (dueTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(dueTime)) throw new ApiError(400, "dueTime must be HH:MM");
      const reminderMinutes = body.reminderMinutes == null || body.reminderMinutes === "" ? null : finiteNumber(body.reminderMinutes, "reminderMinutes", { min: 0, max: 10080, integer: true });
      const priority = enumValue(body.priority || "NORMAL", "priority", ["LOW", "NORMAL", "HIGH"] as const);
      const taskType = enumValue(body.taskType || "SERVICE", "taskType", ["OPENING", "SERVICE", "CLOSING", "MAINTENANCE", "ADMIN"] as const);
      const assignedEmployeeId = body.assignedEmployeeId == null || body.assignedEmployeeId === "" ? null : uuid(body.assignedEmployeeId, "assignedEmployeeId");
      if (assignedEmployeeId) {
        const [employee] = await db()`select id from employees where id=${assignedEmployeeId} and organization_id=${user.organizationId} and active=true`;
        if (!employee) throw new ApiError(400, "Assigned employee is not active in this organization");
      }
      if (repeatEndDate && repeatEndDate < dueDate) throw new ApiError(400, "Repeat end date must be after the first task date");
      const title = requiredString(body, "title", 160);
      const description = requiredString(body, "description", 300);
      const [row] = await db()<Array<Record<string, unknown>>>`
        insert into operation_daily_tasks(organization_id,location_id,weekday,title,description,due_date,repeat_unit,repeat_interval,repeat_end_date,task_type,priority,due_time,reminder_minutes,assigned_employee_id,created_by,updated_by)
        values(${user.organizationId},${user.locationId},${weekday},${title},${description},${dueDate}::date,${repeatUnit},${repeatInterval},${repeatEndDate}::date,${taskType},${priority},${dueTime}::time,${reminderMinutes},${assignedEmployeeId},${user.userId},${user.userId})
        returning id,weekday,title,description,due_date,repeat_unit,repeat_interval,repeat_end_date,task_type,priority,due_time,reminder_minutes,assigned_employee_id,false completed`;
      return NextResponse.json(row, { status: 201 });
    }

    const title = requiredString(body, "title", 160);
    const note = optionalString(body, "note", 400);
    const [row] = await db()<Array<Record<string, unknown>>>`
      insert into operation_needs(organization_id,location_id,title,note,created_by)
      values(${user.organizationId},${user.locationId},${title},${note},${user.userId})
      returning id,title,note,status,created_at`;
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    if (isOperationSchemaUnavailable(error)) return operationMigrationRequired();
    return jsonError(error, request);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await readJsonObject(request, 128_000);
    const entity = enumValue(body.entity, "entity", ["article", "dailyTask", "need"] as const);
    const id = uuid(body.id, "id");

    if (entity === "article") {
      requireOwner(user.role);
      const kind = body.kind == null ? null : enumValue(body.kind, "kind", ["HANDBOOK", "NEWS"] as const);
      const category = optionalString(body, "category", 80);
      const title = optionalString(body, "title", 160);
      const description = optionalString(body, "description", 300);
      const content = body.content == null ? null : parseOperationBlocks(body.content);
      if (body.content != null && !content?.length) throw new ApiError(400, "content must contain at least one block");
      const [row] = await db()<Array<Record<string, unknown>>>`
        update operation_articles
        set kind=coalesce(${kind},kind),
            category=coalesce(${category},category),
            title=coalesce(${title},title),
            description=coalesce(${description},description),
            content=coalesce(${content == null ? null : JSON.stringify(content)}::jsonb,content),
            updated_by=${user.userId},
            updated_at=now()
        where id=${id} and organization_id=${user.organizationId}
        returning id,kind,category,title,description,content,published,updated_at`;
      if (!row) throw new ApiError(404, "Article not found");
      return NextResponse.json(mapOperationArticle(row));
    }

    if (entity === "dailyTask") {
      const action = enumValue(body.action || "complete", "action", ["complete", "edit"] as const);
      if (action === "edit") {
        requireOwner(user.role);
        const dueDate = body.dueDate == null ? null : isoDate(body.dueDate, "dueDate");
        const weekday = dueDate == null ? null : weekdayFromDate(dueDate);
        const repeatUnit = body.repeatUnit == null ? null : enumValue(body.repeatUnit, "repeatUnit", ["NONE", "DAY", "WEEK", "MONTH", "YEAR"] as const);
        const repeatInterval = body.repeatInterval == null ? null : finiteNumber(body.repeatInterval, "repeatInterval", { min: 1, max: 365, integer: true });
        const dueTime = body.dueTime === undefined ? null : body.dueTime === "" || body.dueTime === null ? null : requiredString(body, "dueTime", 5);
        if (dueTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(dueTime)) throw new ApiError(400, "dueTime must be HH:MM");
        const reminderMinutes = body.reminderMinutes === undefined ? null : body.reminderMinutes === "" || body.reminderMinutes === null ? null : finiteNumber(body.reminderMinutes, "reminderMinutes", { min: 0, max: 10080, integer: true });
        const priority = body.priority == null ? null : enumValue(body.priority, "priority", ["LOW", "NORMAL", "HIGH"] as const);
        const taskType = body.taskType == null ? null : enumValue(body.taskType, "taskType", ["OPENING", "SERVICE", "CLOSING", "MAINTENANCE", "ADMIN"] as const);
        const assignedEmployeeId = body.assignedEmployeeId === undefined ? null : body.assignedEmployeeId === "" || body.assignedEmployeeId === null ? null : uuid(body.assignedEmployeeId, "assignedEmployeeId");
        if (assignedEmployeeId) {
          const [employee] = await db()`select id from employees where id=${assignedEmployeeId} and organization_id=${user.organizationId} and active=true`;
          if (!employee) throw new ApiError(400, "Assigned employee is not active in this organization");
        }
        const updateRepeatEndDate = body.repeatEndDate !== undefined;
        const repeatEndDate = !updateRepeatEndDate || body.repeatEndDate === "" || body.repeatEndDate === null ? null : isoDate(body.repeatEndDate, "repeatEndDate");
        const title = optionalString(body, "title", 160);
        const description = optionalString(body, "description", 300);
        const [row] = await db()<Array<Record<string, unknown>>>`
          update operation_daily_tasks
          set weekday=coalesce(${weekday},weekday),
              title=coalesce(${title},title),
              description=coalesce(${description},description),
              due_date=coalesce(${dueDate}::date,due_date),
              repeat_unit=coalesce(${repeatUnit},repeat_unit),
              repeat_interval=coalesce(${repeatInterval},repeat_interval),
              repeat_end_date=case when ${updateRepeatEndDate} then ${repeatEndDate}::date else repeat_end_date end,
              due_time=case when ${body.dueTime !== undefined} then ${dueTime}::time else due_time end,
              reminder_minutes=case when ${body.reminderMinutes !== undefined} then ${reminderMinutes} else reminder_minutes end,
              priority=coalesce(${priority},priority),
              task_type=coalesce(${taskType},task_type),
              assigned_employee_id=case when ${body.assignedEmployeeId !== undefined} then ${assignedEmployeeId}::uuid else assigned_employee_id end,
              updated_by=${user.userId},
              updated_at=now()
          where id=${id} and organization_id=${user.organizationId}
          returning id,weekday,title,description,due_date,repeat_unit,repeat_interval,repeat_end_date,task_type,priority,due_time,reminder_minutes,assigned_employee_id`;
        if (!row) throw new ApiError(404, "Daily task not found");
        return NextResponse.json({ ...row, completed: false });
      }
      const serviceDate = isoDate(body.date || new Date().toISOString().slice(0, 10), "date");
      const completed = body.completed !== false;
      const [task] = await db()<Array<{ id: string }>>`
        select id from operation_daily_tasks
        where id=${id} and organization_id=${user.organizationId}
          and (${user.locationId}::uuid is null or location_id is null or location_id=${user.locationId})
          and active=true`;
      if (!task) throw new ApiError(404, "Daily task not found");
      if (completed) {
        await db()`
          insert into operation_daily_task_completions(task_id,service_date,organization_id,completed_by)
          values(${id},${serviceDate}::date,${user.organizationId},${user.userId})
          on conflict(task_id,service_date) do update set completed_by=excluded.completed_by,completed_at=now()`;
      } else {
        await db()`delete from operation_daily_task_completions where task_id=${id} and service_date=${serviceDate}::date and organization_id=${user.organizationId}`;
      }
      return NextResponse.json({ id, completed });
    }

    const status = enumValue(body.status || "ORDERED", "status", ["NEEDED", "ORDERED"] as const);
    const [row] = await db()<Array<Record<string, unknown>>>`
      update operation_needs
      set status=${status},
          ordered_by=case when ${status}='ORDERED' then ${user.userId} else null end,
          ordered_at=case when ${status}='ORDERED' then now() else null end,
          updated_at=now()
      where id=${id} and organization_id=${user.organizationId}
        and (${user.locationId}::uuid is null or location_id is null or location_id=${user.locationId})
      returning id,title,note,status,created_at`;
    if (!row) throw new ApiError(404, "Needed item not found");
    return NextResponse.json(row);
  } catch (error) {
    if (isOperationSchemaUnavailable(error)) return operationMigrationRequired();
    return jsonError(error, request);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireApiUser();
    requireOwner(user.role);
    const params = new URL(request.url).searchParams;
    const entity = enumValue(params.get("entity"), "entity", ["article", "dailyTask", "need"] as const);
    const id = uuid(params.get("id"), "id");
    if (entity === "article") {
      const [row] = await db()`delete from operation_articles where id=${id} and organization_id=${user.organizationId} returning id`;
      if (!row) throw new ApiError(404, "Article not found");
    } else if (entity === "dailyTask") {
      const [row] = await db()`update operation_daily_tasks set active=false,updated_by=${user.userId},updated_at=now() where id=${id} and organization_id=${user.organizationId} returning id`;
      if (!row) throw new ApiError(404, "Daily task not found");
    } else {
      const [row] = await db()`delete from operation_needs where id=${id} and organization_id=${user.organizationId} returning id`;
      if (!row) throw new ApiError(404, "Needed item not found");
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isOperationSchemaUnavailable(error)) return operationMigrationRequired();
    return jsonError(error, request);
  }
}
