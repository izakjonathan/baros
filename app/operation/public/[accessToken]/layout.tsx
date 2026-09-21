import type { Metadata } from "next";

type PublicOperationLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ accessToken: string }>;
};

export async function generateMetadata({ params }: PublicOperationLayoutProps): Promise<Metadata> {
  const { accessToken } = await params;
  const publicPath = `/operation/public/${encodeURIComponent(accessToken)}`;

  return {
    manifest: `${publicPath}/manifest.webmanifest`,
    applicationName: "Bar Ops",
    appleWebApp: {
      capable: true,
      title: "Bar Ops",
      statusBarStyle: "default",
    },
  };
}

export default function PublicOperationLayout({ children }: PublicOperationLayoutProps) {
  return children;
}
