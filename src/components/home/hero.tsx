"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

const easeOutQuart = [0.25, 1, 0.5, 1] as const;

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-svh w-full items-end justify-center overflow-hidden bg-secondary-black">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.015 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: easeOutQuart }}
      >
        <Image
          src="/images/recruitment-post.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/65 via-black/20 to-transparent"
      />

      <h1 className="sr-only">KTH AI Society recruitment is open</h1>

      <div className="relative z-10 w-full px-4 pb-10 sm:px-6 sm:pb-12">
        <motion.div
          className="mx-auto flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOutQuart, delay: 0.15 }}
        >
          <Button
            size="lg"
            asChild
            className="h-12 flex-1 px-8 text-base sm:flex-none"
          >
            <Link href="/apply">Apply now</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-12 flex-1 border-white/35 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:flex-none"
          >
            <Link href="/events">Upcoming events</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
