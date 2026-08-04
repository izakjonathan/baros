import Link from "next/link";
import { ErrorState, WorkspacePage } from "@/components/ui/workspace-ui";
export default function NotFound(){return <WorkspacePage><ErrorState title="Page not found" description="This workspace address does not exist or is no longer available." action={<Link className="primary" href="/">Return to Bar Ops</Link>} /></WorkspacePage>}
