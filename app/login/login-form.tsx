"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Shield, UserCog, Wine } from "lucide-react";

export function LoginForm({ devMode }: { devMode: boolean }) {
  const router = useRouter();
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
      window.location.assign(body.redirect || "/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="card login-card">
        <div className="login-brand"><span><Wine size={22} /></span><strong>Bar Ops</strong></div>
        <div><p className="eyebrow">Hospitality operating system</p><h1>Welcome back</h1><p>Sign in to manage today’s operation.</p></div>

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
                <input type="hidden" name="role" value="SHIFT_MANAGER" />
                <button type="submit"><Shield size={19} /><span><strong>Shift manager</strong><small>Scheduling access</small></span></button>
              </form>
            </div>
          </section>
        )}

        <div className="login-divider"><span>{devMode ? "Database sign-in" : "Sign in"}</span></div>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="current-password" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <small>{devMode ? "The one-click development login is handled entirely by the server and does not require a database. Add DATABASE_URL and disable DEV_AUTH_ENABLED when PostgreSQL is ready." : "Use the account created in your PostgreSQL database."}</small>
      </section>
    </main>
  );
}
