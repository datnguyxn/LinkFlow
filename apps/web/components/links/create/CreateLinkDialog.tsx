'use client';

import { useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import Button from '@/components/ui/button';

import { X } from 'lucide-react';

import UrlSection from '../../sections/UrlSection';
// import CampaignSection from './sections/CampaignSection';
import AdvancedSection from '../../sections/AdvancedSection';
import ShortenedLinkSection from '../../sections/ShortenedLinkSection';

interface CreateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateLinkDialog({ open, onOpenChange }: CreateLinkDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // TODO:
      // call create link api
    } finally {
      setLoading(false);
    }
  };

  const [url, setUrl] = useState('');
  const [domain, setDomain] = useState('pageax.link');
  const [slug, setSlug] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="
            max-h-[92vh]
            w-full
            sm:max-w-2xl
            overflow-hidden
            rounded-3xl
            border-0
            p-0
            shadow-2xl
        "
      >
        {/* Header */}
        <DialogHeader
          className="
            sticky
            top-0
            z-20
            border-b
            border-slate-200
            bg-white
            px-8
            py-6
            dark:border-slate-800
            dark:bg-slate-950
          "
        >
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">Create New Link</DialogTitle>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="
                rounded-xl
                text-slate-500
              "
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div
          className="
            max-h-[calc(92vh-170px)]
            overflow-y-auto
            bg-slate-50
            px-8
            py-8
            dark:bg-slate-950
          "
        >
          <div className="space-y-8">
            <UrlSection value={url} onChange={setUrl} />

            {url.trim() && (
              <ShortenedLinkSection
                originalUrl={url}
                domain={domain}
                slug={slug}
                onDomainChange={setDomain}
                onSlugChange={setSlug}
              />
            )}

            <AdvancedSection />
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            sticky
            bottom-0
            flex
            items-center
            justify-end
            gap-3
            border-t
            border-slate-200
            bg-white
            px-8
            py-5
            dark:border-slate-800
            dark:bg-slate-950
          "
        >
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button loading={loading} onClick={handleSubmit} className="px-8">
            Create Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
