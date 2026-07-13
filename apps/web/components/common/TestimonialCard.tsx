interface Props {
  name: string;
  role: string;
  company: string;
  content: string;
}

export default function TestimonialCard({ name, role, company, content }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-7 shadow-sm">
      <div className="mb-5 flex text-yellow-400">★★★★★</div>

      <p className="text-slate-600">{content}</p>

      <div className="mt-6">
        <h4 className="font-semibold">{name}</h4>

        <p className="text-sm text-slate-500">
          {role} • {company}
        </p>
      </div>
    </div>
  );
}
