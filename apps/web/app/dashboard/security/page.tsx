import SecurityHeader from '@/components/security/SecurityHeader';
import ChangePasswordCard from '@/components/security/ChangePasswordCard';
import EmailVerificationCard from '@/components/security/EmailVerificationCard';
import ConnectedAccountCard from '@/components/security/ConnectedAccountCard';
import ActiveSessionsCard from '@/components/security/ActiveSessionsCard';
import DangerZoneCard from '@/components/security/DangerZoneCard';

export default function SecurityPage() {
  return (
    <div className="">
      <SecurityHeader />

      <div
        className="grid gap-6 lg:grid-cols-2  pt-7
        pe-8
        ps-8
        space-y-6
        dark:bg-slate-950"
      >
        <ChangePasswordCard />

        <EmailVerificationCard />

        <ConnectedAccountCard />

        <ActiveSessionsCard />
      </div>

      <div
        className=" pt-7
        pe-8
        ps-8
        space-y-6
        dark:bg-slate-950"
      >
        <DangerZoneCard />
      </div>
    </div>
  );
}
