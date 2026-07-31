'use client';

import { useParams } from 'next/navigation';

export default function WorkspaceLinksPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Links</h1>

      <p className="text-sm text-slate-500">Workspace: {slug}</p>
    </main>
  );
}
