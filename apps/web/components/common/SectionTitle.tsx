interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: Props) {
  return (
    <div className="mx-auto mb-16 max-w-3xl text-center">
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          {eyebrow}
        </span>
      )}

      <h2 className="mt-4 text-4xl font-bold tracking-tight lg:text-5xl">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-6 text-lg leading-8 text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}