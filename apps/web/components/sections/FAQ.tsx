import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import FAQItem from '../common/FAQItem';

import { faqs } from '@/constants/faq';

export default function FAQ() {
  return (
    <section className="py-24 dark:bg-slate-900">
      <Container>
        <SectionTitle eyebrow="FAQ" title="Frequently Asked Questions" />

        <div className="mx-auto mt-12 max-w-3xl space-y-5">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </Container>
    </section>
  );
}
