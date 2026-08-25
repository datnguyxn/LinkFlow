'use client';

import { useState } from 'react';

import LinksHeader from './LinksHeader';
import LinkStatisticCards from './LinkStatisticCards';
import LinkToolbar from './LinkToolbar';
import LinksTable from './LinksTable';

import { useWorkspaceLinks } from '@/hooks/queries/url/useWorkspaceLinks';

interface LinksPageProps {
  workspaceId: string | undefined;
  slug: string | undefined;
}

export default function LinksPage({ workspaceId, slug }: LinksPageProps) {
  const [page, setPage] = useState(1);

  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);

  const { data, isLoading } = useWorkspaceLinks(workspaceId, page, 10);

  const links = data?.urls ?? [];

  const pagination = data?.pagination;

  const handleSelectLink = (id: string, checked: boolean) => {
    setSelectedLinks((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLinks(links.map((link) => link.id));

      return;
    }

    setSelectedLinks([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <LinksHeader slug={slug} />

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <LinkStatisticCards />

        <LinkToolbar />

        <LinksTable
          links={links}
          loading={isLoading}
          pagination={pagination}
          selectedLinks={selectedLinks}
          onSelectLink={handleSelectLink}
          onSelectAll={handleSelectAll}
        />
      </div>
    </div>
  );
}
