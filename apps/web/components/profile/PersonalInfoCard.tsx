import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PersonalInfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>

      <CardContent
        className="
        space-y-4
        "
      >
        <div>
          <p className="text-sm font-bold text-black dark:text-white">Full name</p>

          <p>Dat Nguyen</p>
        </div>

        <div>
          <p className="text-sm font-bold text-black dark:text-white">Email</p>

          <p>dat@gmail.com</p>
        </div>

        <div>
          <p className="text-sm font-bold text-black dark:text-white">Username</p>

          <p>datnobi</p>
        </div>
      </CardContent>
    </Card>
  );
}
