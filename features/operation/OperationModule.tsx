"use client";

import Image from "next/image";
import { ArrowLeft, BookOpen, Check, CheckSquare, Plus, ShoppingBasket, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import styles from "./OperationModule.module.css";
import type { OperationArticle, OperationArticleKind, OperationContentBlock, OperationDailyTask, OperationModuleState, OperationNeed, OperationRichTextDelta, OperationRichTextOp } from "./types";

type View = "home" | "handbook" | "tasks" | "needs";
type DraftArticle = { id?: string; kind: OperationArticleKind; category: string; title: string; description: string; delta: OperationRichTextDelta };
type QuillInstance = { getContents: () => OperationRichTextDelta; setContents: (delta: OperationRichTextDelta) => void; getSelection: (focus?: boolean) => { index: number; length: number } | null; insertEmbed: (index: number, type: string, value: string, source?: string) => void; setSelection: (index: number, length?: number, source?: string) => void; on: (event: "text-change", callback: () => void) => void; off: (event: "text-change", callback: () => void) => void };

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const migrationMessage = "Operation storage is not ready yet. Run the database migration action, then reload this page.";

function draftFromArticle(article?: OperationArticle, kind: OperationArticleKind = "HANDBOOK"): DraftArticle {
  return { id: article?.id, kind, category: article?.category || "General", title: article?.title || "", description: article?.description || "", delta: deltaFromBlocks(article?.content || []) };
}

function blocksFromDraft(draft: DraftArticle): OperationContentBlock[] {
  return [{ type: "title", text: draft.title }, { type: "richText", delta: cleanRichTextDelta(draft.delta) }];
}

function deltaFromBlocks(blocks: OperationContentBlock[]): OperationRichTextDelta {
  const richText = blocks.find(block => block.type === "richText");
  if (richText?.type === "richText") return cleanRichTextDelta(richText.delta);
  const ops = blocks.flatMap((block): OperationRichTextOp[] => {
    if (block.type === "title" || block.type === "articleLink") return [];
    if (block.type === "image") return block.src ? [{ insert: { image: block.src }, attributes: block.alt ? { alt: block.alt } : undefined }, { insert: "\n" }] : [];
    if (block.type === "bullets" || block.type === "numbered") return block.items.flatMap(item => item.trim() ? [{ insert: item.trim() }, { insert: "\n", attributes: { list: block.type === "bullets" ? "bullet" : "ordered" } }] : []);
    if (block.type === "h1") return block.text.trim() ? [{ insert: block.text.trim() }, { insert: "\n", attributes: { header: 1 } }] : [];
    if (block.type === "h2") return block.text.trim() ? [{ insert: block.text.trim() }, { insert: "\n", attributes: { header: 2 } }] : [];
    if (block.type === "richText") return block.delta.ops;
    return block.text.trim() ? [{ insert: `${block.text.trim()}\n` }] : [];
  });
  return ops.length ? { ops } : { ops: [{ insert: "\n" }] };
}

function cleanRichTextDelta(delta: OperationRichTextDelta): OperationRichTextDelta {
  const ops = Array.isArray(delta.ops) ? delta.ops.filter((op): op is OperationRichTextOp => typeof op.insert === "string" || (typeof op.insert === "object" && typeof op.insert.image === "string")).slice(0, 500) : [];
  return ops.length ? { ops } : { ops: [{ insert: "\n" }] };
}

function hasRichTextContent(delta: OperationRichTextDelta) {
  return delta.ops.some(op => typeof op.insert === "string" ? op.insert.trim().length > 0 : Boolean(op.insert.image));
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
    if (!hasRichTextContent(draft.delta)) { setEditorMessage("Add article text or an image before saving."); return false; }
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
    const task: OperationDailyTask = { id: crypto.randomUUID(), weekday: new Date(`${state.today}T00:00:00Z`).getUTCDay(), title: taskTitle.trim(), description: taskDescription.trim(), completed: false };
    if (devMode) setState(current => ({ ...current, dailyTasks: [...current.dailyTasks, task] }));
    else {
      const response = await fetch("/api/operation-module", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "dailyTask", weekday: task.weekday, title: task.title, description: task.description }) });
      if (!response.ok) { setTaskMessage(await responseMessage(response, "Could not add daily task.")); return; }
      await refresh();
    }
    setTaskTitle(""); setTaskDescription("");
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
      {view === "home" && <HomeView news={state.news} openArticle={(article) => setReaderStack([article])} openView={setView} />}
      {view === "handbook" && <HandbookView articles={filteredHandbook} categories={handbookCategories} query={query} category={category} setQuery={setQuery} setCategory={setCategory} openArticle={(article) => setReaderStack([article])} />}
      {view === "tasks" && <TasksView tasks={state.dailyTasks} canManage={state.canManageContent} taskTitle={taskTitle} taskDescription={taskDescription} setTaskTitle={setTaskTitle} setTaskDescription={setTaskDescription} addTask={addTask} toggleTask={toggleTask} disabled={storageUnavailable} message={taskMessage} />}
      {view === "needs" && <NeedsView needs={state.needs} needTitle={needTitle} setNeedTitle={setNeedTitle} addNeed={addNeed} markNeedOrdered={markNeedOrdered} disabled={storageUnavailable} message={needMessage} />}
      {state.canManageContent && <AdminPanel message={editorMessage} articles={allArticles} disabled={storageUnavailable} addArticle={(kind) => { setDraft(draftFromArticle(undefined, kind)); setEditorMessage(storageUnavailable ? migrationMessage : ""); setEditorOpen(!storageUnavailable); }} editArticle={(nextDraft) => { setDraft(nextDraft); setEditorMessage(storageUnavailable ? migrationMessage : ""); setEditorOpen(!storageUnavailable); }} deleteArticle={deleteArticle} />}
    </main>
    {currentArticle && <Reader article={currentArticle} canGoBack={readerStack.length > 1} goBack={() => setReaderStack(stack => stack.slice(0, -1))} close={() => setReaderStack([])} />}
    {editorOpen && <ArticleEditor draft={draft} setDraft={setDraft} saveArticle={saveArticle} saving={saving} message={editorMessage} close={() => { setEditorOpen(false); setEditorMessage(""); }} />}
  </div>;
}

function upsertArticle(list: OperationArticle[], article: OperationArticle) {
  return list.some(item => item.id === article.id) ? list.map(item => item.id === article.id ? article : item) : [article, ...list];
}

function HomeView({ news, openArticle, openView }: { news: OperationArticle[]; openArticle: (article: OperationArticle) => void; openView: (view: View) => void }) {
  return <><SectionHeader title="News" detail="Latest bar updates" /> <div className={styles.cardGrid}>{news.map(article => <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />)}{!news.length && <div className={styles.empty}>No news yet.</div>}</div><SectionHeader title="Modules" detail="Open a sub module" /><div className={styles.moduleGrid}><ModuleCard title="Handbook" description="Employee bar articles grouped by category." icon={BookOpen} onClick={() => openView("handbook")} /><ModuleCard title="Daily tasks" description="Day-specific task lists employees can complete." icon={CheckSquare} onClick={() => openView("tasks")} /><ModuleCard title="We need" description="A shared reminder-style order list." icon={ShoppingBasket} onClick={() => openView("needs")} /></div></>;
}

function StorageNotice() {
  return <section className={styles.storageNotice} role="status"><strong>Database migration needed</strong><p>Saved Operation articles, daily tasks and needed items will appear after the GitHub database migration action has run against production.</p></section>;
}

function HandbookView({ articles, categories, query, category, setQuery, setCategory, openArticle }: { articles: OperationArticle[]; categories: string[]; query: string; category: string; setQuery: (value: string) => void; setCategory: (value: string) => void; openArticle: (article: OperationArticle) => void }) {
  return <><div className={styles.toolbar}><input className={styles.search} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search handbook" /><div className={styles.pills}>{categories.map(item => <button key={item} className={styles.pill} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className={styles.articleGroups}>{articles.map(article => <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />)}{!articles.length && <div className={styles.empty}>No handbook articles found.</div>}</div></>;
}

function TasksView({ tasks, canManage, taskTitle, taskDescription, setTaskTitle, setTaskDescription, addTask, toggleTask, disabled, message }: { tasks: OperationDailyTask[]; canManage: boolean; taskTitle: string; taskDescription: string; setTaskTitle: (value: string) => void; setTaskDescription: (value: string) => void; addTask: () => void; toggleTask: (task: OperationDailyTask) => void; disabled: boolean; message: string }) {
  return <><p className={styles.subtleIntro}>{weekdays[new Date().getDay()]} task list</p>{canManage && <div className={styles.adminPanel}><h3>Add task</h3><div className={styles.adminGrid}><input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="Task title" disabled={disabled} /><input value={taskDescription} onChange={event => setTaskDescription(event.target.value)} placeholder="Short description" disabled={disabled} /></div><div className={styles.adminActions}><button type="button" onClick={addTask} disabled={disabled}><Plus size={16} />Add daily task</button></div>{message && <p className={styles.editorMessage} role="status">{message}</p>}</div>}<div className={styles.taskList}>{tasks.map(task => <article className={styles.taskRow} key={task.id}><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} aria-label={`Mark ${task.title} complete`} disabled={disabled} /><div><h3>{task.title}</h3><p>{task.description}</p></div></article>)}{!tasks.length && <div className={styles.empty}>No tasks for today.</div>}</div></>;
}

function NeedsView({ needs, needTitle, setNeedTitle, addNeed, markNeedOrdered, disabled, message }: { needs: OperationNeed[]; needTitle: string; setNeedTitle: (value: string) => void; addNeed: () => void; markNeedOrdered: (need: OperationNeed) => void; disabled: boolean; message: string }) {
  return <><div className={styles.needInput}><input value={needTitle} onChange={event => setNeedTitle(event.target.value)} placeholder="Add something needed for the bar" disabled={disabled} /><button type="button" onClick={addNeed} disabled={disabled}><Plus size={16} />Add</button></div>{message && <p className={styles.editorMessage} role="status">{message}</p>}<div className={styles.needList}>{needs.map(need => <article className={styles.needRow} key={need.id} data-ordered={need.status === "ORDERED"}><ShoppingBasket size={22} /><div><h3>{need.title}</h3>{need.note && <p>{need.note}</p>}</div><button type="button" onClick={() => markNeedOrdered(need)} disabled={disabled}>Ordered</button></article>)}{!needs.length && <div className={styles.empty}>Nothing needed right now.</div>}</div></>;
}

function AdminPanel({ message, articles, disabled, addArticle, editArticle, deleteArticle }: { message: string; articles: OperationArticle[]; disabled: boolean; addArticle: (kind: OperationArticleKind) => void; editArticle: (draft: DraftArticle) => void; deleteArticle: (article: OperationArticle) => void }) {
  return <section className={styles.adminPanel}><div className={styles.adminPanelHeader}><div><h3>Owner articles</h3><p>Manage handbook and news posts.</p></div><div className={styles.adminActions}><button type="button" onClick={() => addArticle("HANDBOOK")} disabled={disabled}><Plus size={16} />Add handbook article</button><button type="button" onClick={() => addArticle("NEWS")} disabled={disabled}><Plus size={16} />Add news</button></div></div>{message && <p className={styles.editorMessage} role="status">{message}</p>}<div className={styles.cardGrid}>{articles.map(article => <article className={styles.operationCard} key={article.id}><div><h3>{article.title}</h3><p>{article.kind.toLowerCase()} · {article.category}</p></div><div className={styles.adminActions}><button type="button" onClick={() => editArticle(draftFromArticle(article, article.kind))} disabled={disabled}>Edit</button><button type="button" onClick={() => deleteArticle(article)} aria-label={`Delete ${article.title}`} disabled={disabled}><Trash2 size={16} /></button></div></article>)}</div></section>;
}

function ArticleEditor({ draft, setDraft, saveArticle, saving, message, close }: { draft: DraftArticle; setDraft: (draft: DraftArticle) => void; saveArticle: () => Promise<boolean>; saving: boolean; message: string; close: () => void }) {
  return <aside className={styles.articleEditor} aria-modal="true" role="dialog" aria-label={draft.id ? "Edit article" : "Add article"}><div className={styles.articleEditorTop}><button type="button" className={styles.editorIconButton} onClick={close} aria-label="Close editor"><ArrowLeft size={22} /></button><button type="button" className={styles.editorDoneButton} disabled={saving} onClick={saveArticle} aria-label="Save article">{saving ? "Saving" : <Check size={24} />}</button></div><div className={styles.articleEditorCanvas}><div className={styles.editorMeta}><select value={draft.kind} onChange={event => setDraft({ ...draft, kind: event.target.value as OperationArticleKind })}><option value="HANDBOOK">Handbook</option><option value="NEWS">News</option></select><input value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })} placeholder="Category" /></div><input className={styles.editorTitleInput} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="Title" /><textarea className={styles.editorDescriptionInput} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="Short card description" /><QuillArticleEditor value={draft.delta} onChange={(delta) => setDraft({ ...draft, delta })} />{message && <p className={styles.editorMessage} role="status">{message}</p>}</div></aside>;
}

function QuillArticleEditor({ value, onChange }: { value: OperationRichTextDelta; onChange: (delta: OperationRichTextDelta) => void }) {
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => {
    let active = true;
    let textChange: (() => void) | null = null;
    const editorElement = editorRef.current;
    async function loadQuill() {
      if (!toolbarRef.current || !editorElement || quillRef.current) return;
      const { default: Quill } = await import("quill");
      if (!active || !toolbarRef.current || !editorElement) return;
      const quill = new Quill(editorElement, {
        modules: { toolbar: { container: toolbarRef.current, handlers: { image: function imageHandler(this: { quill: QuillInstance }) {
          const src = prompt("Paste image URL");
          if (!src?.trim()) return;
          const range = this.quill.getSelection(true) || { index: this.quill.getContents().ops.length, length: 0 };
          this.quill.insertEmbed(range.index, "image", src.trim(), "user");
          this.quill.setSelection(range.index + 1, 0, "user");
        } } }, history: { delay: 500, maxStack: 100, userOnly: true } },
        placeholder: "Write the article...",
        theme: "snow",
      }) as unknown as QuillInstance;
      quill.setContents(cleanRichTextDelta(initialValueRef.current));
      textChange = () => onChangeRef.current(cleanRichTextDelta(quill.getContents()));
      quill.on("text-change", textChange);
      quillRef.current = quill;
    }
    void loadQuill();
    return () => {
      active = false;
      if (textChange && quillRef.current) quillRef.current.off("text-change", textChange);
      quillRef.current = null;
      if (editorElement) editorElement.innerHTML = "";
    };
  }, []);

  return <div className={styles.quillEditor}><div ref={toolbarRef} className={styles.quillToolbar} aria-label="Article formatting tools"><select className="ql-header" defaultValue=""><option value="1">Title</option><option value="2">H1</option><option value="3">H2</option><option value="">Body</option></select><button className="ql-bold" type="button" aria-label="Bold" /><button className="ql-italic" type="button" aria-label="Italic" /><button className="ql-underline" type="button" aria-label="Underline" /><button className="ql-strike" type="button" aria-label="Strike" /><button className="ql-list" value="bullet" type="button" aria-label="Bullet list" /><button className="ql-list" value="ordered" type="button" aria-label="Numbered list" /><button className="ql-link" type="button" aria-label="Add link" /><button className="ql-image" type="button" aria-label="Add image" /><select className="ql-align" defaultValue=""><option value="" /><option value="center" /><option value="right" /></select><select className="ql-color" defaultValue=""><option value="" /><option value="#d9b833" /><option value="#78a353" /><option value="#ffffff" /></select><button className="ql-clean" type="button" aria-label="Clear formatting" /></div><div ref={editorRef} className={styles.quillSurface} /></div>;
}

function SectionHeader({ title, detail }: { title: string; detail: string }) {
  return <div className={styles.sectionHeader}><h2>{title}</h2><p>{detail}</p></div>;
}

function ArticleCard({ article, onClick }: { article: OperationArticle; onClick: () => void }) {
  return <button type="button" className={styles.operationCard} onClick={onClick}><div><h3>{article.title}</h3><p>{article.description}</p></div><small>{article.category}</small></button>;
}

function ModuleCard({ title, description, icon: Icon, onClick }: { title: string; description: string; icon: typeof BookOpen; onClick: () => void }) {
  return <button type="button" className={styles.operationCard} onClick={onClick}><div><h3>{title}</h3><p>{description}</p></div><Icon size={26} /></button>;
}

function Reader({ article, canGoBack, goBack, close }: { article: OperationArticle; canGoBack: boolean; goBack: () => void; close: () => void }) {
  return <aside className={styles.reader} aria-modal="true" role="dialog" aria-label={article.title}>{canGoBack && <div className={styles.readerTop}><button type="button" onClick={goBack}><ArrowLeft size={17} />Back</button></div>}<article className={styles.readerArticle}>{article.content.map((block, index) => <RenderBlock key={`${block.type}-${index}`} block={block} />)}</article><div className={styles.readerBottom}><button type="button" className={styles.closeCircle} onClick={close} aria-label="Close article"><X /></button></div></aside>;
}

function RenderBlock({ block }: { block: OperationContentBlock }) {
  if (block.type === "title") return <h1>{block.text}</h1>;
  if (block.type === "richText") return <RichTextArticle delta={block.delta} />;
  if (block.type === "h1") return <h2>{block.text}</h2>;
  if (block.type === "h2") return <h3>{block.text}</h3>;
  if (block.type === "body") return <p>{block.text}</p>;
  if (block.type === "bullets") return <ul>{block.items.map(item => <li key={item}>{item}</li>)}</ul>;
  if (block.type === "numbered") return <ol>{block.items.map(item => <li key={item}>{item}</li>)}</ol>;
  if (block.type === "image") return <Image className={styles.readerImage} src={block.src} alt={block.alt} width={1200} height={800} unoptimized />;
  return null;
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
  if (line.attributes?.header === 1) return <h2>{content}</h2>;
  if (line.attributes?.header === 2) return <h3>{content}</h3>;
  if (line.attributes?.header === 3) return <h4>{content}</h4>;
  return <p>{content}</p>;
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
