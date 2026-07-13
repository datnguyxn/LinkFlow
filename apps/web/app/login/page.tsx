import AuthCard from '@/components/auth/AuthCard';
import AuthHeader from '@/components/auth/AuthHeader';
import LoginForm from '@/components/forms/auth/LoginForm';

export default function LoginPage() {
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
          title="Welcome back"
          description="Don't have an account?"
          linkText="Sign up"
          linkHref="/register"
        />

        <AuthCard>
          <LoginForm />
        </AuthCard>
      </div>
    </main>
  );
}
