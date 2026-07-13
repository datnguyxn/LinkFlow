import {
  Activity,
  BarChart3,
  Globe,
  KeyRound,
  MapPin,
  MousePointerClick,
  PencilLine,
  QrCode,
  Scissors,
  Search,
  Smartphone,
  Users,
} from 'lucide-react';

export const features = [
  {
    title: 'URL Shortening',
    description: 'Generate short links instantly.',
    icon: Scissors,
  },
  {
    title: 'Custom Slugs',
    description: 'Create memorable branded URLs.',
    icon: PencilLine,
  },
  {
    title: 'QR Codes',
    description: 'Generate QR codes automatically.',
    icon: QrCode,
  },
  {
    title: 'Link Analytics',
    description: 'Powerful analytics dashboard.',
    icon: BarChart3,
  },
  {
    title: 'Click Tracking',
    description: 'Track every click in realtime.',
    icon: MousePointerClick,
  },
  {
    title: 'Device Analytics',
    description: 'Desktop, mobile and tablet usage.',
    icon: Smartphone,
  },
  {
    title: 'Country Analytics',
    description: 'Know where visitors come from.',
    icon: Globe,
  },
  {
    title: 'Location Insights',
    description: 'Country & city reports.',
    icon: MapPin,
  },
  {
    title: 'Workspace',
    description: 'Collaborate with your team.',
    icon: Users,
  },
  {
    title: 'Search',
    description: 'Search millions of links instantly.',
    icon: Search,
  },
  {
    title: 'Realtime Dashboard',
    description: 'Live analytics with zero delay.',
    icon: Activity,
  },
  {
    title: 'Security',
    description: 'Secure links with password protection.',
    icon: KeyRound,
  },
];
