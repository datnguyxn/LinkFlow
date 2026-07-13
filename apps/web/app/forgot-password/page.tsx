import ForgotPasswordForm from '@/components/forms/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-gradient-to-br
        from-slate-50
        via-white
        to-slate-100
        px-6
        py-10
        dark:from-slate-950
        dark:via-slate-900
        dark:to-slate-950
      "
    >
      <ForgotPasswordForm />
    </main>
  );
}
