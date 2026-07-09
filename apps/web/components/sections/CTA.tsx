import Link from "next/link";

import Container from "../common/Container";

export default function CTA() {
  return (
    <section className="py-24 dark:bg-slate-900">
      <Container>
        <div
          className="
            overflow-hidden
            rounded-3xl
            bg-gradient-to-r
            from-blue-600
            via-sky-600
            to-indigo-600
            px-8
            py-20
            text-center
            text-white
          "
        >
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
            Get Started Today
          </span>

          <h2 className="mx-auto mt-8 max-w-3xl text-5xl font-bold">
            Start managing your links smarter.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Join thousands of users using LinkFlow to shorten URLs,
            create QR Codes and monitor traffic in real time.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <Link
              href="/register"
              className="
                rounded-xl
                bg-white
                px-8
                py-4
                font-semibold
                text-blue-700
                transition
                hover:scale-105
              "
            >
              Create Free Account
            </Link>

            <Link
              href="/pricing"
              className="
                rounded-xl
                border
                border-white
                px-8
                py-4
                font-semibold
                text-white
                transition
                hover:bg-white
                hover:text-blue-700
              "
            >
              View Pricing
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}