'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, TriangleAlert } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <TriangleAlert className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-7xl font-extrabold">404</h1>

        <h2 className="mt-4 text-3xl font-semibold">Oops! Page Not Found</h2>

        <p className="mt-4 text-muted-foreground">
          The page you requested does not exist, was removed, or the URL is incorrect.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>

          <button
            onClick={() => router.replace('/')}
            className="flex items-center gap-2 rounded-xl border px-5 py-3"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
        </div>
      </div>
    </main>
  );
}
