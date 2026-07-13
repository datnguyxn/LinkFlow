import AuthCard from '@/components/auth/AuthCard';
import AuthHeader from '@/components/auth/AuthHeader';
import RegisterForm from '@/components/forms/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main
      className="
        flex
        h-screen
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
      <div className="w-full max-w-md">
        <AuthHeader
          title="Create account"
          description="Already have an account?"
          linkText="Sign in"
          linkHref="/login"
        />

        <AuthCard>
          <RegisterForm />
        </AuthCard>
      </div>
    </main>
  );
}
