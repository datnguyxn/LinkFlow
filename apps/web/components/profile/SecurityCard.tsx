import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import Button from '@/components/ui/button';

export default function SecurityCard() {
  return (
    <Card className="shadow-lg dark:bg-slate-900">
      <CardHeader>
        <CardTitle>Security</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <p>Password</p>

          <p
            className="
              text-sm
              text-muted-foreground
              "
          >
            No password created yet
          </p>
        </div>

        <Button>Send password setup email</Button>
      </CardContent>
    </Card>
  );
}
