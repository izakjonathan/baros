import type { OperationArticle, OperationArticleKind, OperationContentBlock, OperationRichTextDelta, OperationRichTextOp } from "./types";

const articleKinds: readonly OperationArticleKind[] = ["HANDBOOK", "NEWS"];
const blockTypes = new Set(["title", "h1", "h2", "body", "bullets", "numbered", "image", "richText", "articleLink"]);
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
