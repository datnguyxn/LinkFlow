'use client';

import { motion } from 'framer-motion';

import type { AnalyticsOverviewCard } from '@/types/analytics';

interface Props {
  data: AnalyticsOverviewCard;
}

export default function AnalyticsChartCard({ data }: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -50,
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
      className="
        rounded-3xl
        border
        bg-white
        p-8
        shadow-lg
      "
    >
      <div className="mb-8 flex items-end gap-3">
        {data.chart.map((bar) => (
          <div
            key={bar.id}
            className={`w-10 rounded ${bar.color}`}
            style={{
              height: `${bar.value * 4}px`,
            }}
          />
        ))}
      </div>

      <h3 className="text-xl font-bold">{data.title}</h3>

      <p className="mt-2 text-slate-500">{data.description}</p>
    </motion.div>
  );
}
