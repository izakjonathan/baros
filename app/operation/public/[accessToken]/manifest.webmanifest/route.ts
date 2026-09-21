import { getPublicOperationAccess } from "@/lib/operation-public-access";

type RouteContext = { params: Promise<{ accessToken: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  const { accessToken } = await params;
  const access = await getPublicOperationAccess(accessToken);
  if (!access) return new Response(null, { status: 404, headers: { "cache-control": "no-store" } });

  const publicPath = `/operation/public/${access.token}`;
  const manifest = {
    id: publicPath,
    name: "Bar Ops",
    short_name: "Bar Ops",
    description: "Shared staff Operations workspace.",
    start_url: publicPath,
    scope: publicPath,
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return Response.json(manifest, {
    headers: {
      "cache-control": "private, no-store, max-age=0",
      "content-type": "application/manifest+json; charset=utf-8",
    },
  });
}
