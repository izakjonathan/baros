"use client";

import { useState } from "react";
import { Crown, LoaderCircle, UserCog, UserRound } from "lucide-react";
import { operationThemeCustomProperties, type UiTheme } from "@/lib/ui-theme-shared";

export function LoginForm({ devMode, theme }: { devMode: boolean; theme: UiTheme }) {
  const [email, setEmail] = useState(devMode ? "dev@barops.local" : "");
  const [password, setPassword] = useState(devMode ? "dev" : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to sign in");
      window.location.assign(body.redirect || "/operation");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
      setBusy(false);
    }
  }

  return (
    <main className="login-page" style={operationThemeCustomProperties(theme)}>
      <section className="login-card">
        <div className="login-brand" aria-label="BarOs"><span>Bar</span><b>Os</b></div>
        <header className="login-heading"><p>Operation</p><h1>Welcome back</h1><span>Sign in to open today’s operation.</span></header>

        {devMode && (
          <section className="card card-compact dev-access-panel" aria-labelledby="dev-access-title">
            <div>
              <span className="dev-badge">Developer mode</span>
              <h2 id="dev-access-title">Continue without PostgreSQL</h2>
              <p>Choose a management role and enter the local-state workspace immediately.</p>
            </div>
            <div className="dev-role-grid">
              <form action="/api/auth/dev-login" method="post">
                <input type="hidden" name="role" value="OWNER" />
                <button type="submit"><Crown size={19} /><span><strong>Owner</strong><small>Full access</small></span></button>
              </form>
              <form action="/api/auth/dev-login" method="post">
                <input type="hidden" name="role" value="MANAGER" />
                <button type="submit"><UserCog size={19} /><span><strong>Manager</strong><small>Operations access</small></span></button>
              </form>
              <form action="/api/auth/dev-login" method="post">
                <input type="hidden" name="role" value="EMPLOYEE" />
                <button type="submit"><UserRound size={19} /><span><strong>Employee</strong><small>Staff access</small></span></button>
              </form>
            </div>
          </section>
        )}

        <form className="login-form" onSubmit={submit}>
          <label><span>Email</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label><span>Password</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="current-password" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="login-submit" disabled={busy}>{busy ? <><LoaderCircle size={18} />Signing in…</> : "Sign in"}</button>
        </form>
      </section>
    </main>
  );
}
