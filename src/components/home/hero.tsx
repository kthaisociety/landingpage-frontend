"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  easeOutQuart,
  useAnimationReady,
  containerVariants,
  titleVariants,
  descriptionVariants,
  accentVariants,
  buttonGroupVariants,
} from "@/lib/animations"

export function Hero() {
  const ready = useAnimationReady()
  const enableInteractionMotion = ready

  return (
    <section className="relative min-h-screen pb-12 lg:pb-0 w-full flex items-end lg:items-center">
      {/* Full-screen ASCII background — logo centred in the right half on desktop, centred on mobile */}
      <div className="absolute inset-0 z-0">
        {/* Mobile: logo centred in top 70vh */}
        <div className="lg:hidden absolute inset-x-0 top-0 h-[70vh]">
          <AsciiGrid
            className="w-full h-full opacity-100"
            color="var(--color-primary)"
            cellSize={10}
            logoSrc="/kthais-logo.svg"
            logoPosition="center"
            logoScale={0.6}
          />
        </div>
        {/* Desktop: logo centred in full section height, positioned on right half */}
        <AsciiGrid
          className="hidden lg:block w-full h-full opacity-100"
          color="var(--color-primary)"
          cellSize={10}
          logoSrc="/kthais-logo.svg"
          logoPosition="right"
          logoScale={0.7}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-background via-background/60 to-transparent pointer-events-none" />
        {/* Radial vignette — stronger on the left on desktop so text is legible */}
        <div className="absolute inset-0 lg:bg-[radial-gradient(ellipse_at_left_center,var(--color-background)_0%,transparent_50%)] pointer-events-none" />
        {/* Edge vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,var(--color-background)_100%)] pointer-events-none" />
      </div>

      {/* Content — left-aligned on desktop, centred on mobile */}
      <div className="container mx-auto max-w-7xl px-4 relative z-20 w-full">
        <motion.div
          className="space-y-6 text-center lg:text-left lg:max-w-lg"
          variants={containerVariants}
          initial="hidden"
          animate={ready ? "visible" : "hidden"}
        >
          <motion.h1
            className="mx-auto lg:mx-0 max-w-3xl text-3xl leading-none tracking-tight text-foreground sm:text-4xl md:text-5xl"
            variants={titleVariants}
          >
            Sweden&apos;s Leading Student AI Community
          </motion.h1>

          <motion.p
            className="mx-auto lg:mx-0 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7"
            variants={descriptionVariants}
          >
            A community for students exploring, building, and shaping the future of artificial intelligence through research, collaboration, and continuous learning.
          </motion.p>

          <motion.div
            aria-hidden="true"
            className="mx-auto lg:mx-0 w-24 origin-center lg:origin-left"
            variants={accentVariants}
          >
            <Separator className="bg-primary/75" />
          </motion.div>

          <motion.div
            className="flex flex-col items-center lg:items-start gap-4 pt-4"
            variants={buttonGroupVariants}
          >
            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <motion.div
            
                transition={{ duration: 0.18, ease: easeOutQuart }}
              >
                <Button size="lg" asChild>
                  <Link href="/events" className="flex items-center gap-1">
                    Upcoming Events
                  </Link>
                </Button>
              </motion.div>

              <motion.div
             
                transition={{ duration: 0.18, ease: easeOutQuart }}
              >
                <Button variant="outline" size="lg" asChild>
                  <Link href="/newsletter">Join the Society</Link>
                </Button>
              </motion.div>
            </div>

            {/* Secondary sponsor link */}
            <Link
              href="mailto:business@kthais.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground/40"
            >
              Partnering with us as a sponsor?
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
