"use client";

import Image from "next/image";
import { ArrowLeft, Bold, CalendarDays, Check, CheckSquare, ChevronLeft, ChevronRight, Clock3, ImagePlus, Italic, Link2, List, ListOrdered, LoaderCircle, MoreHorizontal, Palette, Plus, Redo2, Repeat2, ShoppingBasket, Square, Trash2, Underline, Undo2, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import styles from "./OperationModule.module.css";
import { operationThemeCustomProperties, type UiTheme } from "@/lib/ui-theme-shared";
import type { OperationArticle, OperationArticleKind, OperationContentBlock, OperationDailyTask, OperationModuleState, OperationNeed, OperationRichTextDelta, OperationRichTextOp, OperationTaskAssignmentScope, OperationTaskPriority, OperationTaskRepeatUnit, OperationTaskType, OperationTiptapDocument, OperationTiptapNode } from "./types";

type View = "home" | "handbook" | "tasks" | "needs";
type DraftArticle = { id?: string; kind: OperationArticleKind; category: string; title: string; description: string; document: OperationTiptapDocument };
type PreparedOperationImages = { preview: File; detail: File; width: number; height: number };

const OperationImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fullSrc: { default: null },
      width: { default: null },
      height: { default: null },
    };
  },
});

const migrationMessage = "Operation storage is not ready yet. Run the database migration action, then reload this page.";
const operationArticleHref = (articleId: string) => `operation://article/${articleId}`;

function operationArticleIdFromHref(href: string) {
  return /^operation:\/\/article\/([0-9a-f-]{36})$/i.exec(href)?.[1] || null;
}

function draftFromArticle(article?: OperationArticle, kind: OperationArticleKind = "HANDBOOK"): DraftArticle {
  return { id: article?.id, kind, category: article?.category || "General", title: article?.title || "", description: article?.description || "", document: documentFromBlocks(article?.content || []) };
}

function blocksFromDraft(draft: DraftArticle): OperationContentBlock[] {
  return [{ type: "title", text: draft.title }, { type: "tiptap", document: draft.document }];
}

function emptyDocument(): OperationTiptapDocument {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

function documentFromBlocks(blocks: OperationContentBlock[]): OperationTiptapDocument {
  const structured = blocks.find((block): block is Extract<OperationContentBlock, { type: "tiptap" }> => block.type === "tiptap");
  if (structured) return structured.document;
  const richText = blocks.find((block): block is Extract<OperationContentBlock, { type: "richText" }> => block.type === "richText");
  if (richText) return documentFromDelta(richText.delta);
  const content = blocks.flatMap((block): OperationTiptapNode[] => {
    if (block.type === "title" || block.type === "articleLink") return [];
    if (block.type === "h1") return [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: block.text }] }];
    if (block.type === "h2") return [{ type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: block.text }] }];
    if (block.type === "body") return [{ type: "paragraph", content: [{ type: "text", text: block.text }] }];
    if (block.type === "bullets" || block.type === "numbered") return [{ type: block.type === "bullets" ? "bulletList" : "orderedList", content: block.items.map(item => ({ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: item }] }] })) }];
    if (block.type === "image") return [{ type: "image", attrs: { src: block.src, alt: block.alt } }];
    return [];
  });
  return content.length ? { type: "doc", content } : emptyDocument();
}

function documentFromDelta(delta: OperationRichTextDelta): OperationTiptapDocument {
  const content = deltaToLines(delta).flatMap((line): OperationTiptapNode[] => {
    if (line.image) return [{ type: "image", attrs: { src: line.image, alt: "Operation article image" } }];
    const inline = line.segments.flatMap((segment): OperationTiptapNode[] => {
      const marks: NonNullable<OperationTiptapNode["marks"]> = [];
      if (segment.attributes?.bold) marks.push({ type: "bold" });
      if (segment.attributes?.italic) marks.push({ type: "italic" });
      if (segment.attributes?.underline) marks.push({ type: "underline" });
      if (typeof segment.attributes?.link === "string") marks.push({ type: "link", attrs: { href: segment.attributes.link } });
      return segment.text ? [{ type: "text", text: segment.text, ...(marks.length ? { marks } : {}) }] : [];
    });
    const paragraph = { type: "paragraph", ...(inline.length ? { content: inline } : {}) } satisfies OperationTiptapNode;
    if (line.attributes?.list === "bullet" || line.attributes?.list === "ordered") return [{ type: line.attributes.list === "bullet" ? "bulletList" : "orderedList", content: [{ type: "listItem", content: [paragraph] }] }];
    const header = normalizeHeader(line.attributes?.header);
    return header ? [{ ...paragraph, type: "heading", attrs: { level: header === 1 ? 2 : 3 } }] : [paragraph];
  });
  return content.length ? { type: "doc", content } : emptyDocument();
}

function hasRichTextContent(document: OperationTiptapDocument) {
  return JSON.stringify(document).replace(/[{}\[\]",:\s]/g, "").length > 3 && document.content.some(node => node.type === "image" || Boolean(node.content?.some(child => Boolean(child.text?.trim() || child.content?.length))));
}

async function responseMessage(response: Response, fallback: string) {
  const failure: unknown = await response.json().catch(() => null);
  return typeof failure === "object" && failure !== null && "error" in failure && typeof failure.error === "string" ? failure.error : fallback;
}

export function OperationModule({ initialState, initialTheme, devMode, publicMode = false, publicUrl, themeRefreshUrl, operationApiUrl }: { initialState: OperationModuleState; initialTheme: UiTheme; devMode: boolean; publicMode?: boolean; publicUrl?: string; themeRefreshUrl?: string; operationApiUrl?: string }) {
  const [state, setState] = useState(initialState);
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [readerStack, setReaderStack] = useState<OperationArticle[]>([]);
  const [draft, setDraft] = useState<DraftArticle>(() => draftFromArticle(undefined, "HANDBOOK"));
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState(initialState.today);
  const [selectedTaskDate, setSelectedTaskDate] = useState(initialState.today);
  const [taskRepeatUnit, setTaskRepeatUnit] = useState<OperationTaskRepeatUnit>("NONE");
  const [taskRepeatInterval, setTaskRepeatInterval] = useState(1);
  const [taskRepeatEndDate, setTaskRepeatEndDate] = useState("");
  const [taskType, setTaskType] = useState<OperationTaskType>("SERVICE");
  const [taskPriority, setTaskPriority] = useState<OperationTaskPriority>("NORMAL");
  const [taskDueTime, setTaskDueTime] = useState("");
  const [taskReminderMinutes, setTaskReminderMinutes] = useState("");
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [taskAssignmentScope, setTaskAssignmentScope] = useState<OperationTaskAssignmentScope>("EVERYONE");
  const [taskChecklistText, setTaskChecklistText] = useState("");
  const [needTitle, setNeedTitle] = useState("");
  const [needQuantity, setNeedQuantity] = useState("");
  const [needSupplier, setNeedSupplier] = useState("");
  const [needPriority, setNeedPriority] = useState<OperationTaskPriority>("NORMAL");
  const [needNote, setNeedNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [editorMessage, setEditorMessage] = useState("");
  const [taskMessage, setTaskMessage] = useState("");
  const [needMessage, setNeedMessage] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [uiTheme, setUiTheme] = useState<UiTheme>(initialTheme);
  const [savedUiTheme, setSavedUiTheme] = useState<UiTheme>(initialTheme);
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioSaving, setStudioSaving] = useState(false);
  const currentArticle = readerStack.at(-1) || null;
  const dueSoonTasks = state.dailyTasks.filter(task => {
    if (task.completed || !task.dueTime || task.reminderMinutes == null) return false;
    const now = new Date();
    const [hours, minutes] = task.dueTime.split(":").map(Number);
    const due = new Date();
    due.setHours(hours, minutes, 0, 0);
    const reminderAt = due.valueOf() - task.reminderMinutes * 60_000;
    return now.valueOf() >= reminderAt && now.valueOf() < due.valueOf() + 60 * 60_000;
  });
  const allArticles = [...state.news, ...state.handbook];
  const editorCategories = ["General", ...Array.from(new Set(allArticles.map(article => article.category).filter(categoryName => categoryName !== "General"))).sort((left, right) => left.localeCompare(right))];
  const handbookCategories = ["All", ...Array.from(new Set(state.handbook.map(article => article.category)))];
  const filteredHandbook = state.handbook.filter(article => {
    const categoryMatch = category === "All" || article.category === category;
    const text = `${article.title} ${article.description} ${article.category}`.toLowerCase();
    return categoryMatch && text.includes(query.toLowerCase());
  });
  const storageUnavailable = state.storageStatus === "migration-required" && !devMode;
  const canManageUiStudio = state.userRole === "OWNER";
  const operationEndpoint = operationApiUrl || "/api/operation-module";
  const operationUrl = (query?: string) => query ? `${operationEndpoint}${operationEndpoint.includes("?") ? "&" : "?"}${query}` : operationEndpoint;

  const refresh = useCallback(async (date: string) => {
    if (devMode) return;
    const response = await fetch(`${operationEndpoint}${operationEndpoint.includes("?") ? "&" : "?"}date=${encodeURIComponent(date)}`, { cache: "no-store" });
    const next = await response.json();
    if (response.ok) setState(next as OperationModuleState);
  }, [devMode, operationEndpoint]);

  const selectTaskDate = useCallback((date: string) => {
    setSelectedTaskDate(date);
    setTaskDueDate(date);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(selectedTaskDate); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh, selectedTaskDate]);

  useEffect(() => {
    if (devMode) return;
    const url = themeRefreshUrl || (publicMode ? null : "/api/settings/ui-theme");
    if (!url) return;
    const refreshTheme = async () => {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return;
        const next = await response.json() as UiTheme;
        if (next.canvasColor && next.inkColor && next.accentColor && next.positiveColor) {
          setUiTheme(next);
          setSavedUiTheme(next);
        }
      } catch {
        // Keep the last confirmed palette if the connection is temporarily unavailable.
      }
    };
    const interval = window.setInterval(() => { void refreshTheme(); }, 30_000);
    return () => window.clearInterval(interval);
  }, [devMode, publicMode, themeRefreshUrl]);

  useEffect(() => {
    document.documentElement.style.setProperty("--operation-canvas", uiTheme.canvasColor);
    return () => { document.documentElement.style.removeProperty("--operation-canvas"); };
  }, [uiTheme.canvasColor]);


  async function saveArticle() {
    setEditorMessage("");
    if (storageUnavailable) { setEditorMessage(migrationMessage); return false; }
    if (!draft.title.trim()) { setEditorMessage("Add an article title first."); return false; }
    if (!draft.description.trim()) { setEditorMessage("Add a short card description first."); return false; }
    if (!hasRichTextContent(draft.document)) { setEditorMessage("Add article text or an image before saving."); return false; }
    const content = blocksFromDraft(draft);
    const article: OperationArticle = {
      id: draft.id || crypto.randomUUID(),
      kind: draft.kind,
      category: draft.category.trim() || "General",
      title: draft.title.trim(),
      description: draft.description.trim(),
      content,
      published: true,
      updatedAt: new Date().toISOString(),
    };
    if (devMode) {
      setState(current => ({ ...current, handbook: article.kind === "HANDBOOK" ? upsertArticle(current.handbook, article) : current.handbook, news: article.kind === "NEWS" ? upsertArticle(current.news, article) : current.news }));
      setDraft(draftFromArticle(undefined, draft.kind));
      setEditorMessage("Article saved.");
      setEditorOpen(false);
      return true;
    }
    setSaving(true);
    try {
      const response = await fetch(operationEndpoint, { method: draft.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "article", id: draft.id, kind: article.kind, category: article.category, title: article.title, description: article.description, content: article.content }) });
      if (!response.ok) { setEditorMessage(await responseMessage(response, "Could not save article.")); return false; }
      const saved = await response.json().catch(() => article) as OperationArticle;
      const savedArticle = saved.id && saved.kind ? saved : article;
      setState(current => ({ ...current, handbook: savedArticle.kind === "HANDBOOK" ? upsertArticle(current.handbook, savedArticle) : current.handbook, news: savedArticle.kind === "NEWS" ? upsertArticle(current.news, savedArticle) : current.news }));
      setDraft(draftFromArticle(undefined, draft.kind));
      setEditorMessage("Article saved.");
      setEditorOpen(false);
      void refresh(selectedTaskDate).catch(() => undefined);
      return true;
    } catch {
      setEditorMessage("Could not save article. Check your connection and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle(article: OperationArticle) {
    if (!confirm(`Delete ${article.title}?`)) return;
    if (devMode) {
      setState(current => ({ ...current, handbook: current.handbook.filter(item => item.id !== article.id), news: current.news.filter(item => item.id !== article.id) }));
      return;
    }
    const response = await fetch(operationUrl(`entity=article&id=${encodeURIComponent(article.id)}`), { method: "DELETE" });
    if (!response.ok) setEditorMessage(await responseMessage(response, "Could not delete article."));
    await refresh(selectedTaskDate);
  }

  async function addTask() {
    setTaskMessage("");
    if (!taskTitle.trim()) return;
    if (storageUnavailable) { setTaskMessage(migrationMessage); return; }
    const assignee = taskAssignmentScope === "EMPLOYEE" ? state.assignees.find(item => item.id === taskAssigneeId) : undefined;
    if (taskAssignmentScope === "EMPLOYEE" && !assignee) { setTaskMessage("Choose the employee responsible for this task."); return; }
    const checklist = taskChecklistText.split("\n").map(label => label.trim()).filter(Boolean).slice(0, 30).map((label, index) => ({ id: `item-${index + 1}`, label, completed: false }));
    const task: OperationDailyTask = { id: crypto.randomUUID(), weekday: new Date(`${taskDueDate}T00:00:00Z`).getUTCDay(), title: taskTitle.trim(), description: taskDescription.trim(), dueDate: taskDueDate, repeatUnit: taskRepeatUnit, repeatInterval: taskRepeatInterval, repeatEndDate: taskRepeatEndDate || null, dueTime: taskDueTime || null, reminderMinutes: taskReminderMinutes === "" ? null : Math.max(0, Number(taskReminderMinutes) || 0), priority: taskPriority, taskType, assignmentScope: taskAssignmentScope, assignedEmployeeId: assignee?.id || null, assignedEmployeeName: assignee?.name || null, completedByName: null, checklist, completed: false };
    if (devMode) setState(current => ({ ...current, dailyTasks: [...current.dailyTasks, task] }));
    else {
      const response = await fetch(operationEndpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "dailyTask", title: task.title, description: task.description, dueDate: task.dueDate, repeatUnit: task.repeatUnit, repeatInterval: task.repeatInterval, repeatEndDate: task.repeatEndDate, dueTime: task.dueTime, reminderMinutes: task.reminderMinutes, priority: task.priority, taskType: task.taskType, assignmentScope: task.assignmentScope, assignedEmployeeId: task.assignedEmployeeId, checklist: task.checklist }) });
      if (!response.ok) { setTaskMessage(await responseMessage(response, "Could not add daily task.")); return; }
      await refresh(selectedTaskDate);
    }
    setTaskTitle(""); setTaskDescription(""); setTaskDueDate(selectedTaskDate); setTaskRepeatUnit("NONE"); setTaskRepeatInterval(1); setTaskRepeatEndDate(""); setTaskType("SERVICE"); setTaskPriority("NORMAL"); setTaskDueTime(""); setTaskReminderMinutes(""); setTaskAssignmentScope("EVERYONE"); setTaskAssigneeId(""); setTaskChecklistText("");
  }

  async function toggleTaskChecklist(task: OperationDailyTask, itemId: string) {
    const item = task.checklist.find(checklistItem => checklistItem.id === itemId);
    if (!item) return;
    const completed = !item.completed;
    setState(current => ({ ...current, dailyTasks: current.dailyTasks.map(currentTask => currentTask.id === task.id ? { ...currentTask, checklist: currentTask.checklist.map(checklistItem => checklistItem.id === itemId ? { ...checklistItem, completed } : checklistItem) } : currentTask) }));
    if (!devMode) {
      const response = await fetch(operationEndpoint, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "dailyTask", action: "checklist", id: task.id, itemId, date: selectedTaskDate, completed }) });
      if (!response.ok) { setTaskMessage(await responseMessage(response, "Could not update checklist.")); await refresh(selectedTaskDate); }
    }
  }

  async function saveTaskTemplate() {
    if (!taskTitle.trim() || storageUnavailable) return;
    const checklist = taskChecklistText.split("\n").map(label => label.trim()).filter(Boolean).slice(0, 30).map((label, index) => ({ id: `item-${index + 1}`, label }));
    const response = await fetch(operationEndpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "taskTemplate", title: taskTitle.trim(), description: taskDescription.trim(), taskType, priority: taskPriority, dueTime: taskDueTime || null, reminderMinutes: taskReminderMinutes === "" ? null : Number(taskReminderMinutes), checklist }) });
    if (!response.ok) { setTaskMessage(await responseMessage(response, "Could not save task template.")); return; }
    setTaskMessage("Template saved."); await refresh(selectedTaskDate);
  }

  async function toggleTask(task: OperationDailyTask) {
    setState(current => ({ ...current, dailyTasks: current.dailyTasks.map(item => item.id === task.id ? { ...item, completed: !item.completed } : item) }));
    if (!devMode) {
      const response = await fetch(operationEndpoint, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "dailyTask", id: task.id, date: selectedTaskDate, completed: !task.completed }) });
      if (!response.ok) { setTaskMessage(await responseMessage(response, "Could not update task.")); await refresh(selectedTaskDate); }
    }
  }

  async function deleteTask(task: OperationDailyTask) {
    if (!confirm(`Delete ${task.title}?`)) return;
    if (devMode) { setState(current => ({ ...current, dailyTasks: current.dailyTasks.filter(item => item.id !== task.id) })); return; }
    const response = await fetch(operationUrl(`entity=dailyTask&id=${encodeURIComponent(task.id)}`), { method: "DELETE" });
    if (!response.ok) { setTaskMessage(await responseMessage(response, "Could not delete task.")); return; }
    await refresh(selectedTaskDate);
  }

  async function addNeed() {
    setNeedMessage("");
    if (!needTitle.trim()) return;
    if (storageUnavailable) { setNeedMessage(migrationMessage); return; }
    const need: OperationNeed = { id: crypto.randomUUID(), title: needTitle.trim(), note: needNote.trim() || null, status: "NEEDED", createdAt: new Date().toISOString(), quantity: needQuantity || null, unit: null, supplier: needSupplier.trim() || null, priority: needPriority, neededBy: null, orderedAt: null, orderedByName: null };
    if (devMode) setState(current => ({ ...current, needs: [need, ...current.needs] }));
    else {
      const response = await fetch(operationEndpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "need", title: need.title, note: need.note, quantity: need.quantity, unit: need.unit, supplier: need.supplier, priority: need.priority, neededBy: need.neededBy }) });
      if (!response.ok) { setNeedMessage(await responseMessage(response, "Could not add needed item.")); return; }
      await refresh(selectedTaskDate);
    }
    setNeedTitle(""); setNeedQuantity(""); setNeedSupplier(""); setNeedPriority("NORMAL"); setNeedNote("");
  }

  async function markNeedOrdered(need: OperationNeed) {
    setState(current => ({ ...current, needs: current.needs.filter(item => item.id !== need.id) }));
    if (!devMode) {
      const response = await fetch(operationEndpoint, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "need", id: need.id, status: "ORDERED" }) });
      if (!response.ok) { setNeedMessage(await responseMessage(response, "Could not update needed item.")); await refresh(selectedTaskDate); }
    }
  }

  async function saveUiTheme(next: UiTheme) {
    setStudioSaving(true);
    try {
      if (devMode) { setUiTheme(next); setSavedUiTheme(next); setStudioOpen(false); return; }
      const response = await fetch("/api/settings/ui-theme", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
      const saved = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof saved === "object" && saved !== null && "error" in saved && typeof saved.error === "string" ? saved.error : "Could not save UI Studio colors.");
      if (!saved || typeof saved !== "object" || !("canvasColor" in saved) || !("inkColor" in saved) || !("accentColor" in saved) || !("positiveColor" in saved)) throw new Error("UI Studio returned an invalid color scheme.");
      const confirmed = saved as UiTheme;
      setUiTheme(confirmed); setSavedUiTheme(confirmed); setStudioOpen(false);
    } catch (error) { setEditorMessage(error instanceof Error ? error.message : "Could not save UI Studio colors."); }
    finally { setStudioSaving(false); }
  }

  return <div className={styles.operationShell} style={operationThemeCustomProperties(uiTheme)}>
    <header className={styles.operationHeader}>
      <nav aria-label="Operation sections">
        {(["home", "handbook", ...(publicMode ? [] : ["tasks", "needs"])] as View[]).map(item => <button key={item} type="button" aria-pressed={view === item} onClick={() => setView(item)}>{item === "home" ? "Home" : item}</button>)}
      </nav>
      {state.canManageContent && view === "home" && <button className={styles.addCircle} type="button" onClick={() => { setDraft(draftFromArticle(undefined, "NEWS")); setEditorOpen(!storageUnavailable); }} aria-label="Add news"><Plus size={20} /></button>}
      {state.canManageContent && view === "handbook" && <button className={styles.addCircle} type="button" onClick={() => { setDraft(draftFromArticle(undefined, "HANDBOOK")); setEditorOpen(!storageUnavailable); }} aria-label="Add handbook article"><Plus size={20} /></button>}
      {canManageUiStudio && <button className={styles.studioCircle} type="button" onClick={() => setStudioOpen(true)} aria-label="Open Operation UI Studio"><Palette size={18} /></button>}
    </header>
    <main className={styles.operationMain}>
      {storageUnavailable && <StorageNotice />}
      {dueSoonTasks.length > 0 && <section className={styles.duePrompt} role="status"><Clock3 size={18} /><div><strong>{dueSoonTasks.length === 1 ? "Task due soon" : `${dueSoonTasks.length} tasks due soon`}</strong><p>{dueSoonTasks.map(task => `${task.title} · ${task.dueTime}`).join(" · ")}</p></div></section>}
      {view === "home" && (publicMode ? <PublicHomeView news={state.news} openArticle={(article) => setReaderStack([article])} openHandbook={() => setView("handbook")} /> : <HomeView news={state.news} tasks={state.dailyTasks} needs={state.needs} openArticle={(article) => setReaderStack([article])} openView={setView} canManageContent={state.canManageContent} disabled={storageUnavailable} editArticle={(article) => { setDraft(draftFromArticle(article, article.kind)); setEditorMessage(storageUnavailable ? migrationMessage : ""); setEditorOpen(!storageUnavailable); }} deleteArticle={deleteArticle} />)}
      {editorMessage && !editorOpen && <p className={styles.editorMessage} role="status">{editorMessage}</p>}
      {view === "handbook" && <HandbookView articles={filteredHandbook} categories={handbookCategories} query={query} category={category} setQuery={setQuery} setCategory={setCategory} openArticle={(article) => setReaderStack([article])} canManageContent={state.canManageContent} disabled={storageUnavailable} editArticle={(article) => { setDraft(draftFromArticle(article, article.kind)); setEditorMessage(storageUnavailable ? migrationMessage : ""); setEditorOpen(!storageUnavailable); }} deleteArticle={deleteArticle} />}
      {!publicMode && view === "tasks" && <TasksView tasks={state.dailyTasks} taskTemplates={state.taskTemplates} assignees={state.assignees} selectedDate={selectedTaskDate} setSelectedDate={selectTaskDate} canManage={state.canManageTasks} taskTitle={taskTitle} taskDescription={taskDescription} taskDueDate={taskDueDate} taskRepeatUnit={taskRepeatUnit} taskRepeatInterval={taskRepeatInterval} taskRepeatEndDate={taskRepeatEndDate} taskPriority={taskPriority} taskDueTime={taskDueTime} taskReminderMinutes={taskReminderMinutes} taskAssignmentScope={taskAssignmentScope} taskAssigneeId={taskAssigneeId} taskChecklistText={taskChecklistText} setTaskTitle={setTaskTitle} setTaskDescription={setTaskDescription} setTaskDueDate={setTaskDueDate} setTaskRepeatUnit={setTaskRepeatUnit} setTaskRepeatInterval={setTaskRepeatInterval} setTaskRepeatEndDate={setTaskRepeatEndDate} setTaskType={setTaskType} setTaskPriority={setTaskPriority} setTaskDueTime={setTaskDueTime} setTaskReminderMinutes={setTaskReminderMinutes} setTaskAssignmentScope={setTaskAssignmentScope} setTaskAssigneeId={setTaskAssigneeId} setTaskChecklistText={setTaskChecklistText} saveTaskTemplate={saveTaskTemplate} addTask={addTask} toggleTask={toggleTask} toggleTaskChecklist={toggleTaskChecklist} deleteTask={deleteTask} disabled={storageUnavailable} message={taskMessage} />}
      {!publicMode && view === "needs" && <NeedsView needs={state.needs} needTitle={needTitle} needQuantity={needQuantity} needSupplier={needSupplier} needPriority={needPriority} needNote={needNote} setNeedTitle={setNeedTitle} setNeedQuantity={setNeedQuantity} setNeedSupplier={setNeedSupplier} setNeedPriority={setNeedPriority} setNeedNote={setNeedNote} addNeed={addNeed} markNeedOrdered={markNeedOrdered} disabled={storageUnavailable} message={needMessage} />}
    </main>
    {currentArticle && <Reader article={currentArticle} articles={allArticles} canGoBack={readerStack.length > 1} goBack={() => setReaderStack(stack => stack.slice(0, -1))} openArticle={(article) => setReaderStack(stack => [...stack, article])} close={() => setReaderStack([])} />}
    {editorOpen && <ArticleEditor draft={draft} categories={editorCategories} linkableArticles={allArticles} setDraft={setDraft} saveArticle={saveArticle} saving={saving} message={editorMessage} close={() => { setEditorOpen(false); setEditorMessage(""); }} />}
    {studioOpen && <OperationUiStudio theme={uiTheme} saving={studioSaving} close={() => { setUiTheme(savedUiTheme); setStudioOpen(false); }} preview={setUiTheme} save={saveUiTheme} publicUrl={publicUrl} />}
  </div>;
}

function upsertArticle(list: OperationArticle[], article: OperationArticle) {
  return list.some(item => item.id === article.id) ? list.map(item => item.id === article.id ? article : item) : [article, ...list];
}

function OperationUiStudio({ theme, saving, close, preview, save, publicUrl }: { theme: UiTheme; saving: boolean; close: () => void; preview: (theme: UiTheme) => void; save: (theme: UiTheme) => Promise<void>; publicUrl?: string }) {
  const [draft, setDraft] = useState(theme);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [close]);
  function update(key: "canvasColor" | "inkColor" | "accentColor" | "positiveColor", value: string) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (/^#[0-9a-f]{6}$/i.test(next.canvasColor) && /^#[0-9a-f]{6}$/i.test(next.inkColor) && /^#[0-9a-f]{6}$/i.test(next.accentColor) && /^#[0-9a-f]{6}$/i.test(next.positiveColor)) preview(next);
  }
  async function submit() {
    if (![draft.canvasColor, draft.inkColor, draft.accentColor, draft.positiveColor].every(value => /^#[0-9a-f]{6}$/i.test(value))) { setMessage("Use a six-digit hex color, for example #fff4c4."); return; }
    if (draft.canvasColor.toLowerCase() === draft.inkColor.toLowerCase()) { setMessage("Canvas and ink colors must be different."); return; }
    await save(draft);
  }
  return <div className={styles.uiStudioBackdrop} onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
    <section className={styles.uiStudioPanel} role="dialog" aria-modal="true" aria-labelledby="operation-ui-studio-title">
      <div className={styles.uiStudioHeader}><div><p>Owner tools</p><h2 id="operation-ui-studio-title">UI Studio</h2></div><button type="button" onClick={close} aria-label="Close UI Studio"><X size={18} /></button></div>
      <p className={styles.uiStudioIntro}>These colors apply only to Operation, its article reader, and editor for every role.</p>
      <div className={styles.uiStudioFields}>
        <label><span>Canvas / background</span><input type="color" aria-label="Canvas color picker" value={draft.canvasColor} onChange={event => update("canvasColor", event.target.value)} /><input aria-label="Canvas hex value" value={draft.canvasColor} onChange={event => update("canvasColor", event.target.value)} maxLength={7} /></label>
        <label><span>Ink / text and borders</span><input type="color" aria-label="Ink color picker" value={draft.inkColor} onChange={event => update("inkColor", event.target.value)} /><input aria-label="Ink hex value" value={draft.inkColor} onChange={event => update("inkColor", event.target.value)} maxLength={7} /></label>
        <label><span>Accent / attention</span><input type="color" aria-label="Accent color picker" value={draft.accentColor} onChange={event => update("accentColor", event.target.value)} /><input aria-label="Accent hex value" value={draft.accentColor} onChange={event => update("accentColor", event.target.value)} maxLength={7} /></label>
        <label><span>Positive / calm</span><input type="color" aria-label="Positive color picker" value={draft.positiveColor} onChange={event => update("positiveColor", event.target.value)} /><input aria-label="Positive hex value" value={draft.positiveColor} onChange={event => update("positiveColor", event.target.value)} maxLength={7} /></label>
      </div>
      <div className={styles.uiStudioPreview} style={{ background: draft.canvasColor, color: draft.inkColor }}><strong>Operation preview</strong><span>Muted copy, badges and surfaces inherit this pair.</span><button type="button" style={{ background: draft.inkColor, color: draft.canvasColor }}>Example action</button><span style={{ color: draft.accentColor }}>High priority uses accent</span><span style={{ color: draft.positiveColor }}>Low priority uses positive</span></div>
      {publicUrl && <p className={styles.uiStudioLink}>Shared staff Operations link: <a href={publicUrl} target="_blank" rel="noreferrer">Open direct link</a></p>}
      {message && <p className={styles.uiStudioMessage} role="status">{message}</p>}
      <div className={styles.uiStudioActions}><button type="button" onClick={close}>Cancel</button><button type="button" onClick={() => void submit()} disabled={saving}>{saving ? <LoaderCircle className={styles.saveSpinner} size={16} /> : <Check size={16} />}Save colors</button></div>
    </section>
  </div>;
}

function HomeView({ news, tasks, needs, openArticle, openView, canManageContent, disabled, editArticle, deleteArticle }: { news: OperationArticle[]; tasks: OperationDailyTask[]; needs: OperationNeed[]; openArticle: (article: OperationArticle) => void; openView: (view: View) => void; canManageContent: boolean; disabled: boolean; editArticle: (article: OperationArticle) => void; deleteArticle: (article: OperationArticle) => void }) {
  const outstanding = tasks.filter(task => !task.completed).sort((left, right) => taskPriorityRank(left.priority) - taskPriorityRank(right.priority) || (left.dueTime || "99:99").localeCompare(right.dueTime || "99:99"));
  const nextTask = outstanding[0];
  const openNeeds = needs.filter(need => need.status === "NEEDED");
  const completedCount = tasks.length - outstanding.length;
  return <>
    <section className={styles.todayPanel}>
      <div><p className={styles.eyebrow}>Today</p><h1>{nextTask ? "Next up" : tasks.length ? "You’re up to date" : "Nothing scheduled"}</h1><p>{tasks.length ? `${completedCount} of ${tasks.length} tasks complete` : "Check the Handbook when you need a routine."}</p></div>
      <button type="button" onClick={() => openView("tasks")}>All tasks <ChevronRight size={17} /></button>
    </section>
    {nextTask ? <button type="button" className={styles.nextAction} onClick={() => openView("tasks")}>
      <span className={styles.nextActionIcon} data-priority={nextTask.priority}><Square size={19} strokeWidth={1.8} /></span>
      <span><small>{nextTask.taskType.toLowerCase()}</small><strong>{nextTask.title}</strong>{nextTask.description && <em>{nextTask.description}</em>}{nextTask.dueTime && <em><Clock3 size={13} />{nextTask.dueTime}</em>}</span>
      <ChevronRight size={20} aria-hidden="true" />
    </button> : <div className={styles.nextActionEmpty}><Check size={19} /><p>{tasks.length ? "No tasks left for today." : "No tasks have been scheduled for today."}</p></div>}
    <section className={styles.homeShortcuts} aria-label="Today’s shortcuts">
      <button type="button" onClick={() => openView("tasks")}><CheckSquare size={18} /><span><strong>{outstanding.length}</strong><small>{outstanding.length === 1 ? "task left" : "tasks left"}</small></span><ChevronRight size={17} /></button>
      <button type="button" onClick={() => openView("needs")}><ShoppingBasket size={18} /><span><strong>{openNeeds.length}</strong><small>{openNeeds.length === 1 ? "item to order" : "items to order"}</small></span><ChevronRight size={17} /></button>
    </section>
    <NewsFeed news={news} openArticle={openArticle} canManageContent={canManageContent} disabled={disabled} editArticle={editArticle} deleteArticle={deleteArticle} />
  </>;
}

function taskPriorityRank(priority: OperationTaskPriority) {
  return priority === "HIGH" ? 0 : priority === "NORMAL" ? 1 : 2;
}

function PublicHomeView({ news, openArticle, openHandbook }: { news: OperationArticle[]; openArticle: (article: OperationArticle) => void; openHandbook: () => void }) {
  return <><section className={styles.todayPanel}><div><p className={styles.eyebrow}>Bar Ops</p><h1>Handbook & news</h1><p>Read the latest published routines and updates.</p></div><button type="button" onClick={openHandbook}>Open handbook <ChevronRight size={17} /></button></section><NewsFeed news={news} openArticle={openArticle} /></>;
}

function NewsFeed({ news, openArticle, canManageContent = false, disabled = false, editArticle, deleteArticle }: { news: OperationArticle[]; openArticle: (article: OperationArticle) => void; canManageContent?: boolean; disabled?: boolean; editArticle?: (article: OperationArticle) => void; deleteArticle?: (article: OperationArticle) => void }) {
  return <><SectionHeader title="News" detail="Latest updates" /><div className={styles.cardGrid}>{news.map(article => <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} onEdit={canManageContent && editArticle ? () => editArticle(article) : undefined} onDelete={canManageContent && deleteArticle ? () => deleteArticle(article) : undefined} disabled={disabled} showBody />)}{!news.length && <div className={styles.empty}>No news yet.</div>}</div></>;
}

function StorageNotice() {
  return <section className={styles.storageNotice} role="status"><strong>Database migration needed</strong><p>Saved Operation articles, daily tasks and needed items will appear after the GitHub database migration action has run against production.</p></section>;
}

function HandbookView({ articles, categories, query, category, setQuery, setCategory, openArticle, canManageContent, disabled, editArticle, deleteArticle }: { articles: OperationArticle[]; categories: string[]; query: string; category: string; setQuery: (value: string) => void; setCategory: (value: string) => void; openArticle: (article: OperationArticle) => void; canManageContent: boolean; disabled: boolean; editArticle: (article: OperationArticle) => void; deleteArticle: (article: OperationArticle) => void }) {
  return <><div className={styles.toolbar}><input className={styles.search} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search handbook" aria-label="Search handbook" /><div className={styles.pills}>{categories.map(item => <button key={item} className={styles.pill} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className={styles.articleGroups}>{articles.map(article => <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} onEdit={canManageContent ? () => editArticle(article) : undefined} onDelete={canManageContent ? () => deleteArticle(article) : undefined} disabled={disabled} />)}{!articles.length && <div className={styles.empty}>No handbook articles found.</div>}</div></>;
}

function TasksView({ tasks, taskTemplates, assignees, selectedDate, setSelectedDate, canManage, taskTitle, taskDescription, taskDueDate, taskRepeatUnit, taskRepeatInterval, taskRepeatEndDate, taskPriority, taskDueTime, taskReminderMinutes, taskAssignmentScope, taskAssigneeId, taskChecklistText, setTaskTitle, setTaskDescription, setTaskDueDate, setTaskRepeatUnit, setTaskRepeatInterval, setTaskRepeatEndDate, setTaskType, setTaskPriority, setTaskDueTime, setTaskReminderMinutes, setTaskAssignmentScope, setTaskAssigneeId, setTaskChecklistText, saveTaskTemplate, addTask, toggleTask, toggleTaskChecklist, deleteTask, disabled, message }: { tasks: OperationDailyTask[]; taskTemplates: OperationModuleState["taskTemplates"]; assignees: OperationModuleState["assignees"]; selectedDate: string; setSelectedDate: (value: string) => void; canManage: boolean; taskTitle: string; taskDescription: string; taskDueDate: string; taskRepeatUnit: OperationTaskRepeatUnit; taskRepeatInterval: number; taskRepeatEndDate: string; taskPriority: OperationTaskPriority; taskDueTime: string; taskReminderMinutes: string; taskAssignmentScope: OperationTaskAssignmentScope; taskAssigneeId: string; taskChecklistText: string; setTaskTitle: (value: string) => void; setTaskDescription: (value: string) => void; setTaskDueDate: (value: string) => void; setTaskRepeatUnit: (value: OperationTaskRepeatUnit) => void; setTaskRepeatInterval: (value: number) => void; setTaskRepeatEndDate: (value: string) => void; setTaskType: (value: OperationTaskType) => void; setTaskPriority: (value: OperationTaskPriority) => void; setTaskDueTime: (value: string) => void; setTaskReminderMinutes: (value: string) => void; setTaskAssignmentScope: (value: OperationTaskAssignmentScope) => void; setTaskAssigneeId: (value: string) => void; setTaskChecklistText: (value: string) => void; saveTaskTemplate: () => void; addTask: () => void; toggleTask: (task: OperationDailyTask) => void; toggleTaskChecklist: (task: OperationDailyTask, itemId: string) => void; deleteTask: (task: OperationDailyTask) => void; disabled: boolean; message: string }) {
  const current = new Date(`${selectedDate}T00:00:00Z`);
  const formattedDate = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "short" }).format(current);
  const shiftDate = (days: number) => setSelectedDate(new Date(current.valueOf() + days * 86_400_000).toISOString().slice(0, 10));
  const grouped = (["OPENING", "SERVICE", "CLOSING", "MAINTENANCE", "ADMIN"] as OperationTaskType[]).map(type => [type, tasks.filter(task => task.taskType === type)] as const).filter(([, items]) => items.length);
  function applyTemplate(templateId: string) {
    const template = taskTemplates.find(item => item.id === templateId);
    if (!template) return;
    setTaskTitle(template.title); setTaskDescription(template.description); setTaskType(template.taskType); setTaskPriority(template.priority); setTaskDueTime(template.dueTime || ""); setTaskReminderMinutes(template.reminderMinutes == null ? "" : String(template.reminderMinutes)); setTaskChecklistText(template.checklist.map(item => item.label).join("\n"));
  }
  return <>
    <div className={styles.taskDateBar}><button type="button" onClick={() => shiftDate(-1)} aria-label="Previous date"><ChevronLeft size={20} /></button><label><span>Task date</span><input type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} /></label><button type="button" onClick={() => shiftDate(1)} aria-label="Next date"><ChevronRight size={20} /></button></div>
    <SectionHeader title="Tasks" detail={formattedDate} />
    {canManage && <details className={styles.taskComposer}><summary><span><Plus size={17} />Create task</span><small>Schedule, owner and repeat</small></summary><div className={styles.taskComposerBody}>
      {taskTemplates.length > 0 && <label className={styles.templatePicker}><span>Start from template</span><select defaultValue="" onChange={event => applyTemplate(event.target.value)}><option value="" disabled>Choose a saved task</option>{taskTemplates.map(template => <option key={template.id} value={template.id}>{template.title}</option>)}</select></label>}
      <div className={styles.adminGrid}><input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="Task title" disabled={disabled} /><input value={taskDescription} onChange={event => setTaskDescription(event.target.value)} placeholder="Short instruction (optional)" disabled={disabled} /></div>
      <div className={styles.taskSettings}><label><span className={styles.taskSettingLabel}><CalendarDays size={15} />First date</span><input type="date" value={taskDueDate} onChange={event => setTaskDueDate(event.target.value)} disabled={disabled} /></label><label><span className={styles.taskSettingLabel}><Clock3 size={15} />Time</span><input type="time" value={taskDueTime} onChange={event => setTaskDueTime(event.target.value)} disabled={disabled} /></label><label><span className={styles.taskSettingLabel}>Priority</span><select value={taskPriority} onChange={event => setTaskPriority(event.target.value as OperationTaskPriority)} disabled={disabled}><option value="LOW">Low</option><option value="NORMAL">Normal</option><option value="HIGH">High</option></select></label><label><span className={styles.taskSettingLabel}>Reminder</span><select value={taskReminderMinutes} onChange={event => setTaskReminderMinutes(event.target.value)} disabled={disabled}><option value="">No reminder</option><option value="0">At time</option><option value="15">15 min before</option><option value="30">30 min before</option><option value="60">1 hour before</option><option value="1440">1 day before</option></select></label><label><span className={styles.taskSettingLabel}><Repeat2 size={15} />Repeat</span><select value={taskRepeatUnit} onChange={event => setTaskRepeatUnit(event.target.value as OperationTaskRepeatUnit)} disabled={disabled}><option value="NONE">Never</option><option value="DAY">Daily</option><option value="WEEK">Weekly</option><option value="MONTH">Monthly</option><option value="YEAR">Yearly</option></select></label><label className={styles.taskAudienceField}><span className={styles.taskSettingLabel}><UserRound size={15} />Task audience</span><select value={taskAssignmentScope} onChange={event => { setTaskAssignmentScope(event.target.value as OperationTaskAssignmentScope); if (event.target.value !== "EMPLOYEE") setTaskAssigneeId(""); }} disabled={disabled}><option value="EVERYONE">Everyone</option><option value="ON_SHIFT">Everyone on shift</option><option value="EMPLOYEE">Specific employee</option></select></label>{taskRepeatUnit !== "NONE" && <><label><span className={styles.taskSettingLabel}>Every</span><input type="number" inputMode="numeric" min="1" max="365" value={taskRepeatInterval} onChange={event => setTaskRepeatInterval(Math.max(1, Number(event.target.value) || 1))} disabled={disabled} /></label><label><span className={styles.taskSettingLabel}>Ends</span><input type="date" min={taskDueDate} value={taskRepeatEndDate} onChange={event => setTaskRepeatEndDate(event.target.value)} disabled={disabled} /></label></>}</div>
      <p className={styles.taskAudienceHelp}>{taskAssignmentScope === "EVERYONE" ? "Visible to everyone, regardless of the rota." : taskAssignmentScope === "ON_SHIFT" ? "Visible to employees scheduled at this location on the task date." : "Choose the employee below."}</p>
      {taskAssignmentScope === "EMPLOYEE" && <label className={styles.taskAudienceField}><span className={styles.taskSettingLabel}><UserRound size={15} />Employee</span><select value={taskAssigneeId} onChange={event => setTaskAssigneeId(event.target.value)} disabled={disabled}><option value="">Choose employee</option>{assignees.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>}
      <label className={styles.checklistField}><span>Steps (optional)</span><textarea value={taskChecklistText} onChange={event => setTaskChecklistText(event.target.value)} placeholder="Restock ice&#10;Check fridge temperature" disabled={disabled} /><small>Each line becomes a separate check-off inside this task.</small></label>
      <p className={styles.settingsHint}>Everyone is independent of scheduling. Everyone on shift is shown only to employees scheduled at this location on the task date; clocking in is never required.</p>
      <div className={styles.adminActions}><button className={styles.composerSubmit} type="button" onClick={addTask} disabled={disabled}>Create task</button><button type="button" onClick={saveTaskTemplate} disabled={disabled || !taskTitle.trim()}>Save template</button></div>{message && <p className={styles.editorMessage} role="status">{message}</p>}
    </div></details>}
    <div className={styles.taskList}>{grouped.map(([type, items]) => <section className={styles.taskGroup} key={type}><h3>{type.toLowerCase()}</h3>{items.map(task => <article className={styles.taskRow} key={task.id} data-complete={task.completed}><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} aria-label={`Mark ${task.title} complete`} disabled={disabled} /><div><div className={styles.taskRowTitle}><h4>{task.title}</h4><span data-priority={task.priority}>{task.priority.toLowerCase()}</span></div>{task.description && <p>{task.description}</p>}{task.checklist.length > 0 && <div className={styles.taskChecklist}>{task.checklist.map(item => <label key={item.id}><input type="checkbox" checked={item.completed} onChange={() => toggleTaskChecklist(task, item.id)} disabled={disabled} />{item.label}</label>)}</div>}<div className={styles.taskMeta}>{task.dueTime && <span><Clock3 size={13} />{task.dueTime}</span>}{task.assignedEmployeeName && <span><UserRound size={13} />{task.assignedEmployeeName}</span>}{task.completed && task.completedByName && <span>Completed by {task.completedByName}</span>}</div></div>{canManage && <button type="button" className={styles.rowDelete} onClick={() => deleteTask(task)} aria-label={`Delete ${task.title}`} disabled={disabled}><Trash2 size={16} /></button>}</article>)}</section>)}{!tasks.length && <div className={styles.empty}>No tasks scheduled for this date.</div>}</div>
  </>;
}

function NeedsView({ needs, needTitle, needQuantity, needSupplier, needPriority, needNote, setNeedTitle, setNeedQuantity, setNeedSupplier, setNeedPriority, setNeedNote, addNeed, markNeedOrdered, disabled, message }: { needs: OperationNeed[]; needTitle: string; needQuantity: string; needSupplier: string; needPriority: OperationTaskPriority; needNote: string; setNeedTitle: (value: string) => void; setNeedQuantity: (value: string) => void; setNeedSupplier: (value: string) => void; setNeedPriority: (value: OperationTaskPriority) => void; setNeedNote: (value: string) => void; addNeed: () => void; markNeedOrdered: (need: OperationNeed) => void; disabled: boolean; message: string }) {
  const open = needs.filter(need => need.status === "NEEDED");
  const ordered = needs.filter(need => need.status === "ORDERED");
  const statusLabel = (priority: OperationTaskPriority) => priority === "LOW" ? "Low" : priority === "NORMAL" ? "Missing" : "New product/item";
  const rows = (items: OperationNeed[], history = false) => <div className={styles.needList}>{items.map(need => <article className={styles.needRow} key={need.id} data-ordered={need.status === "ORDERED"}><ShoppingBasket size={22} /><div><div className={styles.taskRowTitle}><h3>{need.title}</h3><span data-priority={need.priority}>{statusLabel(need.priority)}</span></div>{need.note && <p>{need.note}</p>}<div className={styles.taskMeta}>{need.quantity && <span>{need.quantity}</span>}{need.supplier && <span>{need.supplier}</span>}{need.orderedAt && <span>Ordered {new Date(need.orderedAt).toLocaleDateString()}</span>}</div></div>{!history && <button type="button" onClick={() => markNeedOrdered(need)} disabled={disabled}>Ordered</button>}</article>)}{!items.length && <div className={styles.empty}>{history ? "No order history yet." : "Nothing needed right now."}</div>}</div>;
  return <><details className={styles.taskComposer}><summary><span><Plus size={17} />Add to order list</span><small>Quantity and supplier</small></summary><div className={styles.taskComposerBody}><div className={styles.adminGrid}><input value={needTitle} onChange={event => setNeedTitle(event.target.value)} placeholder="What is needed?" disabled={disabled} /><input value={needSupplier} onChange={event => setNeedSupplier(event.target.value)} placeholder="Supplier (optional)" disabled={disabled} /></div><div className={styles.taskSettings}><label><span className={styles.taskSettingLabel}>Quantity</span><input type="number" min="0" inputMode="decimal" value={needQuantity} onChange={event => setNeedQuantity(event.target.value)} disabled={disabled} /></label><label><span className={styles.taskSettingLabel}>Status</span><select value={needPriority} onChange={event => setNeedPriority(event.target.value as OperationTaskPriority)} disabled={disabled}><option value="LOW">Low</option><option value="NORMAL">Missing</option><option value="HIGH">New product/item</option></select></label></div><textarea className={styles.needNoteInput} value={needNote} onChange={event => setNeedNote(event.target.value)} placeholder="Ordering note (optional)" disabled={disabled} /><div className={styles.adminActions}><button className={styles.composerSubmit} type="button" onClick={addNeed} disabled={disabled}>Add needed item</button></div></div></details>{message && <p className={styles.editorMessage} role="status">{message}</p>}<SectionHeader title="To order" detail={`${open.length} open`} />{rows(open)}<details className={styles.orderHistory}><summary>Order history ({ordered.length})</summary>{rows(ordered, true)}</details></>;
}

function ArticleEditor({ draft, categories, linkableArticles, setDraft, saveArticle, saving, message, close }: { draft: DraftArticle; categories: string[]; linkableArticles: OperationArticle[]; setDraft: (draft: DraftArticle) => void; saveArticle: () => Promise<boolean>; saving: boolean; message: string; close: () => void }) {
  const editorRef = useRef<HTMLElement | null>(null);
  const categoryIsNew = !categories.includes(draft.category);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    function syncViewport() {
      editorRef.current?.style.setProperty("--editor-vv-top", `${visualViewport?.offsetTop || 0}px`);
      editorRef.current?.style.setProperty("--editor-vv-height", `${visualViewport?.height || window.innerHeight}px`);
    }
    syncViewport();
    visualViewport?.addEventListener("resize", syncViewport);
    visualViewport?.addEventListener("scroll", syncViewport);
    window.addEventListener("resize", syncViewport);
    return () => { visualViewport?.removeEventListener("resize", syncViewport); visualViewport?.removeEventListener("scroll", syncViewport); window.removeEventListener("resize", syncViewport); };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
    };
  }, []);

  return <aside ref={editorRef} className={styles.articleEditor} aria-modal="true" role="dialog" aria-label={draft.id ? "Edit article" : "Add article"}><div className={styles.articleEditorFrame}><div className={styles.articleEditorTop}><button type="button" className={styles.editorIconButton} onClick={close} aria-label="Close editor"><ArrowLeft size={18} /></button><label className={styles.editorTopSelect}><span className="sr-only">Article type</span><select value={draft.kind} onChange={event => setDraft({ ...draft, kind: event.target.value as OperationArticleKind })}><option value="HANDBOOK">Handbook</option><option value="NEWS">News</option></select></label><label className={styles.editorTopSelect}><span className="sr-only">Existing category</span><select value={categoryIsNew ? "" : draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })}><option value="">Add new category…</option>{categories.map(categoryName => <option key={categoryName} value={categoryName}>{categoryName}</option>)}</select></label><button type="button" className={styles.editorDoneButton} disabled={saving} onClick={saveArticle} aria-label={saving ? "Saving article" : "Save article"}>{saving ? <LoaderCircle className={styles.saveSpinner} size={18} /> : <Check size={19} />}</button></div><div className={styles.articleEditorCanvas}>{categoryIsNew && <label className={styles.editorNewCategory}><span>New category</span><input value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })} placeholder="Category name" /></label>}<input className={styles.editorTitleInput} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="Title" /><textarea className={styles.editorDescriptionInput} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="Short card description" /><TiptapArticleEditor value={draft.document} linkableArticles={linkableArticles.filter(article => article.id !== draft.id)} onChange={(document) => setDraft({ ...draft, document })} />{message && <p className={styles.editorMessage} role="status">{message}</p>}</div></div></aside>;
}

function TiptapArticleEditor({ value, linkableArticles, onChange }: { value: OperationTiptapDocument; linkableArticles: OperationArticle[]; onChange: (document: OperationTiptapDocument) => void }) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const styleControlRef = useRef<HTMLDivElement | null>(null);
  const moreControlRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [articlePickerOpen, setArticlePickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const articlePickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => {
    function closePopovers(event: PointerEvent) {
      const target = event.target as Node;
      if (styleControlRef.current && !styleControlRef.current.contains(target)) setStyleMenuOpen(false);
      if (moreControlRef.current && !moreControlRef.current.contains(target)) setMoreMenuOpen(false);
      if (articlePickerRef.current && !articlePickerRef.current.contains(target)) setArticlePickerOpen(false);
    }
    document.addEventListener("pointerdown", closePopovers);
    return () => document.removeEventListener("pointerdown", closePopovers);
  }, []);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      UnderlineExtension,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true, protocols: ["http", "https", "mailto", "tel", "operation"] }),
      OperationImageExtension.configure({ allowBase64: false, inline: false }),
      Placeholder.configure({ placeholder: "Write the article..." }),
    ],
    content: value,
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(current.getJSON() as OperationTiptapDocument);
      const { from } = current.state.selection;
      if (current.state.doc.textBetween(Math.max(0, from - 2), from, "", "") === ">>") setArticlePickerOpen(true);
    },
  }, []);

  async function uploadImage(file: File) {
    if (!editor) return;
    setUploading(true);
    try {
      const images = await prepareOperationImages(file);
      const form = new FormData();
      form.append("preview", images.preview);
      form.append("detail", images.detail);
      const response = await fetch("/api/operation-images", { method: "POST", body: form });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok || !payload || typeof payload !== "object" || !("url" in payload) || typeof payload.url !== "string" || !("fullUrl" in payload) || typeof payload.fullUrl !== "string") {
        throw new Error(payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string" ? payload.error : "Could not upload image.");
      }
      editor.chain().focus().setImage({ src: payload.url, alt: "Operation article image" }).updateAttributes("image", { fullSrc: payload.fullUrl, width: images.width, height: images.height }).run();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  function applyStyle(style: "heading" | "subheading" | "body") {
    if (!editor) return;
    if (style === "heading") editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (style === "subheading") editor.chain().focus().toggleHeading({ level: 3 }).run();
    else editor.chain().focus().setParagraph().run();
    setStyleMenuOpen(false);
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Paste a link", previous || "");
    if (href === null) return;
    if (!href.trim()) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  }

  function insertArticleLink(article: OperationArticle) {
    if (!editor) return;
    const { from } = editor.state.selection;
    editor.chain().focus().deleteRange({ from: Math.max(1, from - 2), to: from }).insertContent({ type: "text", text: article.title, marks: [{ type: "link", attrs: { href: operationArticleHref(article.id) } }] }).insertContent(" ").run();
    setArticlePickerOpen(false);
  }

  return <div className={styles.tiptapEditor}><input ref={imageInputRef} className={styles.imageInput} type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadImage(file); }} /><EditorContent editor={editor} className={styles.tiptapSurface} />{articlePickerOpen && <div ref={articlePickerRef} className={styles.articleLinkPicker} role="dialog" aria-label="Link to an existing article"><p>Link to article</p><div>{linkableArticles.map(article => <button key={article.id} type="button" onMouseDown={event => event.preventDefault()} onClick={() => insertArticleLink(article)}><strong>{article.title}</strong><small>{article.kind.toLowerCase()} · {article.category}</small></button>)}{!linkableArticles.length && <span>No published articles to link yet.</span>}</div></div>}<div className={styles.tiptapToolbar} role="toolbar" aria-label="Article formatting tools"><div ref={styleControlRef} className={styles.styleControl}><button type="button" className={styles.styleTrigger} aria-label="Text style" onMouseDown={event => event.preventDefault()} onClick={() => { setStyleMenuOpen(open => !open); setMoreMenuOpen(false); }} aria-expanded={styleMenuOpen}><span aria-hidden="true">Aa</span></button>{styleMenuOpen && <div className={styles.styleMenu}><button type="button" onMouseDown={event => event.preventDefault()} onClick={() => applyStyle("heading")}>Heading</button><button type="button" onMouseDown={event => event.preventDefault()} onClick={() => applyStyle("subheading")}>Subheading</button><button type="button" onMouseDown={event => event.preventDefault()} onClick={() => applyStyle("body")}>Body</button></div>}</div><button type="button" aria-label="Bold" aria-pressed={editor?.isActive("bold") || false} onMouseDown={event => event.preventDefault()} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold size={19} /></button><button type="button" aria-label="Italic" aria-pressed={editor?.isActive("italic") || false} onMouseDown={event => event.preventDefault()} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic size={19} /></button><button type="button" aria-label="Underline" aria-pressed={editor?.isActive("underline") || false} onMouseDown={event => event.preventDefault()} onClick={() => editor?.chain().focus().toggleUnderline().run()}><Underline size={19} /></button><button type="button" aria-label="Bullet list" aria-pressed={editor?.isActive("bulletList") || false} onMouseDown={event => event.preventDefault()} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List size={20} /></button><button type="button" aria-label="Numbered list" aria-pressed={editor?.isActive("orderedList") || false} onMouseDown={event => event.preventDefault()} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered size={20} /></button><button type="button" aria-label="Add image from device" disabled={uploading} onMouseDown={event => event.preventDefault()} onClick={() => imageInputRef.current?.click()}><ImagePlus size={20} /></button><div ref={moreControlRef} className={styles.moreControl}><button type="button" aria-label="More formatting tools" onMouseDown={event => event.preventDefault()} onClick={() => { setMoreMenuOpen(open => !open); setStyleMenuOpen(false); }} aria-expanded={moreMenuOpen}><MoreHorizontal size={21} /></button>{moreMenuOpen && <div className={styles.moreMenu}><button type="button" onClick={() => { setLink(); setMoreMenuOpen(false); }}><Link2 size={18} />Link</button><button type="button" disabled={!editor?.can().undo()} onClick={() => { editor?.chain().focus().undo().run(); setMoreMenuOpen(false); }}><Undo2 size={18} />Undo</button><button type="button" disabled={!editor?.can().redo()} onClick={() => { editor?.chain().focus().redo().run(); setMoreMenuOpen(false); }}><Redo2 size={18} />Redo</button></div>}</div></div></div>;
}

function SectionHeader({ title, detail }: { title: string; detail: string }) {
  return <div className={styles.sectionHeader}><h2>{title}</h2><div><p>{detail}</p></div></div>;
}

function ArticleCard({ article, onClick, onEdit, onDelete, disabled = false, showBody = false }: { article: OperationArticle; onClick: () => void; onEdit?: () => void; onDelete?: () => void; disabled?: boolean; showBody?: boolean }) {
  if (showBody) return <article className={`${styles.operationCard} ${styles.newsCard}`}><div className={styles.newsCardHeader}><button type="button" className={styles.newsCardTitleButton} onClick={onClick}><h3>{article.title}</h3></button><div className={styles.newsCardTools}><small>{article.category}</small>{onEdit && onDelete && <div className={styles.articleCardActions}><button type="button" onClick={onEdit} disabled={disabled}>Edit</button><button type="button" onClick={onDelete} aria-label={`Delete ${article.title}`} disabled={disabled}><Trash2 size={16} /></button></div>}</div></div><button type="button" className={styles.newsCardBodyButton} onClick={onClick}><NewsCardBody article={article} /></button></article>;
  return <article className={`${styles.operationCard}${showBody ? ` ${styles.newsCard}` : ""}`}><button type="button" className={styles.articleCardOpen} onClick={onClick}><div><h3>{article.title}</h3>{showBody ? <NewsCardBody article={article} /> : article.description && <p>{article.description}</p>}</div><small>{article.category}</small></button>{onEdit && onDelete && <div className={styles.articleCardActions}><button type="button" onClick={onEdit} disabled={disabled}>Edit</button><button type="button" onClick={onDelete} aria-label={`Delete ${article.title}`} disabled={disabled}><Trash2 size={16} /></button></div>}</article>;
}

type NewsCardTextBlock = { type: "heading" | "subheading" | "body" | "list"; text: string };

function NewsCardBody({ article }: { article: OperationArticle }) {
  const blocks = article.content.flatMap(newsCardBlocksFromContent).filter(block => block.text.trim());
  const content = blocks.length ? blocks : article.description ? [{ type: "body" as const, text: article.description }] : [];
  return <span className={styles.newsCardBody}>{content.map((block, index) => <span className={styles[`newsCard${block.type[0].toUpperCase()}${block.type.slice(1)}`]} key={`${block.type}-${index}`}>{block.text}</span>)}</span>;
}

function newsCardBlocksFromContent(block: OperationContentBlock): NewsCardTextBlock[] {
  if (block.type === "title" || block.type === "image" || block.type === "articleLink") return [];
  if (block.type === "h1") return [{ type: "heading", text: block.text }];
  if (block.type === "h2") return [{ type: "subheading", text: block.text }];
  if (block.type === "body") return [{ type: "body", text: block.text }];
  if (block.type === "bullets" || block.type === "numbered") return block.items.map((item, index) => ({ type: "list" as const, text: `${block.type === "bullets" ? "•" : `${index + 1}.`} ${item}` }));
  if (block.type === "richText") return deltaToLines(block.delta).flatMap((line): NewsCardTextBlock[] => {
    const text = line.segments.map(segment => segment.text).join("");
    const header = normalizeHeader(line.attributes?.header);
    return text ? [{ type: header === 1 ? "heading" : header === 2 ? "subheading" : "body", text }] : [];
  });
  if (block.type === "tiptap") return block.document.content.flatMap(newsCardBlocksFromTiptapNode);
  return [];
}

function tiptapNodeText(node: OperationTiptapNode): string {
  if (node.type === "image") return "";
  if (node.type === "hardBreak") return "\n";
  return [node.text || "", ...(node.content || []).map(tiptapNodeText)].join("");
}

function newsCardBlocksFromTiptapNode(node: OperationTiptapNode): NewsCardTextBlock[] {
  if (node.type === "image" || node.type === "hardBreak" || node.type === "text") return [];
  if (node.type === "heading") return [{ type: node.attrs?.level === 3 ? "subheading" : "heading", text: tiptapNodeText(node) }];
  if (node.type === "paragraph") return tiptapNodeText(node).trim() ? [{ type: "body", text: tiptapNodeText(node) }] : [];
  if (node.type === "bulletList" || node.type === "orderedList") return (node.content || []).flatMap((item, index) => {
    const text = tiptapNodeText(item).trim();
    return text ? [{ type: "list" as const, text: `${node.type === "bulletList" ? "•" : `${index + 1}.`} ${text}` }] : [];
  });
  return (node.content || []).flatMap(newsCardBlocksFromTiptapNode);
}

const previewImageMaxDimension = 960;
const photoImageMaxDimension = 1600;
const screenshotImageMaxDimension = 2048;

async function prepareOperationImages(file: File): Promise<PreparedOperationImages> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") throw new Error("Choose a JPG, PNG or WebP image.");
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new window.Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("This image could not be prepared. Choose a JPG, PNG or WebP image."));
      element.src = sourceUrl;
    });
    const isScreenshot = file.type === "image/png";
    const detailMaxDimension = isScreenshot ? screenshotImageMaxDimension : photoImageMaxDimension;
    const detailQuality = isScreenshot ? 0.84 : 0.78;
    const previewQuality = isScreenshot ? 0.78 : 0.72;
    const detail = await imageFileFromCanvas(image, file, detailMaxDimension, detailQuality);
    const preview = Math.max(detail.width, detail.height) <= previewImageMaxDimension
      ? detail
      : await imageFileFromCanvas(image, file, previewImageMaxDimension, previewQuality);
    if (preview.file.size + detail.file.size > 4 * 1024 * 1024) throw new Error("This image is still too large after preparation. Choose a smaller image.");
    return { preview: preview.file, detail: detail.file, width: preview.width, height: preview.height };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function imageFileFromCanvas(image: HTMLImageElement, file: File, maxDimension: number, quality: number) {
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This image could not be prepared.");
  context.drawImage(image, 0, 0, width, height);
  const output = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", quality));
  if (!output) throw new Error("This image could not be prepared.");
    const stem = file.name.replace(/\.[^.]+$/, "") || "operation-image";
  return { file: new File([output], `${stem}.webp`, { type: output.type, lastModified: file.lastModified }), width, height };
}

function Reader({ article, articles, canGoBack, goBack, openArticle, close }: { article: OperationArticle; articles: OperationArticle[]; canGoBack: boolean; goBack: () => void; openArticle: (article: OperationArticle) => void; close: () => void }) {
  const content = article.content.length ? article.content : [{ type: "title" as const, text: article.title }, { type: "body" as const, text: article.description || "No article content has been added yet." }];
  const openLinkedArticle = (articleId: string) => {
    const linkedArticle = articles.find(item => item.id === articleId);
    if (linkedArticle) openArticle(linkedArticle);
  };
  return <aside className={styles.reader} aria-modal="true" role="dialog" aria-label={article.title}><article className={styles.readerArticle}>{content.map((block, index) => <RenderBlock key={`${block.type}-${index}`} block={block} openArticle={openLinkedArticle} />)}</article><div className={styles.readerBottom}>{canGoBack && <button type="button" className={styles.readerBackCircle} onClick={goBack} aria-label="Back to previous article"><ArrowLeft /></button>}<button type="button" className={styles.closeCircle} onClick={close} aria-label="Close article"><X /></button></div></aside>;
}

function RenderBlock({ block, openArticle }: { block: OperationContentBlock; openArticle: (articleId: string) => void }) {
  if (block.type === "title") return <h1>{block.text}</h1>;
  if (block.type === "richText") return <RichTextArticle delta={block.delta} />;
  if (block.type === "tiptap") return <TiptapArticle document={block.document} openArticle={openArticle} />;
  if (block.type === "h1") return <h2>{block.text}</h2>;
  if (block.type === "h2") return <h3>{block.text}</h3>;
  if (block.type === "body") return <p>{block.text}</p>;
  if (block.type === "bullets") return <ul>{block.items.map(item => <li key={item}>{item}</li>)}</ul>;
  if (block.type === "numbered") return <ol>{block.items.map(item => <li key={item}>{item}</li>)}</ol>;
  if (block.type === "image") return <ArticleImage src={block.src} alt={block.alt} />;
  if (block.type === "articleLink") return <button type="button" className={styles.readerArticleLink} onClick={() => openArticle(block.articleId)}>{block.label}</button>;
  return null;
}

function ArticleImage({ src, fullSrc, alt, width = 1200, height = 800 }: { src: string; fullSrc?: string; alt: string; width?: number; height?: number }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const detailSrc = fullSrc || src;
  return <>
    <button type="button" className={styles.readerImageButton} onClick={() => setViewerOpen(true)} aria-label={`Open image${alt ? `: ${alt}` : ""}`}>
      <Image className={styles.readerImage} src={src} alt={alt} width={width} height={height} unoptimized sizes="(max-width: 48rem) 100vw, 38rem" />
    </button>
    {viewerOpen && <aside className={styles.imageViewer} role="dialog" aria-modal="true" aria-label={alt || "Article image"} onClick={() => setViewerOpen(false)}>
      <button type="button" className={styles.imageViewerClose} onClick={() => setViewerOpen(false)} aria-label="Close image"><X size={20} /></button>
      <Image className={styles.imageViewerImage} src={detailSrc} alt={alt} width={width} height={height} unoptimized sizes="100vw" onClick={event => event.stopPropagation()} />
    </aside>}
  </>;
}

function TiptapArticle({ document, openArticle }: { document: OperationTiptapDocument; openArticle: (articleId: string) => void }) {
  return <>{document.content.map((node, index) => <TiptapNode key={index} node={node} openArticle={openArticle} />)}</>;
}

function TiptapNode({ node, openArticle }: { node: OperationTiptapNode; openArticle: (articleId: string) => void }) {
  const content = node.content?.map((child, index) => <TiptapNode key={index} node={child} openArticle={openArticle} />);
  if (node.type === "text") return <TiptapText node={node} openArticle={openArticle} />;
  if (node.type === "paragraph") return <p>{content}</p>;
  if (node.type === "heading") return node.attrs?.level === 3 ? <h3>{content}</h3> : <h2>{content}</h2>;
  if (node.type === "bulletList") return <ul>{content}</ul>;
  if (node.type === "orderedList") return <ol>{content}</ol>;
  if (node.type === "listItem") return <li>{content}</li>;
  if (node.type === "image" && typeof node.attrs?.src === "string") return <ArticleImage src={node.attrs.src} fullSrc={typeof node.attrs.fullSrc === "string" ? node.attrs.fullSrc : undefined} alt={typeof node.attrs.alt === "string" ? node.attrs.alt : ""} width={typeof node.attrs.width === "number" ? node.attrs.width : undefined} height={typeof node.attrs.height === "number" ? node.attrs.height : undefined} />;
  if (node.type === "hardBreak") return <br />;
  return null;
}

function TiptapText({ node, openArticle }: { node: OperationTiptapNode; openArticle: (articleId: string) => void }) {
  let content: ReactNode = node.text || "";
  node.marks?.forEach(mark => {
    if (mark.type === "bold") content = <strong>{content}</strong>;
    if (mark.type === "italic") content = <em>{content}</em>;
    if (mark.type === "underline") content = <u>{content}</u>;
    if (mark.type === "link" && typeof mark.attrs?.href === "string") {
      const articleId = operationArticleIdFromHref(mark.attrs.href);
      content = articleId ? <button type="button" className={styles.readerArticleLink} onClick={() => openArticle(articleId)}>{content}</button> : <a href={mark.attrs.href} target="_blank" rel="noreferrer">{content}</a>;
    }
  });
  return <>{content}</>;
}

function RichTextArticle({ delta }: { delta: OperationRichTextDelta }) {
  return <>{deltaToLines(delta).map((line, index) => <RichTextLine key={index} line={line} />)}</>;
}

type RichTextSegment = { text: string; attributes?: OperationRichTextOp["attributes"] };
type RichTextLine = { segments: RichTextSegment[]; image?: string; attributes?: OperationRichTextOp["attributes"] };

function deltaToLines(delta: OperationRichTextDelta): RichTextLine[] {
  const lines: RichTextLine[] = [];
  let segments: RichTextSegment[] = [];
  delta.ops.forEach((op) => {
    if (typeof op.insert === "object") {
      if (op.insert.image) lines.push({ segments: [], image: op.insert.image, attributes: op.attributes });
      return;
    }
    const parts = op.insert.split("\n");
    parts.forEach((part, index) => {
      if (part) segments.push({ text: part, attributes: op.attributes });
      if (index < parts.length - 1) {
        lines.push({ segments, attributes: op.attributes });
        segments = [];
      }
    });
  });
  if (segments.length) lines.push({ segments });
  return lines.filter(line => line.image || line.segments.some(segment => segment.text.trim()));
}

function RichTextLine({ line }: { line: RichTextLine }) {
  if (line.image) return <ArticleImage src={line.image} alt="" />;
  const content = line.segments.map((segment, index) => <RichTextSegment key={index} segment={segment} />);
  if (line.attributes?.list === "bullet") return <ul><li>{content}</li></ul>;
  if (line.attributes?.list === "ordered") return <ol><li>{content}</li></ol>;
  if (normalizeHeader(line.attributes?.header) === 1) return <h1>{content}</h1>;
  if (normalizeHeader(line.attributes?.header) === 2) return <h2>{content}</h2>;
  return <p>{content}</p>;
}

function normalizeHeader(value: string | number | boolean | null | undefined) {
  return typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0;
}

function RichTextSegment({ segment }: { segment: RichTextSegment }) {
  let content: ReactNode = segment.text;
  if (segment.attributes?.bold) content = <strong>{content}</strong>;
  if (segment.attributes?.italic) content = <em>{content}</em>;
  if (segment.attributes?.underline) content = <u>{content}</u>;
  if (segment.attributes?.strike) content = <s>{content}</s>;
  if (typeof segment.attributes?.link === "string") content = <a href={segment.attributes.link} target="_blank" rel="noreferrer">{content}</a>;
  return <>{content}</>;
}
