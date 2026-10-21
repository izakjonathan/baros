import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import ts from "typescript";

// Load the real client component without adding a public test route/export.
const projectRoot = process.cwd();
const require = createRequire(path.join(projectRoot, "package.json"));
const cache = new Map();
function loadSource(filename, extraSource = "") {
  filename = path.resolve(filename);
  if (cache.has(filename)) return cache.get(filename).exports;
  const compiled = new Module(filename);
  cache.set(filename, compiled);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  const localRequire = createRequire(filename);
  compiled.require = specifier => {
    if (specifier.endsWith(".css")) {
      return Object.fromEntries([...fs.readFileSync(path.resolve(path.dirname(filename), specifier), "utf8").matchAll(/\.([a-zA-Z][\w-]*)/g)].map(match => [match[1], match[1]]));
    }
    if (specifier.startsWith(".") || specifier.startsWith("@/")) {
      const base = specifier.startsWith("@/") ? path.join(projectRoot, specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
      const source = [base, base + ".ts", base + ".tsx"].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (source?.match(/\.tsx?$/)) return loadSource(source);
    }
    return localRequire(specifier);
  };
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8") + extraSource, {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  compiled._compile(output.outputText, filename);
  return compiled.exports;
}

const dom = new JSDOM('<div id="root"></div>', { url: "https://barops.example/operation", pretendToBeVisual: true });
for (const name of ["window", "document", "navigator", "localStorage", "HTMLElement", "Element", "Node", "DOMParser", "MutationObserver", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
  Object.defineProperty(globalThis, name, { value: typeof dom.window[name] === "function" && /^(getComputedStyle|requestAnimationFrame|cancelAnimationFrame)$/.test(name) ? dom.window[name].bind(dom.window) : dom.window[name], configurable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// jsdom does not perform layout; stub only the caret geometry ProseMirror reads.
dom.window.Range.prototype.getClientRects = () => [];
dom.window.Range.prototype.getBoundingClientRect = () => ({ top: 0, bottom: 0, left: 0, right: 0, height: 0, width: 0 });
const viewport = new dom.window.EventTarget();
viewport.height = 844;
viewport.offsetTop = 0;
Object.defineProperty(window, "visualViewport", { value: viewport, configurable: true });
const React = require("react");
const { createRoot } = require("react-dom/client");
const { act } = React;
const { ArticleEditor, OperationModule } = loadSource("features/operation/OperationModule.tsx", "\nexport { ArticleEditor };");
const root = createRoot(document.getElementById("root"));
let draft = {
  id: "existing-note", kind: "HANDBOOK", category: "General", title: "Test note", description: "",
  document: { type: "doc", content: Array.from({ length: 40 }, (_, index) => ({ type: "paragraph", content: [{ type: "text", text: `Line ${index + 1} of a long note` }] })) },
};
function Harness() {
  const [value, setValue] = React.useState(draft);
  return React.createElement(ArticleEditor, {
    draft: value, categories: ["General"], linkableArticles: [], setDraft: next => { draft = next; setValue(next); },
    saveArticle: async () => true, saving: false, message: "", close: () => {},
  });
}
await act(async () => { root.render(React.createElement(Harness)); });
await act(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); });
const dialog = document.querySelector('[aria-label="Edit article"]');
const canvas = dialog.querySelector(".articleEditorCanvas");
const footer = dialog.querySelector(".articleEditorControls");
const toolbar = dialog.querySelector('[role="toolbar"]');
assert.ok(footer.contains(toolbar));
assert.ok(!canvas.contains(toolbar), "format controls must not be clipped by the scrolling article");
assert.deepEqual([...dialog.querySelector(".articleEditorFrame").children].map(child => child.className), ["articleEditorTop", "articleEditorCanvas", "articleEditorControls"]);
assert.equal(toolbar.children.length, 8);
console.log("PASS real editor mounts all eight format controls in a separate footer");

for (const [height, offsetTop] of [[420, 0], [360, 72], [260, 0], [844, 0]]) {
  await act(async () => {
    viewport.height = height;
    viewport.offsetTop = offsetTop;
    viewport.dispatchEvent(new dom.window.Event("resize"));
    viewport.dispatchEvent(new dom.window.Event("scroll"));
    canvas.scrollTop = 800;
    canvas.dispatchEvent(new dom.window.Event("scroll"));
  });
  assert.equal(dialog.style.getPropertyValue("--editor-vv-height"), `${height}px`);
  assert.equal(dialog.style.getPropertyValue("--editor-vv-top"), `${offsetTop}px`);
  assert.ok(footer.contains(toolbar) && !canvas.contains(toolbar));
}
console.log("PASS simulated keyboard resize, viewport pan, landscape and dismissal update the editor frame");

const editorElement = canvas.querySelector(".tiptap");
const editor = editorElement.editor;
await act(async () => { editor.commands.setTextSelection(5); editorElement.focus(); });
const styleButton = toolbar.querySelector('[aria-label="Text style"]');
const pointer = new dom.window.Event("pointerdown", { bubbles: true, cancelable: true });
await act(async () => { styleButton.dispatchEvent(pointer); styleButton.click(); });
assert.ok(pointer.defaultPrevented, "toolbar touch must preserve editor focus/selection");
assert.equal(document.activeElement, editorElement);
await act(async () => { [...footer.querySelectorAll("button")].find(button => button.textContent === "Subheading").click(); });
assert.equal(editor.getJSON().content[0].type, "heading");
assert.equal(editor.getJSON().content[0].attrs.level, 3);
await act(async () => { toolbar.querySelector('[aria-label="Bold"]').click(); });
assert.ok(editor.isActive("bold"));
console.log("PASS touch keeps the editor focused and Subheading/Bold operate on the selection");

await act(async () => { toolbar.querySelector('[aria-label="More formatting tools"]').click(); });
await act(async () => { [...footer.querySelectorAll("button")].find(button => button.textContent === "Link").click(); });
assert.ok(footer.querySelector(".linkEditor"));
assert.ok(!canvas.querySelector(".linkEditor"), "link controls must also be outside scrolling content");
await act(async () => { document.querySelector(".editorTitleInput").dispatchEvent(new dom.window.Event("pointerdown", { bubbles: true })); });
assert.ok(!footer.querySelector(".linkEditor"));
console.log("PASS link form opens in the footer and closes on outside interaction");

await act(async () => { root.unmount(); });
assert.equal(document.body.style.overflow, "");
viewport.dispatchEvent(new dom.window.Event("resize"));
console.log("PASS editor closes cleanly and restores body scrolling");

// Two independent app instances share a mocked saved-article API. Tick only the
// real sync interval so this checks cross-device behavior without waiting.
const { defaultOperationState } = loadSource("features/operation/default-content.ts");
const { defaultTheme } = loadSource("lib/ui-theme-shared.ts");
let serverArticle = {
  id: "00000000-0000-4000-8000-000000000001", kind: "HANDBOOK", category: "General",
  title: "Shared routine", description: "Original description", published: true,
  createdAt: "2026-10-21T12:00:00Z", updatedAt: "2026-10-21T12:00:00Z",
  content: [{ type: "body", text: "Original instructions" }],
};
let failReads = false;
const requests = [];
globalThis.fetch = async (url, options = {}) => {
  requests.push({ url: String(url), method: options.method || "GET" });
  if (options.method === "PATCH") {
    const body = JSON.parse(options.body);
    serverArticle = { ...serverArticle, ...body, updatedAt: "2026-10-21T12:00:01Z" };
    return { ok: true, json: async () => structuredClone(serverArticle) };
  }
  if (failReads) return { ok: false, status: 503, json: async () => ({ error: "Temporary failure" }) };
  const articles = { handbook: [serverArticle], news: [] };
  return { ok: true, json: async () => structuredClone(String(url).includes("scope=articles") ? articles : { ...defaultOperationState, ...articles }) };
};
const nativeTimeout = window.setTimeout.bind(window);
const nativeClearTimeout = window.clearTimeout.bind(window);
const syncTimers = new Map();
let timerId = -1;
window.setTimeout = (callback, delay, ...args) => {
  if (delay !== 2_000) return nativeTimeout(callback, delay, ...args);
  const id = timerId--;
  syncTimers.set(id, callback);
  return id;
};
window.clearTimeout = id => { if (!syncTimers.delete(id)) nativeClearTimeout(id); };
async function tickSync() {
  const callbacks = [...syncTimers.values()];
  syncTimers.clear();
  await act(async () => { callbacks.forEach(callback => callback()); });
}
const hosts = [document.createElement("div"), document.createElement("div")];
hosts.forEach(host => document.body.append(host));
const apps = hosts.map(host => createRoot(host));
await act(async () => {
  apps.forEach((app, index) => app.render(React.createElement(OperationModule, {
    initialState: { ...defaultOperationState, handbook: [structuredClone(serverArticle)], news: [], canManageContent: index === 0, userRole: index === 0 ? "OWNER" : "EMPLOYEE" },
    initialTheme: defaultTheme, devMode: false, publicMode: index === 1,
    operationApiUrl: index === 0 ? "/api/operation-module" : "/api/operation-public/00000000-0000-4000-8000-000000000002",
  })));
});
await act(async () => {
  hosts.forEach(host => [...host.querySelectorAll("nav button")].find(button => button.textContent === "Handbook").click());
});
await act(async () => { hosts[1].querySelector(".articleCardOpen").click(); });
const openReader = hosts[1].querySelector(".reader");
const articleScroller = openReader.querySelector(".readerArticle");
articleScroller.scrollTop = 320;
assert.equal(document.body.style.overflow, "hidden");
assert.equal(document.documentElement.style.overflow, "hidden");
assert.ok(openReader.textContent.includes("Original instructions"));
await act(async () => { hosts[0].querySelector(".articleCardActions button").click(); });
await act(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); });
const activeEditor = hosts[0].querySelector(".tiptap").editor;
await act(async () => {
  activeEditor.commands.setContent("<p>Updated instructions from another device</p>");
});
await act(async () => {
  const field = hosts[0].querySelector(".editorDescriptionInput");
  Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value").set.call(field, "Updated card description");
  field.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
});
assert.equal(syncTimers.size, 1, "the editing device pauses its article subscription");
await act(async () => { hosts[0].querySelector('[aria-label="Save article"]').click(); });
assert.ok(!hosts[0].querySelector(".articleEditor"));
assert.equal(document.body.style.overflow, "hidden", "closing the editor must keep the other open reader's page lock");
assert.ok(requests.some(request => request.method === "PATCH"));
assert.ok(JSON.stringify(serverArticle.content).includes("Updated instructions from another device"), JSON.stringify(serverArticle.content));
await tickSync();
assert.equal(hosts[1].querySelector(".reader"), openReader, "keep the same reader open");
assert.equal(openReader.querySelector(".readerArticle"), articleScroller, "background updates must preserve the scroller");
assert.equal(articleScroller.scrollTop, 320, "background updates must preserve the reading position");
assert.ok(openReader.textContent.includes("Updated instructions from another device"), JSON.stringify({ text: openReader.textContent, requests, serverArticle, timers: syncTimers.size }));
assert.ok(hosts[1].querySelector(".articleCardOpen").textContent.includes("Updated card description"));
assert.ok(requests.some(request => request.url.includes("/api/operation-public/") && request.url.includes("scope=articles")));
console.log("PASS save on one device updates another open reader and Handbook card, including shared staff access");

failReads = true;
await tickSync();
assert.ok(openReader.textContent.includes("Updated instructions from another device"));
failReads = false;
serverArticle = { ...serverArticle, description: "Updated again", updatedAt: "2026-10-21T12:00:02Z" };
await tickSync();
assert.ok(hosts[1].querySelector(".articleCardOpen").textContent.includes("Updated again"));
const previousRequests = requests.length;
await act(async () => { hosts[1].querySelector('[aria-label="Close article"]').click(); });
assert.equal(document.body.style.overflow, "");
assert.equal(document.documentElement.style.overflow, "");
assert.equal(document.body.style.overscrollBehavior, "");
assert.equal(document.documentElement.style.overscrollBehavior, "");
assert.ok(requests.length > previousRequests, "closing the reader triggers a fresh request immediately");
console.log("PASS temporary read errors retain content, retry successfully and reader close refreshes immediately");
console.log("PASS reader locks background scrolling, retains its scroll container/position during updates and restores scrolling on close");

Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
await act(async () => { document.dispatchEvent(new dom.window.Event("visibilitychange")); });
assert.equal(syncTimers.size, 0);
Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
await act(async () => { document.dispatchEvent(new dom.window.Event("visibilitychange")); });
assert.equal(syncTimers.size, 2);
Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
await act(async () => { window.dispatchEvent(new dom.window.Event("offline")); });
assert.equal(syncTimers.size, 0);
Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
await act(async () => { window.dispatchEvent(new dom.window.Event("online")); });
assert.equal(syncTimers.size, 2);
await act(async () => { apps.forEach(app => app.unmount()); });
assert.equal(syncTimers.size, 0);
console.log("PASS background/offline tabs pause polling, foreground/reconnected tabs resume and unmount cancels both subscriptions");

const { subscribeOperationArticles } = loadSource("features/operation/article-sync.ts");
let finishRequest;
let readCount = 0;
let received = 0;
let requestSignal;
globalThis.fetch = async (_url, options) => {
  readCount++;
  requestSignal = options.signal;
  return new Promise(resolve => { finishRequest = resolve; });
};
const subscription = subscribeOperationArticles("/api/operation-module", () => { received++; });
await subscription.refresh();
await subscription.refresh();
assert.equal(readCount, 1, "polling and manual refresh must not overlap requests");
subscription.stop();
assert.ok(requestSignal.aborted);
finishRequest({ ok: true, json: async () => ({ handbook: [serverArticle], news: [] }) });
await new Promise(resolve => setImmediate(resolve));
assert.equal(received, 0, "stopped requests cannot overwrite a newly opened local draft");
assert.equal(syncTimers.size, 0);
console.log("PASS one in-flight request per subscription and no late updates after stopping");
window.setTimeout = nativeTimeout;
window.clearTimeout = nativeClearTimeout;
dom.window.close();
