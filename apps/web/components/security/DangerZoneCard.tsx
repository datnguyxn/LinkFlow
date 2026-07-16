import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

import Button from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function DangerZoneCard() {
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

        <Button
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-100 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600"
        >
          Delete Account
        </Button>
      </CardContent>
    </Card>
  );
}
