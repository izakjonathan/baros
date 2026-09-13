"use client";

import Image from "next/image";
import { ArrowLeft, Bold, BookOpen, CalendarDays, Check, CheckSquare, ImagePlus, Italic, Link2, List, ListOrdered, MoreHorizontal, Plus, Redo2, Repeat2, ShoppingBasket, Trash2, Type, Underline, Undo2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import styles from "./OperationModule.module.css";
import type { OperationArticle, OperationArticleKind, OperationContentBlock, OperationDailyTask, OperationModuleState, OperationNeed, OperationRichTextDelta, OperationRichTextOp, OperationTaskRepeatUnit, OperationTiptapDocument, OperationTiptapNode } from "./types";

type View = "home" | "handbook" | "tasks" | "needs";
type DraftArticle = { id?: string; kind: OperationArticleKind; category: string; title: string; description: string; document: OperationTiptapDocument };

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const migrationMessage = "Operation storage is not ready yet. Run the database migration action, then reload this page.";

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

export function OperationModule({ initialState, devMode }: { initialState: OperationModuleState; devMode: boolean }) {
  const [state, setState] = useState(initialState);
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [readerStack, setReaderStack] = useState<OperationArticle[]>([]);
  const [draft, setDraft] = useState<DraftArticle>(() => draftFromArticle(undefined, "HANDBOOK"));
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState(initialState.today);
  const [taskRepeatUnit, setTaskRepeatUnit] = useState<OperationTaskRepeatUnit>("NONE");
  const [taskRepeatInterval, setTaskRepeatInterval] = useState(1);
  const [taskRepeatEndDate, setTaskRepeatEndDate] = useState("");
  const [needTitle, setNeedTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [editorMessage, setEditorMessage] = useState("");
  const [taskMessage, setTaskMessage] = useState("");
  const [needMessage, setNeedMessage] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const currentArticle = readerStack.at(-1) || null;
  const allArticles = [...state.news, ...state.handbook];
  const handbookCategories = ["All", ...Array.from(new Set(state.handbook.map(article => article.category)))];
  const filteredHandbook = state.handbook.filter(article => {
    const categoryMatch = category === "All" || article.category === category;
    const text = `${article.title} ${article.description} ${article.category}`.toLowerCase();
    return categoryMatch && text.includes(query.toLowerCase());
  });
  const storageUnavailable = state.storageStatus === "migration-required" && !devMode;

  async function refresh() {
    if (devMode) return;
    const response = await fetch("/api/operation-module", { cache: "no-store" });
    const next = await response.json();
    if (response.ok) setState(next as OperationModuleState);
  }

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
    const response = await fetch("/api/operation-module", { method: draft.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "article", id: draft.id, kind: article.kind, category: article.category, title: article.title, description: article.description, content: article.content }) });
    setSaving(false);
    if (response.ok) { setDraft(draftFromArticle(undefined, draft.kind)); setEditorMessage("Article saved."); setEditorOpen(false); await refresh(); return true; }
    else {
      setEditorMessage(await responseMessage(response, "Could not save article."));
      return false;
    }
  }

  async function deleteArticle(article: OperationArticle) {
    if (!confirm(`Delete ${article.title}?`)) return;
    if (devMode) {
      setState(current => ({ ...current, handbook: current.handbook.filter(item => item.id !== article.id), news: current.news.filter(item => item.id !== article.id) }));
      return;
    }
    await fetch(`/api/operation-module?entity=article&id=${encodeURIComponent(article.id)}`, { method: "DELETE" });
    await refresh();
  }

  async function addTask() {
    setTaskMessage("");
    if (!taskTitle.trim()) return;
    if (storageUnavailable) { setTaskMessage(migrationMessage); return; }
    const task: OperationDailyTask = { id: crypto.randomUUID(), weekday: new Date(`${taskDueDate}T00:00:00Z`).getUTCDay(), title: taskTitle.trim(), description: taskDescription.trim(), dueDate: taskDueDate, repeatUnit: taskRepeatUnit, repeatInterval: taskRepeatInterval, repeatEndDate: taskRepeatEndDate || null, completed: false };
    if (devMode) setState(current => ({ ...current, dailyTasks: [...current.dailyTasks, task] }));
    else {
      const response = await fetch("/api/operation-module", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "dailyTask", title: task.title, description: task.description, dueDate: task.dueDate, repeatUnit: task.repeatUnit, repeatInterval: task.repeatInterval, repeatEndDate: task.repeatEndDate }) });
      if (!response.ok) { setTaskMessage(await responseMessage(response, "Could not add daily task.")); return; }
      await refresh();
    }
    setTaskTitle(""); setTaskDescription(""); setTaskDueDate(state.today); setTaskRepeatUnit("NONE"); setTaskRepeatInterval(1); setTaskRepeatEndDate("");
  }

  async function toggleTask(task: OperationDailyTask) {
    setState(current => ({ ...current, dailyTasks: current.dailyTasks.map(item => item.id === task.id ? { ...item, completed: !item.completed } : item) }));
    if (!devMode) await fetch("/api/operation-module", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "dailyTask", id: task.id, date: state.today, completed: !task.completed }) });
  }

  async function addNeed() {
    setNeedMessage("");
    if (!needTitle.trim()) return;
    if (storageUnavailable) { setNeedMessage(migrationMessage); return; }
    const need: OperationNeed = { id: crypto.randomUUID(), title: needTitle.trim(), note: null, status: "NEEDED", createdAt: new Date().toISOString() };
    if (devMode) setState(current => ({ ...current, needs: [need, ...current.needs] }));
    else {
      const response = await fetch("/api/operation-module", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "need", title: need.title }) });
      if (!response.ok) { setNeedMessage(await responseMessage(response, "Could not add needed item.")); return; }
      await refresh();
    }
    setNeedTitle("");
  }

  async function markNeedOrdered(need: OperationNeed) {
    setState(current => ({ ...current, needs: current.needs.filter(item => item.id !== need.id) }));
    if (!devMode) await fetch("/api/operation-module", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "need", id: need.id, status: "ORDERED" }) });
  }

  return <div className={styles.operationShell}>
    <header className={styles.operationHeader}>
      <nav aria-label="Operation sections">
        {(["home", "handbook", "tasks", "needs"] as View[]).map(item => <button key={item} type="button" aria-pressed={view === item} onClick={() => setView(item)}>{item === "home" ? "Home" : item}</button>)}
      </nav>
    </header>
    <main className={styles.operationMain}>
      {storageUnavailable && <StorageNotice />}
      {view === "home" && <HomeView news={state.news} canManage={state.canManageContent} addNews={() => { setDraft(draftFromArticle(undefined, "NEWS")); setEditorOpen(!storageUnavailable); }} openArticle={(article) => setReaderStack([article])} openView={setView} />}
      {view === "handbook" && <HandbookView articles={filteredHandbook} categories={handbookCategories} query={query} category={category} canManage={state.canManageContent} addArticle={() => { setDraft(draftFromArticle(undefined, "HANDBOOK")); setEditorOpen(!storageUnavailable); }} setQuery={setQuery} setCategory={setCategory} openArticle={(article) => setReaderStack([article])} />}
      {view === "tasks" && <TasksView tasks={state.dailyTasks} canManage={state.canManageContent} taskTitle={taskTitle} taskDescription={taskDescription} taskDueDate={taskDueDate} taskRepeatUnit={taskRepeatUnit} taskRepeatInterval={taskRepeatInterval} taskRepeatEndDate={taskRepeatEndDate} setTaskTitle={setTaskTitle} setTaskDescription={setTaskDescription} setTaskDueDate={setTaskDueDate} setTaskRepeatUnit={setTaskRepeatUnit} setTaskRepeatInterval={setTaskRepeatInterval} setTaskRepeatEndDate={setTaskRepeatEndDate} addTask={addTask} toggleTask={toggleTask} disabled={storageUnavailable} message={taskMessage} />}
      {view === "needs" && <NeedsView needs={state.needs} needTitle={needTitle} setNeedTitle={setNeedTitle} addNeed={addNeed} markNeedOrdered={markNeedOrdered} disabled={storageUnavailable} message={needMessage} />}
      {state.canManageContent && <AdminPanel message={editorMessage} articles={allArticles} disabled={storageUnavailable} editArticle={(nextDraft) => { setDraft(nextDraft); setEditorMessage(storageUnavailable ? migrationMessage : ""); setEditorOpen(!storageUnavailable); }} deleteArticle={deleteArticle} />}
    </main>
    {currentArticle && <Reader article={currentArticle} canGoBack={readerStack.length > 1} goBack={() => setReaderStack(stack => stack.slice(0, -1))} close={() => setReaderStack([])} />}
    {editorOpen && <ArticleEditor draft={draft} setDraft={setDraft} saveArticle={saveArticle} saving={saving} message={editorMessage} close={() => { setEditorOpen(false); setEditorMessage(""); }} />}
  </div>;
}

function upsertArticle(list: OperationArticle[], article: OperationArticle) {
  return list.some(item => item.id === article.id) ? list.map(item => item.id === article.id ? article : item) : [article, ...list];
}

function HomeView({ news, canManage, addNews, openArticle, openView }: { news: OperationArticle[]; canManage: boolean; addNews: () => void; openArticle: (article: OperationArticle) => void; openView: (view: View) => void }) {
  return <><SectionHeader title="News" detail="Latest bar updates" action={canManage ? { label: "Add news", onClick: addNews } : undefined} /> <div className={styles.cardGrid}>{news.map(article => <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />)}{!news.length && <div className={styles.empty}>No news yet.</div>}</div><SectionHeader title="Modules" detail="Open a sub module" /><div className={styles.moduleGrid}><ModuleCard title="Handbook" description="Employee bar articles grouped by category." icon={BookOpen} onClick={() => openView("handbook")} /><ModuleCard title="Daily tasks" description="Date-specific and repeating tasks employees can complete." icon={CheckSquare} onClick={() => openView("tasks")} /><ModuleCard title="We need" description="A shared reminder-style order list." icon={ShoppingBasket} onClick={() => openView("needs")} /></div></>;
}

function StorageNotice() {
  return <section className={styles.storageNotice} role="status"><strong>Database migration needed</strong><p>Saved Operation articles, daily tasks and needed items will appear after the GitHub database migration action has run against production.</p></section>;
}

function HandbookView({ articles, categories, query, category, canManage, addArticle, setQuery, setCategory, openArticle }: { articles: OperationArticle[]; categories: string[]; query: string; category: string; canManage: boolean; addArticle: () => void; setQuery: (value: string) => void; setCategory: (value: string) => void; openArticle: (article: OperationArticle) => void }) {
  return <><SectionHeader title="Handbook" detail="Bar routines" action={canManage ? { label: "Add handbook article", onClick: addArticle } : undefined} /><div className={styles.toolbar}><input className={styles.search} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search handbook" /><div className={styles.pills}>{categories.map(item => <button key={item} className={styles.pill} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className={styles.articleGroups}>{articles.map(article => <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />)}{!articles.length && <div className={styles.empty}>No handbook articles found.</div>}</div></>;
}

function TasksView({ tasks, canManage, taskTitle, taskDescription, taskDueDate, taskRepeatUnit, taskRepeatInterval, taskRepeatEndDate, setTaskTitle, setTaskDescription, setTaskDueDate, setTaskRepeatUnit, setTaskRepeatInterval, setTaskRepeatEndDate, addTask, toggleTask, disabled, message }: { tasks: OperationDailyTask[]; canManage: boolean; taskTitle: string; taskDescription: string; taskDueDate: string; taskRepeatUnit: OperationTaskRepeatUnit; taskRepeatInterval: number; taskRepeatEndDate: string; setTaskTitle: (value: string) => void; setTaskDescription: (value: string) => void; setTaskDueDate: (value: string) => void; setTaskRepeatUnit: (value: OperationTaskRepeatUnit) => void; setTaskRepeatInterval: (value: number) => void; setTaskRepeatEndDate: (value: string) => void; addTask: () => void; toggleTask: (task: OperationDailyTask) => void; disabled: boolean; message: string }) {
  return <><SectionHeader title="Tasks" detail={`${weekdays[new Date().getDay()]} list`} />{canManage && <div className={styles.adminPanel}><h3>Add task</h3><div className={styles.adminGrid}><input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="Task title" disabled={disabled} /><input value={taskDescription} onChange={event => setTaskDescription(event.target.value)} placeholder="Short description" disabled={disabled} /></div><div className={styles.taskSettings}><label><CalendarDays size={15} />First date<input type="date" value={taskDueDate} onChange={event => setTaskDueDate(event.target.value)} disabled={disabled} /></label><label><Repeat2 size={15} />Repeat<select value={taskRepeatUnit} onChange={event => setTaskRepeatUnit(event.target.value as OperationTaskRepeatUnit)} disabled={disabled}><option value="NONE">Never</option><option value="DAY">Daily</option><option value="WEEK">Weekly</option><option value="MONTH">Monthly</option><option value="YEAR">Yearly</option></select></label>{taskRepeatUnit !== "NONE" && <><label>Every<input type="number" min="1" max="365" value={taskRepeatInterval} onChange={event => setTaskRepeatInterval(Math.max(1, Number(event.target.value) || 1))} disabled={disabled} /></label><label>Ends<input type="date" min={taskDueDate} value={taskRepeatEndDate} onChange={event => setTaskRepeatEndDate(event.target.value)} disabled={disabled} /></label></>}</div><p className={styles.settingsHint}>Set a first date for one-off work, or choose a repeat pattern. Leave “Ends” empty to repeat indefinitely.</p><div className={styles.adminActions}><button type="button" onClick={addTask} disabled={disabled}><Plus size={16} />Add task</button></div>{message && <p className={styles.editorMessage} role="status">{message}</p>}</div>}<div className={styles.taskList}>{tasks.map(task => <article className={styles.taskRow} key={task.id}><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} aria-label={`Mark ${task.title} complete`} disabled={disabled} /><div><h3>{task.title}</h3><p>{task.description}</p></div></article>)}{!tasks.length && <div className={styles.empty}>No tasks for today.</div>}</div></>;
}

function NeedsView({ needs, needTitle, setNeedTitle, addNeed, markNeedOrdered, disabled, message }: { needs: OperationNeed[]; needTitle: string; setNeedTitle: (value: string) => void; addNeed: () => void; markNeedOrdered: (need: OperationNeed) => void; disabled: boolean; message: string }) {
  return <><div className={styles.needInput}><input value={needTitle} onChange={event => setNeedTitle(event.target.value)} placeholder="Add something needed for the bar" disabled={disabled} /><button type="button" onClick={addNeed} disabled={disabled}><Plus size={16} />Add</button></div>{message && <p className={styles.editorMessage} role="status">{message}</p>}<div className={styles.needList}>{needs.map(need => <article className={styles.needRow} key={need.id} data-ordered={need.status === "ORDERED"}><ShoppingBasket size={22} /><div><h3>{need.title}</h3>{need.note && <p>{need.note}</p>}</div><button type="button" onClick={() => markNeedOrdered(need)} disabled={disabled}>Ordered</button></article>)}{!needs.length && <div className={styles.empty}>Nothing needed right now.</div>}</div></>;
}

function AdminPanel({ message, articles, disabled, editArticle, deleteArticle }: { message: string; articles: OperationArticle[]; disabled: boolean; editArticle: (draft: DraftArticle) => void; deleteArticle: (article: OperationArticle) => void }) {
  return <section className={styles.adminPanel}><div className={styles.adminPanelHeader}><div><h3>Owner articles</h3><p>Edit or remove handbook and news posts.</p></div></div>{message && <p className={styles.editorMessage} role="status">{message}</p>}<div className={styles.cardGrid}>{articles.map(article => <article className={styles.operationCard} key={article.id}><div><h3>{article.title}</h3><p>{article.kind.toLowerCase()} · {article.category}</p></div><div className={styles.adminActions}><button type="button" onClick={() => editArticle(draftFromArticle(article, article.kind))} disabled={disabled}>Edit</button><button type="button" onClick={() => deleteArticle(article)} aria-label={`Delete ${article.title}`} disabled={disabled}><Trash2 size={16} /></button></div></article>)}</div></section>;
}

function ArticleEditor({ draft, setDraft, saveArticle, saving, message, close }: { draft: DraftArticle; setDraft: (draft: DraftArticle) => void; saveArticle: () => Promise<boolean>; saving: boolean; message: string; close: () => void }) {
  const editorRef = useRef<HTMLElement | null>(null);

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

  return <aside ref={editorRef} className={styles.articleEditor} aria-modal="true" role="dialog" aria-label={draft.id ? "Edit article" : "Add article"}><div className={styles.articleEditorFrame}><div className={styles.articleEditorTop}><button type="button" className={styles.editorIconButton} onClick={close} aria-label="Close editor"><ArrowLeft size={22} /></button><button type="button" className={styles.editorDoneButton} disabled={saving} onClick={saveArticle} aria-label="Save article">{saving ? "Saving" : <Check size={24} />}</button></div><div className={styles.articleEditorCanvas}><div className={styles.editorMeta}><select value={draft.kind} onChange={event => setDraft({ ...draft, kind: event.target.value as OperationArticleKind })}><option value="HANDBOOK">Handbook</option><option value="NEWS">News</option></select><input value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })} placeholder="Category" /></div><input className={styles.editorTitleInput} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="Title" /><textarea className={styles.editorDescriptionInput} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="Short card description" /><TiptapArticleEditor value={draft.document} onChange={(document) => setDraft({ ...draft, document })} />{message && <p className={styles.editorMessage} role="status">{message}</p>}</div></div></aside>;
}

function TiptapArticleEditor({ value, onChange }: { value: OperationTiptapDocument; onChange: (document: OperationTiptapDocument) => void }) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef(onChange);
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      UnderlineExtension,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true, protocols: ["http", "https", "mailto", "tel"] }),
      ImageExtension.configure({ allowBase64: false, inline: false }),
      Placeholder.configure({ placeholder: "Write the article..." }),
    ],
    content: value,
    onUpdate: ({ editor: current }) => onChangeRef.current(current.getJSON() as OperationTiptapDocument),
  }, []);

  async function uploadImage(file: File) {
    if (!editor) return;
    setUploading(true);
    const form = new FormData();
    form.append("image", file);
    const response = await fetch("/api/operation-images", { method: "POST", body: form });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok || !payload || typeof payload !== "object" || !("url" in payload) || typeof payload.url !== "string") {
      alert(payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string" ? payload.error : "Could not upload image.");
      setUploading(false);
      return;
    }
    editor.chain().focus().setImage({ src: payload.url, alt: "Operation article image" }).run();
    setUploading(false);
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

  return <div className={styles.tiptapEditor}><input ref={imageInputRef} className={styles.imageInput} type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadImage(file); }} /><EditorContent editor={editor} className={styles.tiptapSurface} /><div className={styles.tiptapToolbar} role="toolbar" aria-label="Article formatting tools"><div className={styles.styleControl}><button type="button" className={styles.styleTrigger} onMouseDown={event => event.preventDefault()} onClick={() => { setStyleMenuOpen(open => !open); setMoreMenuOpen(false); }} aria-expanded={styleMenuOpen}><Type size={18} /><span>Style</span></button>{styleMenuOpen && <div className={styles.styleMenu} role="menu"><button type="button" role="menuitem" onMouseDown={event => event.preventDefault()} onClick={() => applyStyle("heading")}>Heading</button><button type="button" role="menuitem" onMouseDown={event => event.preventDefault()} onClick={() => applyStyle("subheading")}>Subheading</button><button type="button" role="menuitem" onMouseDown={event => event.preventDefault()} onClick={() => applyStyle("body")}>Body</button></div>}</div><button type="button" aria-label="Bold" aria-pressed={editor?.isActive("bold") || false} onMouseDown={event => event.preventDefault()} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold size={19} /></button><button type="button" aria-label="Italic" aria-pressed={editor?.isActive("italic") || false} onMouseDown={event => event.preventDefault()} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic size={19} /></button><button type="button" aria-label="Underline" aria-pressed={editor?.isActive("underline") || false} onMouseDown={event => event.preventDefault()} onClick={() => editor?.chain().focus().toggleUnderline().run()}><Underline size={19} /></button><button type="button" aria-label="Bullet list" aria-pressed={editor?.isActive("bulletList") || false} onMouseDown={event => event.preventDefault()} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List size={20} /></button><button type="button" aria-label="Add image from device" disabled={uploading} onMouseDown={event => event.preventDefault()} onClick={() => imageInputRef.current?.click()}><ImagePlus size={20} /></button><div className={styles.moreControl}><button type="button" aria-label="More formatting tools" onMouseDown={event => event.preventDefault()} onClick={() => { setMoreMenuOpen(open => !open); setStyleMenuOpen(false); }} aria-expanded={moreMenuOpen}><MoreHorizontal size={21} /></button>{moreMenuOpen && <div className={styles.moreMenu} role="menu"><button type="button" role="menuitem" aria-pressed={editor?.isActive("orderedList") || false} onClick={() => { editor?.chain().focus().toggleOrderedList().run(); setMoreMenuOpen(false); }}><ListOrdered size={18} />Numbered list</button><button type="button" role="menuitem" onClick={() => { setLink(); setMoreMenuOpen(false); }}><Link2 size={18} />Link</button><button type="button" role="menuitem" disabled={!editor?.can().undo()} onClick={() => { editor?.chain().focus().undo().run(); setMoreMenuOpen(false); }}><Undo2 size={18} />Undo</button><button type="button" role="menuitem" disabled={!editor?.can().redo()} onClick={() => { editor?.chain().focus().redo().run(); setMoreMenuOpen(false); }}><Redo2 size={18} />Redo</button></div>}</div></div></div>;
}

function SectionHeader({ title, detail, action }: { title: string; detail: string; action?: { label: string; onClick: () => void } }) {
  return <div className={styles.sectionHeader}><h2>{title}</h2><div>{<p>{detail}</p>}{action && <button className={styles.addCircle} type="button" onClick={action.onClick} aria-label={action.label}><Plus size={20} /></button>}</div></div>;
}

function ArticleCard({ article, onClick }: { article: OperationArticle; onClick: () => void }) {
  return <button type="button" className={styles.operationCard} onClick={onClick}><div><h3>{article.title}</h3><p>{article.description}</p></div><small>{article.category}</small></button>;
}

function ModuleCard({ title, description, icon: Icon, onClick }: { title: string; description: string; icon: typeof BookOpen; onClick: () => void }) {
  return <button type="button" className={styles.operationCard} onClick={onClick}><div><h3>{title}</h3><p>{description}</p></div><Icon size={26} /></button>;
}

function Reader({ article, canGoBack, goBack, close }: { article: OperationArticle; canGoBack: boolean; goBack: () => void; close: () => void }) {
  const content = article.content.length ? article.content : [{ type: "title" as const, text: article.title }, { type: "body" as const, text: article.description || "No article content has been added yet." }];
  return <aside className={styles.reader} aria-modal="true" role="dialog" aria-label={article.title}>{canGoBack && <div className={styles.readerTop}><button type="button" onClick={goBack}><ArrowLeft size={17} />Back</button></div>}<article className={styles.readerArticle}>{content.map((block, index) => <RenderBlock key={`${block.type}-${index}`} block={block} />)}</article><div className={styles.readerBottom}><button type="button" className={styles.closeCircle} onClick={close} aria-label="Close article"><X /></button></div></aside>;
}

function RenderBlock({ block }: { block: OperationContentBlock }) {
  if (block.type === "title") return <h1>{block.text}</h1>;
  if (block.type === "richText") return <RichTextArticle delta={block.delta} />;
  if (block.type === "tiptap") return <TiptapArticle document={block.document} />;
  if (block.type === "h1") return <h2>{block.text}</h2>;
  if (block.type === "h2") return <h3>{block.text}</h3>;
  if (block.type === "body") return <p>{block.text}</p>;
  if (block.type === "bullets") return <ul>{block.items.map(item => <li key={item}>{item}</li>)}</ul>;
  if (block.type === "numbered") return <ol>{block.items.map(item => <li key={item}>{item}</li>)}</ol>;
  if (block.type === "image") return <Image className={styles.readerImage} src={block.src} alt={block.alt} width={1200} height={800} unoptimized />;
  return null;
}

function TiptapArticle({ document }: { document: OperationTiptapDocument }) {
  return <>{document.content.map((node, index) => <TiptapNode key={index} node={node} />)}</>;
}

function TiptapNode({ node }: { node: OperationTiptapNode }) {
  const content = node.content?.map((child, index) => <TiptapNode key={index} node={child} />);
  if (node.type === "text") return <TiptapText node={node} />;
  if (node.type === "paragraph") return <p>{content}</p>;
  if (node.type === "heading") return node.attrs?.level === 3 ? <h3>{content}</h3> : <h2>{content}</h2>;
  if (node.type === "bulletList") return <ul>{content}</ul>;
  if (node.type === "orderedList") return <ol>{content}</ol>;
  if (node.type === "listItem") return <li>{content}</li>;
  if (node.type === "image" && typeof node.attrs?.src === "string") return <Image className={styles.readerImage} src={node.attrs.src} alt={typeof node.attrs.alt === "string" ? node.attrs.alt : ""} width={1200} height={800} unoptimized />;
  if (node.type === "hardBreak") return <br />;
  return null;
}

function TiptapText({ node }: { node: OperationTiptapNode }) {
  let content: ReactNode = node.text || "";
  node.marks?.forEach(mark => {
    if (mark.type === "bold") content = <strong>{content}</strong>;
    if (mark.type === "italic") content = <em>{content}</em>;
    if (mark.type === "underline") content = <u>{content}</u>;
    if (mark.type === "link" && typeof mark.attrs?.href === "string") content = <a href={mark.attrs.href} target="_blank" rel="noreferrer">{content}</a>;
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
  if (line.image) return <Image className={styles.readerImage} src={line.image} alt="" width={1200} height={800} unoptimized />;
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
