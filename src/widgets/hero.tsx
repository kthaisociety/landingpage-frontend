"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { AsciiGrid } from "@/shared/ui/ascii-grid"
import { Button } from "@/shared/ui/button"

const easeOutQuart = [0.25, 1, 0.5, 1] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.16,
    },
  },
}

const titleVariants = {
  hidden: {
    opacity: 0,
    scale: 0.985,
    filter: "blur(12px)",
    y: 24,
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.85, ease: easeOutQuart },
  },
}

const descriptionVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
    y: 20,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.7, ease: easeOutQuart },
  },
}

const accentVariants = {
  hidden: {
    opacity: 0,
    scaleX: 0.7,
  },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.7, ease: easeOutQuart, delay: 0.08 },
  },
}

const buttonGroupVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
    y: 24,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.7, ease: easeOutQuart, delay: 0.18 },
  },
}

function subscribeToHydration() {
  return () => {}
}

export function Hero() {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  )
  const prefersReducedMotion = useReducedMotion()
  const enableInteractionMotion = isHydrated && !prefersReducedMotion

  return (
    <section className="relative min-h-screen pb-12 w-full flex items-end justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 h-[70vh]">
        <AsciiGrid 
          className="w-full h-full opacity-100" 
          color="#1954A6" 
          cellSize={10} 
          logoSrc="/kthais-logo.svg"
        />
        {/* White gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        {/* Radial gradient overlay around edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,white_100%)] pointer-events-none" />
      </div>

      {/* Content */}
      <div className="container relative z-20 px-4 md:px-6 text-center flex flex-col items-center justify-end h-full pt-20">
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate={isHydrated ? "visible" : "hidden"}
        >
          <motion.h1
            className="mx-auto max-w-3xl text-4xl leading-none tracking-tight text-black sm:text-6xl md:text-7xl"
            variants={titleVariants}
          >
            KTH <span className="font-serif text-[#1954A6]">AI Society</span>
          </motion.h1>

          <motion.p
            className="mx-auto max-w-2xl text-base leading-7 text-black/72 sm:text-xl sm:leading-8"
            variants={descriptionVariants}
          >
            Cultivating the next generation of AI leaders.
          </motion.p>

          <motion.div
            aria-hidden="true"
            className="mx-auto h-px w-24 origin-center bg-[linear-gradient(90deg,transparent,rgba(25,84,166,0.75),transparent)]"
            variants={accentVariants}
          />

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
            variants={buttonGroupVariants}
          >
            <motion.div
              whileHover={enableInteractionMotion ? { y: -2, scale: 1.015 } : undefined}
              whileTap={enableInteractionMotion ? { y: 0, scale: 0.985 } : undefined}
              transition={{ duration: 0.18, ease: easeOutQuart }}
            >
              <Button
                size="lg"
                asChild
              >
                <Link href="/events" className="flex items-center gap-1">
                 Upcoming Events
                </Link>
              </Button>
            </motion.div>

            <motion.div
              whileHover={enableInteractionMotion ? { y: -2, scale: 1.015 } : undefined}
              whileTap={enableInteractionMotion ? { y: 0, scale: 0.985 } : undefined}
              transition={{ duration: 0.18, ease: easeOutQuart }}
            >
              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <Link href="mailto:business@kthais.com">
                  For Sponsors
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
