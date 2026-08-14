"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { Button } from "@/components/ui/button"
import { EventsPreview } from "@/components/home/events-preview"

const LUMA_SIGNUP_URL = "https://luma.com/kthais"

const easeOutQuart = [0.25, 1, 0.5, 1] as const

function subscribeToHydration() {
  return () => {}
}

type NewsletterFormProps = {
  variant?: "page" | "card"
  className?: string
}

function NewsletterCta({ className }: Omit<NewsletterFormProps, "variant">) {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  )
  const prefersReducedMotion = useReducedMotion()
  const enableInteractionMotion = isHydrated && !prefersReducedMotion

  return (
    <motion.div
      whileHover={enableInteractionMotion ? { y: -2, scale: 1.015 } : undefined}
      whileTap={enableInteractionMotion ? { y: 0, scale: 0.985 } : undefined}
      transition={{ duration: 0.18, ease: easeOutQuart }}
      className="inline-block"
    >
      <Button
        asChild
        size="lg"
        className={cn(
          "px-12 py-8 text-xl max-sm:px-6 max-sm:py-4 max-sm:text-base",
          className,
        )}
      >
        <a
          href={LUMA_SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1"
        >
          Sign up on Luma
          <ArrowUpRight />
        </a>
      </Button>
    </motion.div>
  )
}

export function NewsletterForm({
  variant = "card",
  className,
}: NewsletterFormProps) {
  const [newsletterTextMask, setNewsletterTextMask] = useState<
    string | undefined
  >(undefined)

  useEffect(() => {
    if (variant !== "page") {
      return
    }

    const canvas = document.createElement("canvas")
    canvas.width = 1200
    canvas.height = 400
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.font = "bold 180px system-ui, -apple-system, sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.fillText("NEWSLETTER", 40, 70)

    const dataUrl = canvas.toDataURL("image/png")
    requestAnimationFrame(() => {
      setNewsletterTextMask(dataUrl)
    })
  }, [variant])

  if (variant === "card") {
    return <NewsletterCta className={className} />
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-white pt-64 pb-24 text-secondary-black">
        <div className="pointer-events-none absolute inset-0">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={newsletterTextMask}
            logoPosition="center"
            logoScale={0.58}
            enableDripping={false}
            className="h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,white_100%)]" />
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4 pb-8 md:px-6">
          <h4 className="mb-2 text-3xl tracking-tighter">
            <span className="font-times font-normal text-primary">
              (Newsletter)
            </span>{" "}
            Updates
          </h4>
          <h1 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl">
            Stay Updated
          </h1>
        </div>
      </section>

      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative z-20 mx-auto -mt-24 mb-24 flex max-w-7xl flex-col gap-8 rounded-3xl border bg-neutral-50 p-4 shadow-lg md:p-8">
          <div className="flex max-w-3xl flex-col gap-2">
            <div>
              <Link
                href="/"
                className="text-sm font-medium text-secondary-gray transition-colors hover:text-primary"
              >
                Home
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-sm font-medium text-primary">
                Newsletter
              </span>
            </div>
            <p className="max-w-2xl text-lg leading-relaxed opacity-95 md:text-xl">
              Join our mailing list for major society updates, upcoming
              events, new projects, and curated AI community news.
            </p>
          </div>

          <NewsletterCta className={cn("max-w-2xl", className)} />
        </section>
      </div>

      <EventsPreview />
    </div>
  )
}
