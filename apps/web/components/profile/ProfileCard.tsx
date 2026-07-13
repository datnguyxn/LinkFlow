import { Card, CardContent } from '@/components/ui/card';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileAvatar from './ProfileAvatar';

export default function ProfileCard() {
  return (
    <Card className="-mt-12 mx-8 shadow-lg">
      <CardContent
        className="
            flex
            items-center
            justify-between
            p-6
            "
      >
        <div
          className="
            flex
            items-center
            gap-5
            "
        >
          {/* <Avatar className="h-20 w-20 hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:cursor-pointer">
            <AvatarImage src="/avatar.png" />

            <AvatarFallback>DN</AvatarFallback>
          </Avatar> */}
          <ProfileAvatar />

          <div>
            <h2
              className="
                text-xl
                font-semibold
                "
            >
              Dat Nguyen
            </h2>

            <p
              className="
                text-muted-foreground
                "
            >
              dat@email.com
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Member since</p>

          <p className="font-medium">July 2026</p>
        </div>
      </CardContent>
    </Card>
  );
}
