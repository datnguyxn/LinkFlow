import type { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div
      className="
        rounded-[24px]
        bg-white
        p-7
        shadow-2xl
        backdrop-blur-xl
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      <div className="mb-10 flex justify-center">
        <div className="text-center">
          <h2
            className="
              text-3xl
              font-black
              tracking-tight
              text-black
              dark:text-slate-900
              dark:font-extrabold
              dark:text-white
            "
          >
            LinkFlow
          </h2>

          <p
            className="
              mt-2
              text-sm
              uppercase
              tracking-[0.20em]
              text-slate-500
            "
          >
            SMART LINKS
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}
