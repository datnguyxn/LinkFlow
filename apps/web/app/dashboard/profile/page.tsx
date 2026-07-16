import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileCard from '@/components/profile/ProfileCard';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import SecurityCard from '@/components/profile/SecurityCard';
import QuickActions from '@/components/profile/QuickActions';

export default function ProfilePage() {
  return (
    <div>
      <ProfileHeader />

      <div
        className="
        pt-7
        pe-8
        ps-8
        space-y-6
        dark:bg-slate-950
        "
      >
        <ProfileCard />
        <div
          className="
          grid
          grid-cols-2
          gap-6
          p-8
          pt-0
          "
        >
          <PersonalInfoCard />

          <QuickActions />

          <SecurityCard />
        </div>
      </div>
    </div>
  );
}
