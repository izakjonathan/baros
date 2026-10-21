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
for (const name of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "DOMParser", "MutationObserver", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
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
const { ArticleEditor } = loadSource("features/operation/OperationModule.tsx", "\nexport { ArticleEditor };");
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
dom.window.close();
