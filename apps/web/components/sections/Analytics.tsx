'use client';

import { motion } from 'framer-motion';

import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import StatCard from '../common/StatCard';
import AnalyticsChartCard from '@/components/common/AnalyticsChartCard';

import { overview } from '@/constants/analytics';

export default function Analytics() {
  return (
    <section id="analytics" className="bg-slate-50 py-24 dark:bg-slate-900">
      <Container>
        <SectionTitle
          eyebrow="Analytics"
          title="Real-time insights for every click"
          subtitle="Monitor performance, users, traffic sources and devices in one beautiful dashboard."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <AnalyticsChartCard data={overview} />

          <motion.div
            initial={{
              opacity: 0,
              x: 50,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
            }}
            className="grid gap-6 sm:grid-cols-2"
          >
            <StatCard title="Total Clicks" value="2.8M" />

            <StatCard title="Active Links" value="18,942" color="bg-green-500" />

            <StatCard title="Countries" value="126" color="bg-orange-500" />

            <StatCard title="API Requests" value="89M" color="bg-purple-500" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
