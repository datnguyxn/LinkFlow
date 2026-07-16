import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

import { ThemeProvider } from '@/providers/theme-provider';

import AuthProvider from '@/providers/AuthProvider';
import QueryProvider from '@/providers/QueryProvider';
import AppToaster from '@/components/ui/Toaster';
import I18nProvider from '@/providers/I18nProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'LinkFlow - Smart Link Management Platform',
    template: '%s | LinkFlow',
  },
  description: 'Create branded short links, QR codes and powerful analytics with LinkFlow.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <I18nProvider>{children}</I18nProvider>
              <AppToaster />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
