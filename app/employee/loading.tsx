import { LoadingState, WorkspacePage } from "@/components/ui/workspace-ui";

export default function Loading(){
  return <WorkspacePage className="employee-page"><LoadingState title="Loading employee workspace" description="Preparing your shifts, requests and hours…"/></WorkspacePage>;
}
