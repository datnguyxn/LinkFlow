import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import PricingCard from '../common/PricingCard';

import { pricingPlans } from '@/constants/pricing';

export default function Pricing() {
  return (
    <section id="pricing" className="bg-slate-50 py-24 dark:bg-slate-900">
      <Container>
        <SectionTitle
          eyebrow="Pricing"
          title="Simple pricing"
          subtitle="Choose the plan that fits your needs."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </Container>
    </section>
  );
}
