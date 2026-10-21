import assert from "node:assert/strict";
import fs from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { JSDOM } from "jsdom";
import { getSchema } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { DOMParser as ProseMirrorDOMParser } from "@tiptap/pm/model";

const dom = new JSDOM("");
globalThis.DOMParser = dom.window.DOMParser;
const source = stripTypeScriptTypes(fs.readFileSync("features/operation/paste.ts", "utf8"));
const { normalizeOperationPastedHTML: normalize } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const schema = getSchema([StarterKit.configure({ heading: { levels: [2, 3] } })]);
function parse(html) {
  const output = normalize(html);
  const document = new dom.window.DOMParser().parseFromString(output, "text/html");
  return ProseMirrorDOMParser.fromSchema(schema).parse(document.body).toJSON();
}
function roles(document) {
  return document.content.map(node => node.type === "heading" ? `h${node.attrs.level}` : node.type);
}
const fixtures = [
  ["native Title, Heading and Subheading", '<h1>Title</h1><h2>Heading</h2><h3>Subheading</h3><p>Body</p>', ["h2", "h2", "h3", "paragraph"]],
  ["iOS styled spans", '<div style="font-family:-apple-system"><div><span style="font-size:28px;font-weight:700">Title</span></div><div><span style="font-size:22px;font-weight:600">Heading</span></div><div><span style="font-size:17px;font-weight:600">Subheading</span></div><div><span style="font-size:17px">Body</span></div></div>', ["h2", "h2", "h3", "paragraph"]],
  ["macOS stylesheet and point sizes", '<style>p.p1 {font: bold 16.5pt HelveticaNeue} p.p2 {font: bold 15pt HelveticaNeue} p.p3 {font: 12pt HelveticaNeue}</style><p class="p1">Heading</p><p class="p2">Subheading</p><p class="p3">Body</p>', ["h2", "h3", "paragraph"]],
  ["explicit Apple text styles", '<div style="font-family:UICTFontTextStyleHeadline">Heading</div><div style="font-family:UICTFontTextStyleSubhead">Subheading</div>', ["h2", "h3"]],
  ["partial bold stays body", '<p style="font-family:-apple-system;font-size:17px"><b>Bold word</b> and normal body</p>', ["paragraph"]],
  ["lists and line breaks survive", '<ul><li><p style="font-family:-apple-system;font-size:22px;font-weight:700">List item</p></li></ul><ol start="3"><li>Numbered</li></ol><p>First<br>Second</p>', ["bulletList", "orderedList", "paragraph"]],
  ["unrelated styled paragraphs stay body", '<p style="font-size:22px;font-weight:700">Ordinary web paragraph</p>', ["paragraph"]],
  ["missing styles stay body", '<div>Heading-looking words</div><div>Body</div>', ["paragraph", "paragraph"]],
];
for (const [label, html, expected] of fixtures) {
  assert.deepEqual(roles(parse(html)), expected, label);
  assert.deepEqual(parse(normalize(html)), parse(html), `${label}: stable after normalization`);
  console.log(`PASS ${label}`);
}
const marks = parse('<style>span.s1 {font-weight:700;font-style:italic;text-decoration:underline}</style><p><span class="s1">Formatted</span> body <a href="https://example.com">link</a></p>');
assert.deepEqual(marks.content[0].content[0].marks.map(mark => mark.type).sort(), ["bold", "italic", "underline"]);
assert.equal(marks.content[0].content.at(-1).marks[0].type, "link");
assert.equal(parse(fixtures[5][1]).content[1].attrs.start, 3);
assert.equal(parse(fixtures[5][1]).content[2].content[1].type, "hardBreak");
assert.ok(!normalize('<style>p{color:red}</style><p>Safe</p><script>alert(1)</script>').includes('<script'));
console.log("PASS inline marks, links, ordered-list start, line breaks and inert clipboard metadata");
assert.ok(fs.readFileSync("features/operation/OperationModule.tsx", "utf8").includes("transformPastedHTML: normalizeOperationPastedHTML"));
console.log("PASS normalizer is connected to the editor paste pipeline");

// Exercise real paste insertion and history rather than only parsing fixtures.
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
const { Editor } = await import("@tiptap/core");
const editor = new Editor({
  element: document.createElement("div"),
  extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
  content: '<p>Existing</p>',
  editorProps: { transformPastedHTML: normalize, handleScrollToSelection: () => true },
});
editor.commands.setTextSelection(5);
assert.equal(editor.view.pasteHTML(fixtures[1][1], new dom.window.Event("paste")), true);
assert.ok(editor.getJSON().content.some(node => node.type === "heading" && node.attrs.level === 3));
const saved = JSON.stringify(editor.getJSON());
assert.equal(editor.commands.undo(), true);
assert.equal(editor.getText(), 'Existing');
assert.equal(editor.commands.redo(), true);
assert.equal(JSON.stringify(editor.getJSON()), saved);
const contentSource = stripTypeScriptTypes(fs.readFileSync("features/operation/content.ts", "utf8"));
const { parseOperationBlocks } = await import(`data:text/javascript;base64,${Buffer.from(contentSource).toString("base64")}`);
const persisted = parseOperationBlocks([{ type: "tiptap", document: JSON.parse(saved) }]);
editor.commands.setContent(persisted[0].document);
assert.ok(editor.getJSON().content.some(node => node.type === "heading" && node.attrs.level === 3));
assert.ok(editor.getText().includes('Exis') && editor.getText().includes('ting'));
editor.destroy();
console.log("PASS actual paste into existing text, Undo/Redo and storage-parser round trip");
