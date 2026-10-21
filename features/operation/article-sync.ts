import type { OperationArticle } from "./types";

export type OperationArticles = { handbook: OperationArticle[]; news: OperationArticle[] };

/** One request at a time, only while visible and online. Editing owns its own draft. */
export function subscribeOperationArticles(endpoint: string, receive: (articles: OperationArticles) => void) {
  let stopped = false;
  let fetching = false;
  let timer: number | undefined;
  let controller: AbortController | undefined;
  const active = () => !stopped && document.visibilityState === "visible" && navigator.onLine;
  const clearTimer = () => { window.clearTimeout(timer); timer = undefined; };

  async function refresh() {
    if (!active() || fetching) return;
    clearTimer();
    fetching = true;
    controller = new AbortController();
    try {
      const separator = endpoint.includes("?") ? "&" : "?";
      const response = await fetch(`${endpoint}${separator}scope=articles`, { cache: "no-store", signal: controller.signal });
      if (!response.ok) return;
      const next = await response.json() as OperationArticles;
      if (active() && !controller.signal.aborted && Array.isArray(next.handbook) && Array.isArray(next.news)) receive(next);
    } catch {
      // Keep the last confirmed articles and retry after a temporary connection failure.
    } finally {
      fetching = false;
      if (active()) timer = window.setTimeout(() => { void refresh(); }, 2_000);
    }
  }
  function availabilityChanged() {
    if (active()) void refresh();
    else { clearTimer(); controller?.abort(); }
  }
  window.addEventListener("focus", availabilityChanged);
  window.addEventListener("online", availabilityChanged);
  window.addEventListener("offline", availabilityChanged);
  document.addEventListener("visibilitychange", availabilityChanged);
  void refresh();
  return {
    refresh,
    stop() {
      stopped = true;
      clearTimer();
      controller?.abort();
      window.removeEventListener("focus", availabilityChanged);
      window.removeEventListener("online", availabilityChanged);
      window.removeEventListener("offline", availabilityChanged);
      document.removeEventListener("visibilitychange", availabilityChanged);
    },
  };
}

export function sameOperationArticles(current: OperationArticle[], next: OperationArticle[]) {
  return current.length === next.length && current.every((article, index) => article.id === next[index].id && article.updatedAt === next[index].updatedAt);
}
