import type { ReactNode } from "react";

export function WorkspacePage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`workspace-page ${className}`.trim()}>{children}</div>;
}

export function WorkspaceHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="workspace-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="workspace-description">{description}</p>}</div>{actions && <div className="workspace-actions">{actions}</div>}</header>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="shared-empty-state"><strong>{title}</strong>{description && <p>{description}</p>}{action && <div>{action}</div>}</div>;
}

export function LoadingState({ title = "Loading workspace", description = "Preparing the latest information…" }: { title?: string; description?: string }) {
  return <div className="card card-compact shared-state-card" role="status" aria-live="polite" aria-busy="true"><span className="shared-spinner" aria-hidden="true"/><strong>{title}</strong><p>{description}</p></div>;
}

export function ErrorState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="card card-compact shared-state-card shared-error-state" role="alert"><strong>{title}</strong><p>{description}</p>{action && <div>{action}</div>}</div>;
}
