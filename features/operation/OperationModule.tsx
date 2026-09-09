"use client";

import Image from "next/image";
import { ArrowLeft, BookOpen, CheckSquare, Megaphone, Plus, ShoppingBasket, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./OperationModule.module.css";
import type { OperationArticle, OperationArticleKind, OperationContentBlock, OperationDailyTask, OperationModuleState, OperationNeed } from "./types";

type View = "home" | "handbook" | "tasks" | "needs";
type DraftArticle = { id?: string; kind: OperationArticleKind; category: string; title: string; description: string; body: string; linkId: string; imageSrc: string };

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function draftFromArticle(article?: OperationArticle, kind: OperationArticleKind = "HANDBOOK"): DraftArticle {
  const body = article?.content.filter(block => block.type === "body" || block.type === "h1" || block.type === "h2").map(block => "text" in block ? block.text : "").join("\n\n") || "";
  const link = article?.content.find((block): block is { type: "articleLink"; articleId: string; label: string } => block.type === "articleLink");
  const image = article?.content.find((block): block is { type: "image"; src: string; alt: string } => block.type === "image");
  return { id: article?.id, kind, category: article?.category || "General", title: article?.title || "", description: article?.description || "", body, linkId: link?.articleId || "", imageSrc: image?.src || "" };
}

function blocksFromDraft(draft: DraftArticle): OperationContentBlock[] {
  const blocks: OperationContentBlock[] = [{ type: "title", text: draft.title }];
  for (const paragraph of draft.body.split(/\n{2,}/).map(item => item.trim()).filter(Boolean)) blocks.push({ type: "body", text: paragraph });
  if (draft.imageSrc.trim()) blocks.push({ type: "image", src: draft.imageSrc.trim(), alt: draft.title });
  if (draft.linkId) blocks.push({ type: "articleLink", articleId: draft.linkId, label: "Open linked article" });
  return blocks;
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
  const currentArticle = readerStack.at(-1) || null;
  const allArticles = [...state.news, ...state.handbook];
  const handbookCategories = ["All", ...Array.from(new Set(state.handbook.map(article => article.category)))];
  const filteredHandbook = state.handbook.filter(article => {
    const categoryMatch = category === "All" || article.category === category;
    const text = `${article.title} ${article.description} ${article.category}`.toLowerCase();
    return categoryMatch && text.includes(query.toLowerCase());
  });
  const groupedHandbook = useMemo(() => {
    const groups = new Map<string, OperationArticle[]>();
    for (const article of filteredHandbook) groups.set(article.category, [...(groups.get(article.category) || []), article]);
    return [...groups.entries()];
  }, [filteredHandbook]);

  async function refresh() {
    if (devMode) return;
    const response = await fetch("/api/operation-module", { cache: "no-store" });
    const next = await response.json();
    if (response.ok) setState(next as OperationModuleState);
  }

  async function saveArticle() {
    if (!draft.title.trim() || !draft.description.trim()) return;
    const article: OperationArticle = {
      id: draft.id || crypto.randomUUID(),
      kind: draft.kind,
      category: draft.category.trim() || "General",
      title: draft.title.trim(),
      description: draft.description.trim(),
      content: blocksFromDraft(draft),
      published: true,
      updatedAt: new Date().toISOString(),
    };
    if (devMode) {
      setState(current => ({ ...current, handbook: article.kind === "HANDBOOK" ? upsertArticle(current.handbook, article) : current.handbook, news: article.kind === "NEWS" ? upsertArticle(current.news, article) : current.news }));
      setDraft(draftFromArticle(undefined, draft.kind));
      return;
    }
    setSaving(true);
    const response = await fetch("/api/operation-module", { method: draft.id ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity: "article", id: draft.id, kind: article.kind, category: article.category, title: article.title, description: article.description, content: article.content }) });
    setSaving(false);
    if (response.ok) { setDraft(draftFromArticle(undefined, draft.kind)); await refresh(); }
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
      {view === "handbook" && <HandbookView articles={groupedHandbook} categories={handbookCategories} query={query} category={category} setQuery={setQuery} setCategory={setCategory} openArticle={(article) => setReaderStack([article])} />}
      {view === "tasks" && <TasksView tasks={state.dailyTasks} canManage={state.canManageContent} taskTitle={taskTitle} taskDescription={taskDescription} setTaskTitle={setTaskTitle} setTaskDescription={setTaskDescription} addTask={addTask} toggleTask={toggleTask} />}
      {view === "needs" && <NeedsView needs={state.needs} needTitle={needTitle} setNeedTitle={setNeedTitle} addNeed={addNeed} markNeedOrdered={markNeedOrdered} />}
      {state.canManageContent && <AdminPanel draft={draft} setDraft={setDraft} saveArticle={saveArticle} saving={saving} articles={allArticles} editArticle={setDraft} deleteArticle={deleteArticle} />}
    </main>
    {currentArticle && <Reader article={currentArticle} allArticles={allArticles} canGoBack={readerStack.length > 1} goBack={() => setReaderStack(stack => stack.slice(0, -1))} close={() => setReaderStack([])} openLinked={(article) => setReaderStack(stack => [...stack, article])} />}
  </div>;
}

function upsertArticle(list: OperationArticle[], article: OperationArticle) {
  return list.some(item => item.id === article.id) ? list.map(item => item.id === article.id ? article : item) : [article, ...list];
}

function HomeView({ news, openArticle, openView }: { news: OperationArticle[]; openArticle: (article: OperationArticle) => void; openView: (view: View) => void }) {
  return <><section className={styles.hero}><h1>Operation</h1><p>News, handbook articles, daily tasks and things the bar needs — in a separate module without the main side menu.</p></section><SectionHeader title="News" detail="Latest bar updates" /> <div className={styles.cardGrid}>{news.map(article => <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />)}{!news.length && <div className={styles.empty}>No news yet.</div>}</div><SectionHeader title="Modules" detail="Open a sub module" /><div className={styles.moduleGrid}><ModuleCard title="Handbook" description="Employee bar articles grouped by category." icon={BookOpen} onClick={() => openView("handbook")} /><ModuleCard title="Daily tasks" description="Day-specific task lists employees can complete." icon={CheckSquare} onClick={() => openView("tasks")} /><ModuleCard title="We need" description="A shared reminder-style order list." icon={ShoppingBasket} onClick={() => openView("needs")} /><ModuleCard title="News" description="Team updates in full-screen reader cards." icon={Megaphone} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} /></div></>;
}

function HandbookView({ articles, categories, query, category, setQuery, setCategory, openArticle }: { articles: Array<[string, OperationArticle[]]>; categories: string[]; query: string; category: string; setQuery: (value: string) => void; setCategory: (value: string) => void; openArticle: (article: OperationArticle) => void }) {
  return <><h1 className={styles.pageTitle}>Handbook</h1><div className={styles.toolbar}><input className={styles.search} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search handbook" /><div className={styles.pills}>{categories.map(item => <button key={item} className={styles.pill} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className={styles.articleGroups}>{articles.map(([group, groupArticles]) => <section className={styles.group} key={group}><h2>{group}</h2>{groupArticles.map(article => <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />)}</section>)}{!articles.length && <div className={styles.empty}>No handbook articles found.</div>}</div></>;
}

function TasksView({ tasks, canManage, taskTitle, taskDescription, setTaskTitle, setTaskDescription, addTask, toggleTask }: { tasks: OperationDailyTask[]; canManage: boolean; taskTitle: string; taskDescription: string; setTaskTitle: (value: string) => void; setTaskDescription: (value: string) => void; addTask: () => void; toggleTask: (task: OperationDailyTask) => void }) {
  return <><h1 className={styles.pageTitle}>Daily tasks</h1><p>{weekdays[new Date().getDay()]} task list</p>{canManage && <div className={styles.adminPanel}><h3>Add task</h3><div className={styles.adminGrid}><input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="Task title" /><input value={taskDescription} onChange={event => setTaskDescription(event.target.value)} placeholder="Short description" /></div><div className={styles.adminActions}><button type="button" onClick={addTask}><Plus size={16} />Add daily task</button></div></div>}<div className={styles.taskList}>{tasks.map(task => <article className={styles.taskRow} key={task.id}><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} aria-label={`Mark ${task.title} complete`} /><div><h3>{task.title}</h3><p>{task.description}</p></div></article>)}{!tasks.length && <div className={styles.empty}>No tasks for today.</div>}</div></>;
}

function NeedsView({ needs, needTitle, setNeedTitle, addNeed, markNeedOrdered }: { needs: OperationNeed[]; needTitle: string; setNeedTitle: (value: string) => void; addNeed: () => void; markNeedOrdered: (need: OperationNeed) => void }) {
  return <><h1 className={styles.pageTitle}>We need</h1><div className={styles.needInput}><input value={needTitle} onChange={event => setNeedTitle(event.target.value)} placeholder="Add something needed for the bar" /><button type="button" onClick={addNeed}><Plus size={16} />Add</button></div><div className={styles.needList}>{needs.map(need => <article className={styles.needRow} key={need.id} data-ordered={need.status === "ORDERED"}><ShoppingBasket size={22} /><div><h3>{need.title}</h3>{need.note && <p>{need.note}</p>}</div><button type="button" onClick={() => markNeedOrdered(need)}>Ordered</button></article>)}{!needs.length && <div className={styles.empty}>Nothing needed right now.</div>}</div></>;
}

function AdminPanel({ draft, setDraft, saveArticle, saving, articles, editArticle, deleteArticle }: { draft: DraftArticle; setDraft: (draft: DraftArticle) => void; saveArticle: () => void; saving: boolean; articles: OperationArticle[]; editArticle: (draft: DraftArticle) => void; deleteArticle: (article: OperationArticle) => void }) {
  return <section className={styles.adminPanel}><h3>Owner editor</h3><div className={styles.adminGrid}><select value={draft.kind} onChange={event => setDraft({ ...draft, kind: event.target.value as OperationArticleKind })}><option value="HANDBOOK">Handbook</option><option value="NEWS">News</option></select><input value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })} placeholder="Category" /><input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="Title" /><input value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="Description" /><input value={draft.imageSrc} onChange={event => setDraft({ ...draft, imageSrc: event.target.value })} placeholder="Optional image URL" /><select value={draft.linkId} onChange={event => setDraft({ ...draft, linkId: event.target.value })}><option value="">No linked article</option>{articles.map(article => <option key={article.id} value={article.id}>{article.title}</option>)}</select><textarea value={draft.body} onChange={event => setDraft({ ...draft, body: event.target.value })} placeholder="Article body. Separate paragraphs with blank lines." /></div><div className={styles.adminActions}><button type="button" disabled={saving} onClick={saveArticle}>{draft.id ? "Save article" : "Add article"}</button><button type="button" onClick={() => setDraft(draftFromArticle(undefined, draft.kind))}>Clear</button></div><div className={styles.cardGrid}>{articles.map(article => <article className={styles.operationCard} key={article.id}><div><h3>{article.title}</h3><p>{article.kind.toLowerCase()} · {article.category}</p></div><div className={styles.adminActions}><button type="button" onClick={() => editArticle(draftFromArticle(article, article.kind))}>Edit</button><button type="button" onClick={() => deleteArticle(article)}><Trash2 size={16} /></button></div></article>)}</div></section>;
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

function Reader({ article, allArticles, canGoBack, goBack, close, openLinked }: { article: OperationArticle; allArticles: OperationArticle[]; canGoBack: boolean; goBack: () => void; close: () => void; openLinked: (article: OperationArticle) => void }) {
  return <aside className={styles.reader} aria-modal="true" role="dialog" aria-label={article.title}><div className={styles.readerTop}>{canGoBack ? <button type="button" onClick={goBack}><ArrowLeft size={17} />Back</button> : <span />}<button type="button" onClick={close}>Close</button></div><article className={styles.readerArticle}>{article.content.map((block, index) => <RenderBlock key={`${block.type}-${index}`} block={block} allArticles={allArticles} openLinked={openLinked} />)}</article><div className={styles.readerBottom}><button type="button" className={styles.closeCircle} onClick={close} aria-label="Close article"><X /></button></div></aside>;
}

function RenderBlock({ block, allArticles, openLinked }: { block: OperationContentBlock; allArticles: OperationArticle[]; openLinked: (article: OperationArticle) => void }) {
  if (block.type === "title") return <h1>{block.text}</h1>;
  if (block.type === "h1") return <h2>{block.text}</h2>;
  if (block.type === "h2") return <h3>{block.text}</h3>;
  if (block.type === "body") return <p>{block.text}</p>;
  if (block.type === "bullets") return <ul>{block.items.map(item => <li key={item}>{item}</li>)}</ul>;
  if (block.type === "numbered") return <ol>{block.items.map(item => <li key={item}>{item}</li>)}</ol>;
  if (block.type === "image") return <Image className={styles.readerImage} src={block.src} alt={block.alt} width={1200} height={800} unoptimized />;
  const linked = allArticles.find(article => article.id === block.articleId);
  return <button type="button" className={styles.articleLink} disabled={!linked} onClick={() => linked && openLinked(linked)}><span>{block.label}</span></button>;
}
