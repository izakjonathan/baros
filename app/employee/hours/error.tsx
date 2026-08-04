"use client";
import { ErrorState, WorkspacePage } from "@/components/ui/workspace-ui";
export default function EmployeeHoursError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <WorkspacePage className="employee-page"><ErrorState title="Couldn’t load your hours" description="Your clock record is safe. Reload this page to try displaying it again." action={<button type="button" className="primary" onClick={reset}>Try again</button>}/></WorkspacePage>;
}
