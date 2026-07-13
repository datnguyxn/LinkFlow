import Link from 'next/link';

interface AuthHeaderProps {
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}

export default function AuthHeader({ title, description, linkText, linkHref }: AuthHeaderProps) {
  return (
    <div className="mb-10 text-center">
      <h1
        className="
          text-4xl
          font-extrabold
          tracking-tight
          text-black
          dark:text-white
        "
      >
        {title}
      </h1>

      <p
        className="
          mt-4
          text-5sm
          text-slate-400
        "
      >
        {description}{' '}
        <Link
          href={linkHref}
          className="
            font-semibold
            text-blue-500
            transition
            hover:text-blue-400
          "
        >
          {linkText}
        </Link>
      </p>
    </div>
  );
}
