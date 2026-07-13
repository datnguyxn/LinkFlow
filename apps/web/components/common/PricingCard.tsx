import Link from 'next/link';

interface Props {
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
}

export default function PricingCard({ name, price, description, features, featured }: Props) {
  return (
    <div
      className={`
        rounded-3xl border p-8 transition
        ${
          featured
            ? 'border-blue-600 shadow-2xl scale-105'
            : 'border-slate-200 shadow-sm hover:shadow-lg'
        }
      `}
    >
      {featured && (
        <div className="mb-5 inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold">{name}</h3>

      <p className="mt-2 text-slate-500">{description}</p>

      <div className="mt-8">
        <span className="text-5xl font-bold">{price}</span>

        <span className="text-slate-500">/month</span>
      </div>

      <ul className="mt-8 space-y-3">
        {features.map((item) => (
          <li key={item} className="flex gap-2">
            ✓ {item}
          </li>
        ))}
      </ul>

      <Link
        href="/register"
        className={`
          mt-10 block rounded-xl py-3 text-center font-semibold
          ${featured ? 'bg-blue-600 text-white' : 'border'}
        `}
      >
        Get Started
      </Link>
    </div>
  );
}
