import WorkspaceProvider from '@/providers/WorkspaceProvider';

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;

  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  return <WorkspaceProvider slug={slug}>{children}</WorkspaceProvider>;
}
