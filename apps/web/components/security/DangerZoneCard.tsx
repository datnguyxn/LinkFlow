'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

import Button from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

import DangerZoneCardSkeleton from './DangerZoneCardSkeleton';

import { appToast } from '@/lib/toast';
import { useMe } from '@/hooks/queries/useMe';
import { useDelete } from '@/hooks/mutations/useDelete';
import { useLogout } from '@/hooks/mutations/useLogout';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function DangerZoneCard() {
  const { data: user, isLoading: loading, isError } = useMe();

  const deleteAccount = useDelete();

  const logout = useLogout();

  if (loading) {
    return <DangerZoneCardSkeleton />;
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();

      appToast.success('Account deleted successfully');

      // Optionally, you can redirect the user to a different page after account deletion
      await logout.mutateAsync();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <Card className="border-red-300 mx-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-red-600" />

          <div>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>

            <CardDescription>Permanently delete your account.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex items-center justify-between">
        <div>
          <p className="font-medium">Delete Account</p>

          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
        </div>

        {/* <Button
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-100 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </Button> */}

        <ConfirmDialog
          title="Delete your account?"
          description="This action is permanent and cannot be undone. All of your links, analytics, QR codes, and account data will be permanently deleted."
          confirmText="Delete Account"
          loading={deleteAccount.isPending}
          variant="destructive"
          onConfirm={handleDeleteAccount}
          trigger={
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-100 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600"
            >
              Delete Account
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
