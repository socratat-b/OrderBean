"use client";

import Link from "next/link";
import { motion } from "motion/react";

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

const contactItem = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.2 + i * 0.12, ease: easeOut },
  }),
};

const contactInfo = [
  {
    title: "Address",
    content: (
      <p className="text-muted-foreground mt-1">
        123 Coffee Street
        <br />
        Makati City, Manila 1200
        <br />
        Philippines
      </p>
    ),
    icon: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        />
      </>
    ),
  },
  {
    title: "Opening Hours",
    content: (
      <p className="text-muted-foreground mt-1">
        Monday - Friday: 7:00 AM - 8:00 PM
        <br />
        Saturday - Sunday: 8:00 AM - 9:00 PM
      </p>
    ),
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    ),
  },
  {
    title: "Contact",
    content: (
      <p className="text-muted-foreground mt-1">
        Phone:{" "}
        <a
          href="tel:+639123456789"
          className="hover:text-primary transition-colors"
        >
          +63 912 345 6789
        </a>
        <br />
        Email:{" "}
        <a
          href="mailto:hello@orderbean.com"
          className="hover:text-primary transition-colors"
        >
          hello@orderbean.com
        </a>
      </p>
    ),
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    ),
  },
];

export default function LocationSection() {
  return (
    <section id="location" className="bg-background scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-12 text-center"
        >
          <div className="bg-muted text-muted-foreground mb-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
            Visit Us
          </div>
          <h2 className="text-foreground text-4xl font-black md:text-5xl">
            Find Us Here
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Come visit our cozy coffee shop in the heart of Manila. We
            can&apos;t wait to serve you!
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Google Maps */}
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="border-border relative h-96 overflow-hidden rounded-3xl border"
          >
            <iframe
              src="https://maps.google.com/maps?q=13.277729663543528,123.75836901798884&hl=en&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="OrderBean Coffee Shop Location"
              className="absolute inset-0"
            ></iframe>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-6">
              {contactInfo.map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={contactItem}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className="flex items-start gap-4"
                >
                  <div className="bg-accent bg-opacity-20 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="text-accent-foreground h-7 w-7"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-foreground text-lg font-bold">
                      {item.title}
                    </h3>
                    {item.content}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="border-border mt-8 border-t pt-8"
            >
              <Link
                href="/menu"
                className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
              >
                Order for Pickup
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
