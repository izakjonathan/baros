"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ActivationForm({ token, userName, email, role, existingAccount }: { token: string; userName: string; email: string; role: string; existingAccount: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 12) { setError("Use at least 12 characters."); return; }
    if (!existingAccount && password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/activate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Activation failed");
      router.replace(data.redirect || "/operation");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Activation failed");
      setBusy(false);
    }
  }

  const roleLabel = role === "OWNER" ? "Owner" : role === "MANAGER" ? "Manager" : "Employee";
  return <main className="login-page"><section className="card login-card">
    <div className="login-brand"><span>Bar</span><b>Os</b></div>
    <p className="eyebrow">Operation invitation · {roleLabel}</p>
    <h1>Welcome, {userName}</h1>
    <p>{existingAccount ? <>Enter the existing password for <strong>{email}</strong> to add Operation access.</> : <>Create a password for <strong>{email}</strong>.</>}</p>
    <form onSubmit={submit} className="login-form">
      <label>{existingAccount ? "Existing password" : "New password"}<input type="password" autoComplete={existingAccount ? "current-password" : "new-password"} minLength={12} value={password} onChange={event => setPassword(event.target.value)} required /></label>
      {!existingAccount && <label>Confirm password<input type="password" autoComplete="new-password" minLength={12} value={confirm} onChange={event => setConfirm(event.target.value)} required /></label>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary full" disabled={busy}>{busy ? "Activating…" : existingAccount ? "Accept invitation" : "Activate account"}</button>
    </form>
    <small>This invitation is single-use and expires after seven days.</small>
  </section></main>;
}
