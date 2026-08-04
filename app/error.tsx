"use client";
import { useEffect } from "react";
import { ErrorState, WorkspacePage } from "@/components/ui/workspace-ui";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Bar Ops page recovery", { digest: error.digest }); }, [error]);
  return <WorkspacePage><ErrorState title="Something went wrong" description="Your work was not intentionally changed. Try loading this workspace again." action={<button type="button" className="primary" onClick={reset}>Try again</button>} /></WorkspacePage>;
}
