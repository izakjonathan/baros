"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

type ActionVariant = "primary" | "secondary" | "ghost" | "danger";

export function ActionButton({ variant = "secondary", className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ActionVariant }) {
  const variantClass = variant === "danger" ? "danger-button" : variant;
  return <button className={`${variantClass} ${className}`.trim()} {...props}>{children}</button>;
}

export function ActionGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`action-group ${className}`.trim()}>{children}</div>;
}

export function FilterBar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`filter-bar ${className}`.trim()}>{children}</div>;
}

export function FieldShell({ label, helper, className = "", children }: { label: string; helper?: string; className?: string; children: ReactNode }) {
  return <label className={`app-field ${className}`.trim()}><span>{label}</span>{children}{helper && <small className="field-help">{helper}</small>}</label>;
}

export function InputField({ label, helper, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string; className?: string }) {
  return <FieldShell label={label} helper={helper} className={className}><input {...props} /></FieldShell>;
}

export function SelectField({ label, helper, className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; helper?: string; className?: string; children: ReactNode }) {
  return <FieldShell label={label} helper={helper} className={className}><select {...props}>{children}</select></FieldShell>;
}

export function SegmentedControl<T extends string>({ value, options, onChange, ariaLabel, className = "" }: { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; ariaLabel: string; className?: string }) {
  return <div className={`segmented-control ${className}`.trim()} role="group" aria-label={ariaLabel}>{options.map(option => <button key={option.value} type="button" className={value === option.value ? "selected" : ""} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}

export function KpiCard({ icon, label, value, detail, footer, warning = false }: { icon: ReactNode; label: string; value: string; detail: string; footer: ReactNode; warning?: boolean }) {
  return <article className={`metric-card ${warning ? "is-warning" : ""}`}><div className="metric-icon">{icon}</div><span className="metric-label">{label}</span><strong>{value}</strong><small>{detail}</small><div className={`metric-trend ${warning ? "warn" : ""}`}>{footer}</div></article>;
}

export function DialogFooter({ onCancel, onConfirm, confirmLabel, dangerAction }: { onCancel: () => void; onConfirm: () => void; confirmLabel: string; dangerAction?: ReactNode }) {
  return <div className={`dialog-footer ${dangerAction ? "has-danger" : ""}`}>{dangerAction}<div className="dialog-footer-actions"><ActionButton variant="ghost" type="button" onClick={onCancel}>Cancel</ActionButton><ActionButton variant="primary" type="button" onClick={onConfirm}>{confirmLabel}</ActionButton></div></div>;
}

export function IconButton({ label, className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button className={`icon-button ${className}`.trim()} aria-label={label} title={label} {...props}>{children}</button>;
}

export function StatusPill({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: "neutral" | "positive" | "pending" | "danger"; className?: string }) {
  return <span className={`status-pill status-pill-${tone} ${className}`.trim()}>{children}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><strong>{title}</strong><p>{description}</p>{action}</div>;
}
