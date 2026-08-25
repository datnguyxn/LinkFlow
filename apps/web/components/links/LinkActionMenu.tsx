'use client';

import {
  Copy,
  Edit,
  BarChart3,
  Archive,
  Trash2,
  MoreHorizontal,
  QrCode,
  ExternalLink,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import Button from '@/components/ui/button';

interface Props {
  onOpen(): void;

  onEdit(): void;

  onAnalytics(): void;

  onQrCode(): void;

  onArchive(): void;

  onDelete(): void;

  onCopy(): void;
}

export default function LinkActionMenu({
  onOpen,
  onEdit,
  onAnalytics,
  onQrCode,
  onArchive,
  onDelete,
  onCopy,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56"
      >
        <DropdownMenuItem
          onClick={onOpen}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onCopy}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy link
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onEdit}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onQrCode}
        >
          <QrCode className="mr-2 h-4 w-4" />
          QR Code
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onAnalytics}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onArchive}
        >
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}