"use client";

import { motion } from "framer-motion";

import Container from "../common/Container";
import SectionTitle from "../common/SectionTitle";
import StatCard from "../common/StatCard";

export default function Analytics() {
  return (
    <section
      id="analytics"
      className="bg-slate-50 py-24 dark:bg-slate-900"
    >
      <Container>
        <SectionTitle
          eyebrow="Analytics"
          title="Real-time insights for every click"
          subtitle="Monitor performance, users, traffic sources and devices in one beautiful dashboard."
        />

        <div className="grid gap-8 lg:grid-cols-2">
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
              <div className="h-28 w-10 rounded bg-blue-500" />
              <div className="h-40 w-10 rounded bg-sky-500" />
              <div className="h-20 w-10 rounded bg-cyan-500" />
              <div className="h-48 w-10 rounded bg-indigo-500" />
              <div className="h-32 w-10 rounded bg-violet-500" />
              <div className="h-56 w-10 rounded bg-blue-600" />
            </div>

            <h3 className="text-xl font-bold dark:text-black">
              Weekly Clicks
            </h3>

            <p className="mt-2 text-slate-500">
              Your links continue growing every day.
            </p>
          </motion.div>

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
            <StatCard
              title="Total Clicks"
              value="2.8M"
            />

            <StatCard
              title="Active Links"
              value="18,942"
              color="bg-green-500"
            />

            <StatCard
              title="Countries"
              value="126"
              color="bg-orange-500"
            />

            <StatCard
              title="API Requests"
              value="89M"
              color="bg-purple-500"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}