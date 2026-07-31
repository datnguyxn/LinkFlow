export default function WorkspaceOverviewSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Skeleton */}
        <div
          className="
            relative
            h-56
            animate-pulse
            overflow-hidden
            bg-slate-200
            p-8
            shadow-lg
            dark:bg-slate-800
          "
        >
          <div className="flex h-full flex-col justify-between gap-6 md:flex-row md:items-center">
            {/* Workspace information */}
            <div className="flex items-center gap-5">
              {/* Logo */}
              <div
                className="
                  h-20
                  w-20
                  shrink-0
                  rounded-2xl
                  bg-slate-300
                  dark:bg-slate-700
                "
              />

              {/* Workspace details */}
              <div className="space-y-3">
                {/* Workspace name + role */}
                <div className="flex items-center gap-3">
                  <div
                    className="
                      h-9
                      w-48
                      rounded-lg
                      bg-slate-300
                      dark:bg-slate-700
                    "
                  />

                  {/* Role badge */}
                  <div
                    className="
                      h-6
                      w-20
                      rounded-full
                      bg-slate-300
                      dark:bg-slate-700
                    "
                  />
                </div>

                {/* Description */}
                <div
                  className="
                    h-4
                    w-72
                    rounded
                    bg-slate-300
                    dark:bg-slate-700
                  "
                />
              </div>
            </div>

            {/* Settings button */}
            <div
              className="
                h-11
                w-44
                rounded-xl
                bg-slate-300
                dark:bg-slate-700
              "
            />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="
                h-36
                animate-pulse
                rounded-2xl
                bg-slate-200
                dark:bg-slate-800
              "
            />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div
            className="
              h-96
              animate-pulse
              rounded-2xl
              bg-slate-200
              dark:bg-slate-800
              lg:col-span-2
            "
          />

          <div
            className="
              h-96
              animate-pulse
              rounded-2xl
              bg-slate-200
              dark:bg-slate-800
            "
          />
        </div>
      </div>
    </div>
  );
}