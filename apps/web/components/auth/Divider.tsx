export default function Divider() {
  return (
    <div className="my-10 flex items-center gap-6">
      <div className="h-px flex-1 bg-slate-700" />

      <span
        className="
          text-lg
          text-slate-400
        "
      >
        or continue with email
      </span>

      <div className="h-px flex-1 bg-slate-700" />
    </div>
  );
}