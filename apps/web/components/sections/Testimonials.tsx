"use client";

import { motion } from "framer-motion";

import Container from "../common/Container";
import SectionTitle from "../common/SectionTitle";
import TestimonialCard from "../common/TestimonialCard";

import { testimonials } from "@/constants/testimonials";

export default function Testimonials() {
  return (
    <section className="py-24 dark:bg-slate-900">
      <Container>
        <SectionTitle
          eyebrow="Testimonials"
          title="Loved by teams around the world"
          subtitle="See what our customers say about LinkFlow."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: index * 0.1,
              }}
            >
              <TestimonialCard {...item} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}