"use client";

import { Check, Copy, LoaderCircle, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import styles from "./OperationModule.module.css";

type OperationUserRole = "OWNER" | "MANAGER" | "EMPLOYEE";
type OperationUser = { id: string; name: string; email: string; status: string; role: string; location_id: string | null; location_name: string | null };
type OperationInvitation = { id: string; name: string; email: string; role: string; status: string; location_id: string | null; expires_at: string };
type OperationLocation = { id: string; name: string };
type OperationUsersPayload = { users: OperationUser[]; invitations: OperationInvitation[]; locations: OperationLocation[]; currentUserId: string | null };
type UserDraft = { id: string; name: string; email: string; role: OperationUserRole; locationId: string };

async function errorMessage(response: Response, fallback: string) {
  const result: unknown = await response.json().catch(() => null);
  return result && typeof result === "object" && "error" in result && typeof result.error === "string" ? result.error : fallback;
}

export function OperationUserManagement() {
  const [payload, setPayload] = useState<OperationUsersPayload>({ users: [], invitations: [], locations: [], currentUserId: null });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OperationUserRole>("EMPLOYEE");
  const [locationId, setLocationId] = useState("");
  const [activationUrl, setActivationUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserDraft | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userActionId, setUserActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/operation-users", { cache: "no-store" });
      if (!response.ok) throw new Error(await errorMessage(response, "Could not load users."));
      setPayload(await response.json() as OperationUsersPayload);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/operation-users", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error(await errorMessage(response, "Could not load users."));
        return response.json() as Promise<OperationUsersPayload>;
      })
      .then(result => { if (active) setPayload(result); })
      .catch(cause => { if (active) setMessage(cause instanceof Error ? cause.message : "Could not load users."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setActivationUrl("");
    try {
      const response = await fetch("/api/operation-users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, role, locationId: locationId || null }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, "Could not create invitation."));
      const result = await response.json() as { activationUrl: string };
      setActivationUrl(result.activationUrl);
      setName("");
      setEmail("");
      setRole("EMPLOYEE");
      setMessage("Invitation created. Copy and send the private activation link.");
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not create invitation.");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(activationUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage("Copying was blocked. Press and hold the link to copy it.");
    }
  }

  async function revoke(invitationId: string) {
    setRevokingId(invitationId);
    setMessage("");
    try {
      const response = await fetch("/api/operation-users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "revoke", invitationId }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, "Could not revoke invitation."));
      setMessage("Invitation revoked.");
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not revoke invitation.");
    } finally {
      setRevokingId(null);
    }
  }

  function edit(user: OperationUser) {
    setMessage("");
    setDeletingId(null);
    setEditing({ id: user.id, name: user.name, email: user.email, role: user.role === "MANAGER" ? "MANAGER" : user.role === "EMPLOYEE" ? "EMPLOYEE" : "OWNER", locationId: user.location_id || "" });
  }

  async function saveUser(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setUserActionId(editing.id);
    setMessage("");
    try {
      const response = await fetch("/api/operation-users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "updateUser", userId: editing.id, name: editing.name, email: editing.email, role: editing.role, locationId: editing.locationId || null }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, "Could not update user."));
      setEditing(null);
      setMessage("User updated.");
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not update user.");
    } finally {
      setUserActionId(null);
    }
  }

  async function removeUser(userId: string) {
    setUserActionId(userId);
    setMessage("");
    try {
      const response = await fetch("/api/operation-users", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, "Could not delete user."));
      setDeletingId(null);
      setEditing(current => current?.id === userId ? null : current);
      setMessage("User access deleted. Historical records were preserved.");
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not delete user.");
    } finally {
      setUserActionId(null);
    }
  }

  const pendingInvitations = payload.invitations.filter(invitation => invitation.status === "PENDING");
  return <section className={styles.settingsSection} aria-labelledby="operation-users-title">
    <div><p>Accounts</p><h3 id="operation-users-title">Users</h3></div>
    <form className={styles.userInviteForm} onSubmit={submit}>
      <label><span>Name</span><input value={name} onChange={event => setName(event.target.value)} autoComplete="name" maxLength={120} required /></label>
      <label><span>Email</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" maxLength={320} required /></label>
      <label><span>Access</span><select value={role} onChange={event => setRole(event.target.value as OperationUserRole)}><option value="OWNER">Owner</option><option value="MANAGER">Manager</option><option value="EMPLOYEE">Employee</option></select></label>
      <label><span>Location</span><select value={locationId} onChange={event => setLocationId(event.target.value)}><option value="">All / no fixed location</option>{payload.locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>
      <button type="submit" disabled={saving}>{saving ? <LoaderCircle className={styles.saveSpinner} size={16} /> : <UserPlus size={16} />}Add user</button>
    </form>
    {activationUrl && <div className={styles.invitationLink}><span>{activationUrl}</span><button type="button" onClick={() => void copyLink()}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy link"}</button></div>}
    {loading ? <p className={styles.uiStudioIntro}>Loading users…</p> : <div className={styles.userList}>
      {payload.users.map(user => editing?.id === user.id
        ? <form className={styles.userEditForm} key={user.id} onSubmit={saveUser}>
            <label><span>Name</span><input value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} required maxLength={120} /></label>
            <label><span>Email</span><input type="email" value={editing.email} onChange={event => setEditing({ ...editing, email: event.target.value })} required maxLength={320} /></label>
            <label><span>Access</span><select value={editing.role} onChange={event => setEditing({ ...editing, role: event.target.value as OperationUserRole })}><option value="OWNER">Owner</option><option value="MANAGER">Manager</option><option value="EMPLOYEE">Employee</option></select></label>
            <label><span>Location</span><select value={editing.locationId} onChange={event => setEditing({ ...editing, locationId: event.target.value })}><option value="">All / no fixed location</option>{payload.locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>
            <div className={styles.userEditActions}><button type="button" onClick={() => setEditing(null)}><X size={15} />Cancel</button><button type="submit" disabled={userActionId !== null}>{userActionId === user.id ? <LoaderCircle className={styles.saveSpinner} size={15} /> : <Check size={15} />}Save</button></div>
          </form>
        : <div className={styles.userRow} key={user.id}>
            <div><strong>{user.name}{user.id === payload.currentUserId ? " (you)" : ""}</strong><span>{user.email}{user.location_name ? ` · ${user.location_name}` : ""}</span></div>
            <small>{["OWNER", "ADMIN"].includes(user.role) ? "owner" : user.role.toLowerCase().replace("_", " ")}</small>
            <div className={styles.userRowActions}>
              <button type="button" aria-label={`Edit ${user.name}`} onClick={() => edit(user)}><Pencil size={15} /><span>Edit</span></button>
              {user.id !== payload.currentUserId && (deletingId === user.id
                ? <><button type="button" onClick={() => setDeletingId(null)}>Cancel</button><button type="button" className={styles.dangerAction} disabled={userActionId !== null} onClick={() => void removeUser(user.id)}>{userActionId === user.id ? <LoaderCircle className={styles.saveSpinner} size={14} /> : <Trash2 size={14} />}Delete</button></>
                : <button type="button" aria-label={`Delete ${user.name}`} onClick={() => { setEditing(null); setDeletingId(user.id); }}><Trash2 size={15} /><span>Delete</span></button>)}
            </div>
          </div>)}
      {pendingInvitations.map(invitation => <div className={styles.userRow} key={invitation.id}><div><strong>{invitation.name}</strong><span>{invitation.email} · invitation pending</span></div><button type="button" disabled={revokingId !== null} onClick={() => void revoke(invitation.id)}>{revokingId === invitation.id ? <LoaderCircle className={styles.saveSpinner} size={14} /> : null}Revoke</button></div>)}
      {!payload.users.length && !pendingInvitations.length && <p className={styles.uiStudioIntro}>No users found.</p>}
    </div>}
    {message && <p className={styles.uiStudioMessage} role="status">{message}</p>}
  </section>;
}
