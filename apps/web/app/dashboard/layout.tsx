import DashboardShell from '@/components/dashboard/DashboardShell';
import { WebSocketProvider } from '@/providers/WebSocketProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      <DashboardShell>{children}</DashboardShell>
    </WebSocketProvider>
  );
}
