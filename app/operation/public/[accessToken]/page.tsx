import { notFound } from "next/navigation";
import { OperationModule } from "@/features/operation/OperationModule";
import { operationDateNow } from "@/features/operation/date";
import { defaultTheme, getUiTheme } from "@/lib/ui-theme";
import { getPublicOperationAccess, loadPublicOperationState } from "@/lib/operation-public-access";

type PageProps = { params: Promise<{ accessToken: string }> };

export const dynamic = "force-dynamic";

export default async function PublicOperationPage({ params }: PageProps) {
  const { accessToken } = await params;
  const access = await getPublicOperationAccess(accessToken);
  if (!access) notFound();
  const [initialState, initialTheme] = await Promise.all([
    loadPublicOperationState(access, operationDateNow()),
    getUiTheme(access.organizationId).catch(() => defaultTheme),
  ]);
  const apiUrl = `/api/operation-public/${access.token}`;
  return <OperationModule initialState={initialState} initialTheme={initialTheme} devMode={false} operationApiUrl={apiUrl} themeRefreshUrl={`${apiUrl}/theme`} />;
}
