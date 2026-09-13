import type { OperationArticle, OperationArticleKind, OperationContentBlock, OperationRichTextDelta, OperationRichTextOp, OperationTiptapDocument, OperationTiptapNode } from "./types";

const articleKinds: readonly OperationArticleKind[] = ["HANDBOOK", "NEWS"];
const blockTypes = new Set(["title", "h1", "h2", "body", "bullets", "numbered", "image", "richText", "tiptap", "articleLink"]);
const richTextAttributeTypes = new Set(["bold", "italic", "underline", "strike", "link", "header", "list", "align", "color", "background"]);

export function ownerCanManageOperation(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

export function parseOperationBlocks(value: unknown): OperationContentBlock[] {
  const normalizedValue = parseJsonValue(value);
  if (!Array.isArray(normalizedValue)) {
    const delta = parseRichTextDelta(normalizedValue);
    return delta ? [{ type: "richText", delta }] : [];
  }
  return normalizedValue.slice(0, 60).flatMap((block): OperationContentBlock[] => {
    const normalizedBlock = parseJsonValue(block);
    if (!normalizedBlock || Array.isArray(normalizedBlock) || typeof normalizedBlock !== "object") return [];
    const directDelta = parseRichTextDelta(normalizedBlock);
    if (directDelta) return [{ type: "richText", delta: directDelta }];
    const record = normalizedBlock as Record<string, unknown>;
    const type = String(record.type || "");
    if (!blockTypes.has(type)) return [];
    if (type === "richText") {
      const delta = parseRichTextDelta(record.delta);
      return delta ? [{ type: "richText", delta }] : [];
    }
    if (type === "tiptap") {
      const document = parseTiptapDocument(record.document);
      return document ? [{ type: "tiptap", document }] : [];
    }
    if (type === "bullets" || type === "numbered") {
      const items = Array.isArray(record.items) ? record.items.map(item => String(item).trim()).filter(Boolean).slice(0, 30) : [];
      return items.length ? [{ type, items }] : [];
    }
    if (type === "image") {
      const src = String(record.src || "").trim();
      if (!src || src.length > 2000) return [];
      return [{ type: "image", src, alt: String(record.alt || "").trim().slice(0, 180) || "Operation article image" }];
    }
    if (type === "articleLink") {
      const articleId = String(record.articleId || "").trim();
      const label = String(record.label || "").trim().slice(0, 120);
      return articleId && label ? [{ type: "articleLink", articleId, label }] : [];
    }
    const text = String(record.text || "").trim();
    return text ? [{ type: type as "title" | "h1" | "h2" | "body", text: text.slice(0, 4000) }] : [];
  });
}

const tiptapNodes = new Set(["paragraph", "heading", "bulletList", "orderedList", "listItem", "image", "hardBreak", "text"]);
const tiptapMarks = new Set(["bold", "italic", "underline", "link"]);

function parseTiptapDocument(value: unknown): OperationTiptapDocument | null {
  const parsed = parseTiptapNode(parseJsonValue(value), 0, true);
  return parsed?.type === "doc" && parsed.content?.length ? { type: "doc", content: parsed.content } : null;
}

function parseTiptapNode(value: unknown, depth: number, root = false): OperationTiptapNode | null {
  if (!value || Array.isArray(value) || typeof value !== "object" || depth > 12) return null;
  const record = value as Record<string, unknown>;
  const type = String(record.type || "");
  if (root ? type !== "doc" : !tiptapNodes.has(type)) return null;
  const children = Array.isArray(record.content)
    ? record.content.slice(0, 250).flatMap((child): OperationTiptapNode[] => {
      const node = parseTiptapNode(child, depth + 1);
      return node ? [node] : [];
    })
    : [];
  if (root) return children.length ? { type: "doc", content: children } : null;
  if (type === "text") {
    const text = String(record.text || "").slice(0, 8000);
    return text ? { type, text, marks: parseTiptapMarks(record.marks) } : null;
  }
  if (type === "image") {
    const attrs = record.attrs && typeof record.attrs === "object" && !Array.isArray(record.attrs) ? record.attrs as Record<string, unknown> : {};
    const src = String(attrs.src || "").trim();
    if (!/^https:\/\//.test(src) || src.length > 2000) return null;
    return { type, attrs: { src, alt: String(attrs.alt || "").slice(0, 180) || "Operation article image" } };
  }
  if (type === "heading") {
    const attrs = record.attrs && typeof record.attrs === "object" && !Array.isArray(record.attrs) ? record.attrs as Record<string, unknown> : {};
    const level = Number(attrs.level);
    if (level !== 2 && level !== 3) return null;
    return { type, attrs: { level }, content: children };
  }
  if (type === "hardBreak") return { type };
  if (!children.length && type !== "paragraph") return null;
  return { type, ...(children.length ? { content: children } : {}) };
}

function parseTiptapMarks(value: unknown): OperationTiptapNode["marks"] {
  if (!Array.isArray(value)) return undefined;
  const marks = value.slice(0, 8).flatMap((mark): NonNullable<OperationTiptapNode["marks"]> => {
    if (!mark || Array.isArray(mark) || typeof mark !== "object") return [];
    const record = mark as Record<string, unknown>;
    const type = String(record.type || "");
    if (!tiptapMarks.has(type)) return [];
    if (type !== "link") return [{ type }];
    const attrs = record.attrs && typeof record.attrs === "object" && !Array.isArray(record.attrs) ? record.attrs as Record<string, unknown> : {};
    const href = String(attrs.href || "").trim();
    if (!/^(https?:|mailto:|tel:)/.test(href) || href.length > 1200) return [];
    return [{ type, attrs: { href } }];
  });
  return marks.length ? marks : undefined;
}

function parseRichTextDelta(value: unknown): OperationRichTextDelta | null {
  const normalizedValue = parseJsonValue(value);
  if (!normalizedValue || Array.isArray(normalizedValue) || typeof normalizedValue !== "object") return null;
  const ops = (normalizedValue as { ops?: unknown }).ops;
  if (!Array.isArray(ops)) return null;
  const parsedOps = ops.slice(0, 500).flatMap((op): OperationRichTextOp[] => {
    if (!op || Array.isArray(op) || typeof op !== "object") return [];
    const record = op as Record<string, unknown>;
    const insert = record.insert;
    const attributes = parseRichTextAttributes(record.attributes);
    if (typeof insert === "string") {
      const text = insert.slice(0, 8000);
      return text ? [{ insert: text, ...(attributes ? { attributes } : {}) }] : [];
    }
    if (insert && !Array.isArray(insert) && typeof insert === "object") {
      const image = String((insert as { image?: unknown }).image || "").trim();
      if (!image || image.length > 2000) return [];
      return [{ insert: { image }, ...(attributes ? { attributes } : {}) }];
    }
    return [];
  });
  return parsedOps.length ? { ops: parsedOps } : null;
}

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || !/^[{[]/.test(trimmed)) return value;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function parseRichTextAttributes(value: unknown) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const attributes = Object.entries(value as Record<string, unknown>).reduce<Record<string, string | number | boolean | null>>((carry, [key, raw]) => {
    if (!richTextAttributeTypes.has(key)) return carry;
    if (typeof raw === "boolean" || typeof raw === "number" || raw === null) carry[key] = raw;
    else if (typeof raw === "string") carry[key] = raw.slice(0, 500);
    return carry;
  }, {});
  return Object.keys(attributes).length ? attributes : null;
}

export function parseArticleKind(value: unknown): OperationArticleKind {
  const kind = String(value || "").toUpperCase() as OperationArticleKind;
  if (!articleKinds.includes(kind)) throw new Error("kind is invalid");
  return kind;
}

export function mapOperationArticle(row: Record<string, unknown>): OperationArticle {
  return {
    id: String(row.id),
    kind: String(row.kind) as OperationArticleKind,
    category: String(row.category || "General"),
    title: String(row.title || "Untitled"),
    description: String(row.description || ""),
    content: parseOperationBlocks(row.content),
    published: row.published !== false,
    updatedAt: String(row.updated_at || row.updatedAt || new Date().toISOString()),
  };
}
