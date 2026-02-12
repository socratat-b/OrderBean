"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;
const backOut = [0.34, 1.56, 0.64, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: easeOut },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay: 0.3, ease: easeOut },
  },
};

const statCounter = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.6 + i * 0.15, ease: easeOut },
  }),
};

export default function HeroSection() {
  return (
    <section className="from-muted via-background to-muted relative overflow-hidden bg-gradient-to-br">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="bg-accent bg-opacity-20 text-accent-foreground mb-6 inline-block rounded-full px-4 py-2 text-sm font-semibold"
            >
              Premium Coffee Experience
            </motion.div>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="text-foreground text-5xl font-black tracking-tight md:text-6xl lg:text-7xl"
            >
              Your Daily Dose of{" "}
              <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
                Happiness
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className="text-muted-foreground mt-6 text-lg leading-relaxed md:text-xl"
            >
              Freshly brewed coffee, delicious pastries, and a warm atmosphere.
              Order ahead and skip the line!
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.35}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href="/menu"
                className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Order Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="ml-2 h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <Link
                href="#menu"
                className="border-primary bg-background text-foreground hover:bg-muted inline-flex items-center justify-center rounded-xl border-2 px-8 py-4 text-base font-semibold transition-all"
              >
                Explore Menu
              </Link>
            </motion.div>
            {/* Stats */}
            <div className="border-border mt-12 grid grid-cols-3 gap-6 border-t pt-8">
              {[
                { value: "500+", label: "Happy Customers" },
                { value: "4.9", label: "Rating" },
                { value: "15+", label: "Menu Items" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={statCounter}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                >
                  <div className="text-foreground text-3xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div className="absolute -top-4 -left-4 h-72 w-72 rounded-full bg-amber-200 opacity-20 blur-3xl"></div>
            <div className="absolute -right-4 -bottom-8 h-72 w-72 rounded-full bg-orange-200 opacity-20 blur-3xl"></div>
            <Image
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop"
              alt="Coffee cup"
              width={800}
              height={800}
              className="relative rounded-3xl shadow-2xl"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
