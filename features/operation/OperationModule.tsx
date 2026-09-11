"use client";

import Image from "next/image";
import { ArrowLeft, BookOpen, Check, CheckSquare, Plus, ShoppingBasket, Trash2, X } from "lucide-react";
import { useState } from "react";
import styles from "./OperationModule.module.css";
import type { OperationArticle, OperationArticleKind, OperationContentBlock, OperationDailyTask, OperationModuleState, OperationNeed } from "./types";

type View = "home" | "handbook" | "tasks" | "needs";
type DraftArticle = { id?: string; kind: OperationArticleKind; category: string; title: string; description: string; content: OperationContentBlock[] };
type EditableBlockType = Exclude<OperationContentBlock["type"], "title" | "articleLink">;

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function draftFromArticle(article?: OperationArticle, kind: OperationArticleKind = "HANDBOOK"): DraftArticle {
  const content = article?.content.filter(block => block.type !== "title" && block.type !== "articleLink") || [{ type: "body", text: "" }];
  return { id: article?.id, kind, category: article?.category || "General", title: article?.title || "", description: article?.description || "", content };
}

function blocksFromDraft(draft: DraftArticle): OperationContentBlock[] {
  const blocks: OperationContentBlock[] = [{ type: "title", text: draft.title }];
  return blocks.concat(draft.content.flatMap(cleanContentBlock));
}

function cleanContentBlock(block: OperationContentBlock): OperationContentBlock[] {
  if (block.type === "title" || block.type === "articleLink") return [];
  if (block.type === "image") {
    const src = block.src.trim();
    if (!src) return [];
    return [{ type: "image", src, alt: block.alt.trim() || "Article image" }];
  }
  if (block.type === "bullets" || block.type === "numbered") {
    const items = block.items.map(item => item.trim()).filter(Boolean);
    return items.length ? [{ type: block.type, items }] : [];
  }
  const text = block.text.trim();
  return text ? [{ type: block.type, text }] : [];
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
  const [editorOpen, setEditorOpen] = useState(false);
  const currentArticle = readerStack.at(-1) || null;
  const allArticles = [...state.news, ...state.handbook];
  const handbookCategories = ["All", ...Array.from(new Set(state.handbook.map(article => article.category)))];
  const filteredHandbook = state.handbook.filter(article => {
    const categoryMatch = category === "All" || article.category === category;
    const text = `${article.title} ${article.description} ${article.category}`.toLowerCase();
    return categoryMatch && text.includes(query.toLowerCase());
  });

  async function refresh() {
    if (devMode) return;
    const response = await fetch("/api/operation-module", { cache: "no-store" });
    const next = await response.json();
    if (response.ok) setState(next as OperationModuleState);
  }

  async function saveArticle() {
    setEditorMessage("");
    if (!draft.title.trim()) { setEditorMessage("Add an article title first."); return false; }
    if (!draft.description.trim()) { setEditorMessage("Add a short card description first."); return false; }
    const content = blocksFromDraft(draft);
    if (content.length < 2) { setEditorMessage("Add at least one content block before saving."); return false; }
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
      const failure: unknown = await response.json().catch(() => null);
      setEditorMessage(typeof failure === "object" && failure !== null && "error" in failure && typeof failure.error === "string" ? failure.error : "Could not save article.");
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
    if (!taskTitle.trim()) return;
    const task: OperationDailyTask = { id: crypto.randomUUID(), weekday: new Date(`${state.today}T00:00:00Z`).getUTCDay(), title: taskTitle.trim(), description: taskDescription.trim(), completed: false };
    if (devMode) setState(current => ({ ...current, dailyTasks: [...current.dailyTasks, task] }));
    else {
      await fetch("/api/operation-module", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "dailyTask", weekday: task.weekday, title: task.title, description: task.description }) });
      await refresh();
    }
    setTaskTitle(""); setTaskDescription("");
  }

  async function toggleTask(task: OperationDailyTask) {
    setState(current => ({ ...current, dailyTasks: current.dailyTasks.map(item => item.id === task.id ? { ...item, completed: !item.completed } : item) }));
    if (!devMode) await fetch("/api/operation-module", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "dailyTask", id: task.id, date: state.today, completed: !task.completed }) });
  }

  async function addNeed() {
    if (!needTitle.trim()) return;
    const need: OperationNeed = { id: crypto.randomUUID(), title: needTitle.trim(), note: null, status: "NEEDED", createdAt: new Date().toISOString() };
    if (devMode) setState(current => ({ ...current, needs: [need, ...current.needs] }));
    else {
      await fetch("/api/operation-module", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "need", title: need.title }) });
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
      {view === "home" && <HomeView news={state.news} openArticle={(article) => setReaderStack([article])} openView={setView} />}
      {view === "handbook" && <HandbookView articles={filteredHandbook} categories={handbookCategories} query={query} category={category} setQuery={setQuery} setCategory={setCategory} openArticle={(article) => setReaderStack([article])} />}
      {view === "tasks" && <TasksView tasks={state.dailyTasks} canManage={state.canManageContent} taskTitle={taskTitle} taskDescription={taskDescription} setTaskTitle={setTaskTitle} setTaskDescription={setTaskDescription} addTask={addTask} toggleTask={toggleTask} />}
      {view === "needs" && <NeedsView needs={state.needs} needTitle={needTitle} setNeedTitle={setNeedTitle} addNeed={addNeed} markNeedOrdered={markNeedOrdered} />}
      {state.canManageContent && <AdminPanel message={editorMessage} articles={allArticles} addArticle={(kind) => { setDraft(draftFromArticle(undefined, kind)); setEditorMessage(""); setEditorOpen(true); }} editArticle={(nextDraft) => { setDraft(nextDraft); setEditorMessage(""); setEditorOpen(true); }} deleteArticle={deleteArticle} />}
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

function HandbookView({ articles, categories, query, category, setQuery, setCategory, openArticle }: { articles: OperationArticle[]; categories: string[]; query: string; category: string; setQuery: (value: string) => void; setCategory: (value: string) => void; openArticle: (article: OperationArticle) => void }) {
  return <><div className={styles.toolbar}><input className={styles.search} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search handbook" /><div className={styles.pills}>{categories.map(item => <button key={item} className={styles.pill} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className={styles.articleGroups}>{articles.map(article => <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />)}{!articles.length && <div className={styles.empty}>No handbook articles found.</div>}</div></>;
}

function TasksView({ tasks, canManage, taskTitle, taskDescription, setTaskTitle, setTaskDescription, addTask, toggleTask }: { tasks: OperationDailyTask[]; canManage: boolean; taskTitle: string; taskDescription: string; setTaskTitle: (value: string) => void; setTaskDescription: (value: string) => void; addTask: () => void; toggleTask: (task: OperationDailyTask) => void }) {
  return <><p className={styles.subtleIntro}>{weekdays[new Date().getDay()]} task list</p>{canManage && <div className={styles.adminPanel}><h3>Add task</h3><div className={styles.adminGrid}><input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="Task title" /><input value={taskDescription} onChange={event => setTaskDescription(event.target.value)} placeholder="Short description" /></div><div className={styles.adminActions}><button type="button" onClick={addTask}><Plus size={16} />Add daily task</button></div></div>}<div className={styles.taskList}>{tasks.map(task => <article className={styles.taskRow} key={task.id}><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} aria-label={`Mark ${task.title} complete`} /><div><h3>{task.title}</h3><p>{task.description}</p></div></article>)}{!tasks.length && <div className={styles.empty}>No tasks for today.</div>}</div></>;
}

function NeedsView({ needs, needTitle, setNeedTitle, addNeed, markNeedOrdered }: { needs: OperationNeed[]; needTitle: string; setNeedTitle: (value: string) => void; addNeed: () => void; markNeedOrdered: (need: OperationNeed) => void }) {
  return <><div className={styles.needInput}><input value={needTitle} onChange={event => setNeedTitle(event.target.value)} placeholder="Add something needed for the bar" /><button type="button" onClick={addNeed}><Plus size={16} />Add</button></div><div className={styles.needList}>{needs.map(need => <article className={styles.needRow} key={need.id} data-ordered={need.status === "ORDERED"}><ShoppingBasket size={22} /><div><h3>{need.title}</h3>{need.note && <p>{need.note}</p>}</div><button type="button" onClick={() => markNeedOrdered(need)}>Ordered</button></article>)}{!needs.length && <div className={styles.empty}>Nothing needed right now.</div>}</div></>;
}

function AdminPanel({ message, articles, addArticle, editArticle, deleteArticle }: { message: string; articles: OperationArticle[]; addArticle: (kind: OperationArticleKind) => void; editArticle: (draft: DraftArticle) => void; deleteArticle: (article: OperationArticle) => void }) {
  return <section className={styles.adminPanel}><div className={styles.adminPanelHeader}><div><h3>Owner articles</h3><p>Manage handbook and news posts.</p></div><div className={styles.adminActions}><button type="button" onClick={() => addArticle("HANDBOOK")}><Plus size={16} />Add handbook article</button><button type="button" onClick={() => addArticle("NEWS")}><Plus size={16} />Add news</button></div></div>{message && <p className={styles.editorMessage} role="status">{message}</p>}<div className={styles.cardGrid}>{articles.map(article => <article className={styles.operationCard} key={article.id}><div><h3>{article.title}</h3><p>{article.kind.toLowerCase()} · {article.category}</p></div><div className={styles.adminActions}><button type="button" onClick={() => editArticle(draftFromArticle(article, article.kind))}>Edit</button><button type="button" onClick={() => deleteArticle(article)} aria-label={`Delete ${article.title}`}><Trash2 size={16} /></button></div></article>)}</div></section>;
}

function ArticleEditor({ draft, setDraft, saveArticle, saving, message, close }: { draft: DraftArticle; setDraft: (draft: DraftArticle) => void; saveArticle: () => Promise<boolean>; saving: boolean; message: string; close: () => void }) {
  const setBlock = (index: number, block: OperationContentBlock) => setDraft({ ...draft, content: draft.content.map((item, position) => position === index ? block : item) });
  const addBlock = (type: EditableBlockType) => setDraft({ ...draft, content: [...draft.content, emptyBlock(type)] });
  const removeBlock = (index: number) => setDraft({ ...draft, content: draft.content.length === 1 ? [emptyBlock("body")] : draft.content.filter((_, position) => position !== index) });
  const moveBlock = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draft.content.length) return;
    const content = [...draft.content];
    [content[index], content[nextIndex]] = [content[nextIndex], content[index]];
    setDraft({ ...draft, content });
  };
  return <aside className={styles.articleEditor} aria-modal="true" role="dialog" aria-label={draft.id ? "Edit article" : "Add article"}><div className={styles.articleEditorTop}><button type="button" className={styles.editorIconButton} onClick={close} aria-label="Close editor"><ArrowLeft size={22} /></button><button type="button" className={styles.editorDoneButton} disabled={saving} onClick={saveArticle} aria-label="Save article">{saving ? "Saving" : <Check size={24} />}</button></div><div className={styles.articleEditorCanvas}><div className={styles.editorMeta}><select value={draft.kind} onChange={event => setDraft({ ...draft, kind: event.target.value as OperationArticleKind })}><option value="HANDBOOK">Handbook</option><option value="NEWS">News</option></select><input value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })} placeholder="Category" /></div><input className={styles.editorTitleInput} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="Title" /><textarea className={styles.editorDescriptionInput} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="Short card description" /><div className={styles.notesEditor}>{draft.content.map((block, index) => <EditorBlock key={`${index}-${block.type}`} block={block} index={index} setBlock={setBlock} removeBlock={removeBlock} moveBlock={moveBlock} />)}</div>{message && <p className={styles.editorMessage} role="status">{message}</p>}</div><div className={styles.notesToolbar} aria-label="Add article content block">{(["body", "h1", "h2", "bullets", "numbered", "image"] as EditableBlockType[]).map(type => <button key={type} type="button" onClick={() => addBlock(type)}>{labelForBlock(type)}</button>)}</div></aside>;
}

function emptyBlock(type: EditableBlockType): OperationContentBlock {
  if (type === "image") return { type, src: "", alt: "" };
  if (type === "bullets" || type === "numbered") return { type, items: [""] };
  return { type, text: "" };
}

function labelForBlock(type: EditableBlockType) {
  return ({ body: "Text", h1: "Heading", h2: "Subhead", bullets: "Bullets", numbered: "Numbered", image: "Image" } satisfies Record<EditableBlockType, string>)[type];
}

function EditorBlock({ block, index, setBlock, removeBlock, moveBlock }: { block: OperationContentBlock; index: number; setBlock: (index: number, block: OperationContentBlock) => void; removeBlock: (index: number) => void; moveBlock: (index: number, direction: -1 | 1) => void }) {
  if (block.type === "title" || block.type === "articleLink") return null;
  const textClass = block.type === "h1" ? styles.editorH1 : block.type === "h2" ? styles.editorH2 : styles.editorBody;
  return <article className={styles.editorBlock}><div className={styles.editorBlockTools}><span>{labelForBlock(block.type)}</span><button type="button" onClick={() => moveBlock(index, -1)}>Up</button><button type="button" onClick={() => moveBlock(index, 1)}>Down</button><button type="button" onClick={() => removeBlock(index)}>Remove</button></div>{block.type === "image" ? <><input value={block.src} onChange={event => setBlock(index, { ...block, src: event.target.value })} placeholder="Image URL" /><input value={block.alt} onChange={event => setBlock(index, { ...block, alt: event.target.value })} placeholder="Image description" /></> : block.type === "bullets" || block.type === "numbered" ? <textarea value={block.items.join("\n")} onChange={event => setBlock(index, { type: block.type, items: event.target.value.split("\n") })} placeholder="One list item per line" /> : <textarea className={textClass} value={block.text} onChange={event => setBlock(index, { ...block, text: event.target.value })} placeholder={block.type === "body" ? "Start writing…" : "Heading text"} />}</article>;
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
  if (block.type === "h1") return <h2>{block.text}</h2>;
  if (block.type === "h2") return <h3>{block.text}</h3>;
  if (block.type === "body") return <p>{block.text}</p>;
  if (block.type === "bullets") return <ul>{block.items.map(item => <li key={item}>{item}</li>)}</ul>;
  if (block.type === "numbered") return <ol>{block.items.map(item => <li key={item}>{item}</li>)}</ol>;
  if (block.type === "image") return <Image className={styles.readerImage} src={block.src} alt={block.alt} width={1200} height={800} unoptimized />;
  return null;
}
