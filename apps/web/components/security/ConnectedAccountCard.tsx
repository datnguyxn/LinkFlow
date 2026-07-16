import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

import Button from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export default function ConnectedAccountCard() {
  return (
    <Card className="mx-8 shadow-lg dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600" />

          <div>
            <CardTitle>Connected Account</CardTitle>

            <CardDescription>OAuth providers.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="font-medium">Google</p>

          <p className="text-sm text-muted-foreground">Connected</p>
        </div>

        <Button>Disconnect</Button>
      </CardContent>
    </Card>
  );
}
