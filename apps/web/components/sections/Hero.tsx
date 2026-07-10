"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

import Container from "../common/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 dark:bg-slate-900">
      {/* Background */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-blue-50 via-white to-sky-50" />

      <div className="absolute -left-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-blue-300/20 blur-3xl" />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />

              <span className="text-sm font-semibold text-blue-700">
                Now with realtime analytics
              </span>
            </div>

            <h1 className="mt-8 text-5xl font-extrabold leading-tight tracking-tight lg:text-6xl">
              Shorten Links.
              <br />
              Track Performance.
              <br />
              Scale with Confidence.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              LinkFlow is the enterprise-grade URL platform for teams.
              Create branded short links, track every click in realtime,
              and ship faster with a developer-first API.
            </p>

            <div className="mt-10 flex gap-5">
              <Link
                href="/register"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:scale-105"
              >
                <ArrowRight />
              </Link>

              <Link
                href="/docs"
                className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white transition hover:bg-slate-100"
              >
                <BookOpen className="text-slate-900 dark:text-black"  />
              </Link>
            </div>

            <div className="mt-12 flex gap-12">
              <div>
                <h3 className="text-3xl font-bold">4B+</h3>
                <p className="text-slate-500">Links shortened</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold">99.9%</h3>
                <p className="text-slate-500">Uptime SLA</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold">12k+</h3>
                <p className="text-slate-500">Teams onboard</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            {/* Floating Image */}
            <motion.div
              animate={{
                y: [-12, 12, -12],
                rotate: [-0.6, 0.6, -0.6],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            >
              <Image
                src="https://images.pexels.com/photos/12969403/pexels-photo-12969403.jpeg"
                alt="Dashboard"
                width={900}
                height={650}
                priority
                className="rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,.18)]"
              />
            </motion.div>

            {/* Floating Card */}
            <motion.div
              className="
              absolute
              -bottom-8
              -left-3

              sm:-bottom-6
              sm:-left-6

              lg:-bottom-8
              lg:-left-8
              overflow-hidden
              rounded-[30px]
              border
              border-white/50
              bg-white/70
              backdrop-blur-3xl
              shadow-[0_25px_60px_rgba(15,23,42,.15)]
              before:absolute
              before:inset-0
              before:bg-gradient-to-br
              before:from-white/60
              before:to-transparent
              before:pointer-events-none
              p-3"
              animate={{
                y: [12, -12, 12],
                rotate: [0.8, -0.8, 0.8],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-blue-500 p-3 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>

                <div>
                  <h5 className="text-lg font-bold">
                    284k
                  </h5>

                  <p className="text-slate-500 dark:text-slate-300">
                    Clicks today
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}