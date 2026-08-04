"use client";
import { ErrorState, WorkspacePage } from "@/components/ui/workspace-ui";
export default function ErrorPage({reset}:{reset:()=>void}){
  return <WorkspacePage className="employee-page"><ErrorState title="Couldn’t load this page" description="Check your connection and try again." action={<button type="button" className="primary" onClick={reset}>Try again</button>}/></WorkspacePage>;
}
