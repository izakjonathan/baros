import { NextResponse } from "next/server";
import { mapOperationArticle, ownerCanManageOperation, parseOperationBlocks } from "@/features/operation/content";
import type { OperationDailyTask, OperationModuleState, OperationNeed } from "@/features/operation/types";
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

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const params = new URL(request.url).searchParams;
    const today = isoDate(params.get("date") || new Date().toISOString().slice(0, 10), "date");
    const weekday = weekdayFromDate(today);
    const [articles, tasks, needs] = await Promise.all([
      db()<Array<Record<string, unknown>>>`
        select id,kind,category,title,description,content,published,updated_at
        from operation_articles
        where organization_id=${user.organizationId} and (published=true or ${ownerCanManageOperation(user.role)})
        order by kind,category,sort_order,updated_at desc`,
      db()<Array<Record<string, unknown>>>`
        select t.id,t.weekday,t.title,t.description,(c.completed_at is not null) completed
        from operation_daily_tasks t
        left join operation_daily_task_completions c
          on c.task_id=t.id and c.service_date=${today}::date and c.organization_id=t.organization_id
        where t.organization_id=${user.organizationId}
          and (${user.locationId}::uuid is null or t.location_id is null or t.location_id=${user.locationId})
          and t.weekday=${weekday}
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
    ]);
    const state: OperationModuleState = {
      userRole: user.role,
      canManageContent: ownerCanManageOperation(user.role),
      today,
      handbook: articles.filter(article => article.kind === "HANDBOOK").map(mapOperationArticle),
      news: articles.filter(article => article.kind === "NEWS").map(mapOperationArticle),
      dailyTasks: tasks.map((task): OperationDailyTask => ({
        id: String(task.id),
        weekday: Number(task.weekday),
        title: String(task.title),
        description: String(task.description || ""),
        completed: Boolean(task.completed),
      })),
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
      const weekday = finiteNumber(body.weekday, "weekday", { min: 0, max: 6, integer: true });
      const title = requiredString(body, "title", 160);
      const description = requiredString(body, "description", 300);
      const [row] = await db()<Array<Record<string, unknown>>>`
        insert into operation_daily_tasks(organization_id,location_id,weekday,title,description,created_by,updated_by)
        values(${user.organizationId},${user.locationId},${weekday},${title},${description},${user.userId},${user.userId})
        returning id,weekday,title,description,false completed`;
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
        const weekday = body.weekday == null ? null : finiteNumber(body.weekday, "weekday", { min: 0, max: 6, integer: true });
        const title = optionalString(body, "title", 160);
        const description = optionalString(body, "description", 300);
        const [row] = await db()<Array<Record<string, unknown>>>`
          update operation_daily_tasks
          set weekday=coalesce(${weekday},weekday),
              title=coalesce(${title},title),
              description=coalesce(${description},description),
              updated_by=${user.userId},
              updated_at=now()
          where id=${id} and organization_id=${user.organizationId}
          returning id,weekday,title,description`;
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
    return jsonError(error, request);
  }
}
