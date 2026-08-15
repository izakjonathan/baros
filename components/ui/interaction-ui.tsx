"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({ title, description, onClose, children, className = "" }: { title: string; description?: string; onClose: () => void; children: ReactNode; className?: string }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previous.overflow; body.style.position = previous.position; body.style.top = previous.top; body.style.width = previous.width;
      window.scrollTo(0, scrollY); previouslyFocused?.focus();
    };
  }, [onClose]);

  return <div className="modal-layer" role="presentation"><button type="button" className="modal-scrim" onClick={onClose} aria-label="Close dialog"/><section ref={dialogRef} className={`modal interaction-dialog ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}><div className="modal-head"><div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div><button ref={closeRef} type="button" className="icon-button dialog-close" onClick={onClose} aria-label="Close"><X size={19}/></button></div>{children}</section></div>;
}

export function DialogActions({ onClose, onConfirm, confirmLabel, busy = false, disabled = false, cancelLabel = "Cancel" }: { onClose: () => void; onConfirm: () => void; confirmLabel: string; busy?: boolean; disabled?: boolean; cancelLabel?: string }) {
  return <div className="modal-actions interaction-actions"><button type="button" className="secondary" disabled={busy} onClick={onClose}>{cancelLabel}</button><button type="button" className="primary" disabled={busy || disabled} aria-busy={busy || undefined} onClick={onConfirm}>{confirmLabel}</button></div>;
}

export function FormMessage({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "success" | "info" }) {
  return <div className={`form-message form-message-${tone}`} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"}>{children}</div>;
}
