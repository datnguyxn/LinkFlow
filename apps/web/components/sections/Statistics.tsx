"use client";

import { motion } from "framer-motion";
import Container from "../common/Container";
import SectionTitle from "../common/SectionTitle";

const stats = [
  {
    value: "10M+",
    title: "Links Created",
  },
  {
    value: "150+",
    title: "Countries",
  },
  {
    value: "99.99%",
    title: "Uptime",
  },
  {
    value: "500K+",
    title: "Monthly Clicks",
  },
];

export default function Statistics() {
  return (
    <section className="bg-slate-50 py-24 dark:bg-slate-900">
      <Container>
        <SectionTitle
          eyebrow="Statistics"
          title="Trusted by thousands of businesses"
          subtitle="Powering millions of redirects every month."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border bg-white p-8 text-center shadow-sm"
            >
              <h3 className="text-4xl font-bold text-blue-600">
                {item.value}
              </h3>

              <p className="mt-3 text-slate-500">
                {item.title}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}