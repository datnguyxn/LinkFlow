import GoogleIcon from "../icons/GoogleIcon";

export default function GoogleButton() {
  return (
    <button
      className="
        flex
        h-12
        w-full
        items-center
        justify-center
        gap-4
        rounded-2xl
        border
        border-slate-700
        bg-slate-800/50
        text-lg
        font-semibold
        text-white
        transition-all
        duration-300
        hover:border-blue-500
        hover:bg-slate-800
      "
    >
      <GoogleIcon />

      Continue with Google
    </button>
  );
}