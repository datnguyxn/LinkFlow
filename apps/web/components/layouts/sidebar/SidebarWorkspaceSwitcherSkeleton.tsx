export default function SidebarWorkspaceSwitcherSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-xl p-3">
          <div
            className="
              h-9
              w-9
              shrink-0
              animate-pulse
              rounded-lg
              bg-slate-200
              dark:bg-slate-700
            "
          />

          <div className="flex-1 space-y-2">
            <div
              className="
                h-3
                w-3/4
                animate-pulse
                rounded
                bg-slate-200
                dark:bg-slate-700
              "
            />

            <div
              className="
                h-2
                w-1/2
                animate-pulse
                rounded
                bg-slate-200
                dark:bg-slate-700
              "
            />
          </div>
        </div>
      ))}
    </div>
  );
}
