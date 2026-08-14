import { AvailabilityEditor } from "./availability-editor";
import { WorkspaceHeader } from "@/components/ui/workspace-ui";

export default function Availability() {
  return <div className="employee-page"><WorkspaceHeader eyebrow="Planning" title="Availability" description="Set availability for every date in a chosen month, or maintain a recurring weekly pattern."/><AvailabilityEditor /></div>;
}
