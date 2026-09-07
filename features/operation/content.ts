import type { OperationArticle, OperationArticleKind, OperationContentBlock } from "./types";

const articleKinds: readonly OperationArticleKind[] = ["HANDBOOK", "NEWS"];
const blockTypes = new Set(["title", "h1", "h2", "body", "bullets", "numbered", "image", "articleLink"]);

export function ownerCanManageOperation(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

export function parseOperationBlocks(value: unknown): OperationContentBlock[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 60).flatMap((block): OperationContentBlock[] => {
    if (!block || Array.isArray(block) || typeof block !== "object") return [];
    const record = block as Record<string, unknown>;
    const type = String(record.type || "");
    if (!blockTypes.has(type)) return [];
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
