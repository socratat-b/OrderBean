"use client";

import Image from "next/image";
import { motion } from "motion/react";

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;
const backOut = [0.34, 1.56, 0.64, 1] as const;

const slideFromLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

const featureItem = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: 0.3 + i * 0.15, ease: easeOut },
  }),
};

const floatingBadge = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: 0.4, ease: backOut },
  },
};

const features = [
  {
    title: "Premium Quality Beans",
    description:
      "Ethically sourced from the world\u0027s finest coffee regions",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    ),
  },
  {
    title: "Freshly Roasted Daily",
    description: "Roasted in small batches for maximum freshness and flavor",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
      />
    ),
  },
  {
    title: "Expert Baristas",
    description:
      "Trained professionals dedicated to crafting your perfect cup",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    ),
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="from-muted to-background scroll-mt-20 bg-gradient-to-br py-20"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop"
                alt="Coffee shop interior"
                width={800}
                height={600}
                className="rounded-3xl shadow-2xl"
              />
              <motion.div
                variants={floatingBadge}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-card border-border absolute -right-6 -bottom-6 rounded-2xl border p-6 shadow-xl"
              >
                <div className="text-foreground text-4xl font-black">10+</div>
                <div className="text-muted-foreground text-sm">
                  Years of Excellence
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="order-1 lg:order-2"
          >
            <div className="bg-accent bg-opacity-20 text-accent-foreground mb-6 inline-block rounded-full px-4 py-2 text-sm font-semibold">
              About OrderBean
            </div>
            <h2 className="text-foreground text-4xl font-black md:text-5xl">
              Brewing Excellence Since 2014
            </h2>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              At OrderBean, we believe that great coffee starts with great
              beans. We source our coffee from ethical, sustainable farms around
              the world and roast them fresh daily in our shop.
            </p>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Our passionate baristas are trained to craft the perfect cup every
              time, whether you prefer a classic espresso or a creative seasonal
              specialty.
            </p>

            {/* Features */}
            <div className="mt-8 space-y-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  variants={featureItem}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className="flex items-start gap-4"
                >
                  <div className="bg-accent bg-opacity-20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="text-accent-foreground h-6 w-6"
                    >
                      {feature.icon}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
