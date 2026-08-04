import { GET as readinessGET } from "./ready/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return readinessGET(request);
}
