"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";

export function ScheduleAcknowledgement({ publicationId }: { publicationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function acknowledge() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/schedule-acknowledgements", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ publicationId }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Could not acknowledge schedule");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not acknowledge schedule");
    } finally { setBusy(false); }
  }
  return <div className="schedule-ack-action"><button type="button" className="portal-action primary-action" disabled={busy} onClick={acknowledge}><CheckCheck size={15}/>{busy ? "Saving…" : "Acknowledge schedule"}</button>{error&&<small className="form-error" role="alert">{error}</small>}</div>;
}
