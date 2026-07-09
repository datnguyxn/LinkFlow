import Container from "../common/Container";
import FeatureCard from "../common/FeatureCard";
import SectionTitle from "../common/SectionTitle";

import { features } from "@/constants/features";

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 dark:bg-slate-900"
    >
      <Container>
        <SectionTitle
          eyebrow="Features"
          title="Everything you need to manage links"
          subtitle="Enterprise-grade features designed for modern businesses."
        />

        <div
          className="
          grid
          gap-6
          sm:grid-cols-2
          lg:grid-cols-3
          dark:bg-slate-900
        "
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}