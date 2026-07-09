import Navbar from '@/components/layouts/Navbar';

import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Analytics from '@/components/sections/Analytics';
import Statistics from '@/components/sections/Statistics';
import Testimonials from '@/components/sections/Testimonials';
import Pricing from '@/components/sections/Pricing';
import FAQ from '@/components/sections/FAQ';
import CTA from '@/components/sections/CTA';
import Footer from '@/components/layouts/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Features />
        <Analytics />
        <Statistics />

        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </>
  );
}
