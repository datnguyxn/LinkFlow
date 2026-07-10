import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function NotFound() {
  return (

      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <TriangleAlert className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-7xl font-extrabold">404</h1>

          <h2 className="mt-4 text-3xl font-semibold">
            Oops! Page Not Found
          </h2>

          <p className="mt-4 text-muted-foreground">
            The page you requested does not exist, was removed, or the URL is
            incorrect.
          </p>

          <Link
            href="/"
            className="
            mt-8 
            inline-flex 
            rounded-xl 
            bg-blue-600
            px-6 
            py-3 
            font-semibold
            text-white 
            transition 
            hover:bg-blue-700"
          >
            Back to Homepage
          </Link>
        </div>
      </main>
  );
}