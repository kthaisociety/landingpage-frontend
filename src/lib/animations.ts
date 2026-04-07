import { useEffect, useState } from "react"
import type { Variants } from "framer-motion"

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------

export const easeOutQuart = [0.25, 1, 0.5, 1] as const

// ---------------------------------------------------------------------------
// Hydration hook — returns true after the first client render.
// ---------------------------------------------------------------------------

export function useAnimationReady() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // Double-rAF: ensures the browser has painted the "hidden" state at least
    // once before flipping to "visible". Without this, React batches both
    // states into the same paint frame so the transition never runs.
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true))
    })
    return () => cancelAnimationFrame(id)
  }, [])
  return mounted
}

// ---------------------------------------------------------------------------
// Shared entrance variants (used by the Hero stagger cascade)
// ---------------------------------------------------------------------------

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

export const titleVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(1px)",
    y: 3,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 1.1, ease: easeOutQuart },
  },
}

export const descriptionVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(0.5px)",
    y: 2,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.9, ease: easeOutQuart },
  },
}

export const accentVariants: Variants = {
  hidden: {
    opacity: 0,
    scaleX: 0.97,
  },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.8, ease: easeOutQuart, delay: 0.04 },
  },
}

export const buttonGroupVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(0.5px)",
    y: 3,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.9, ease: easeOutQuart, delay: 0.08 },
  },
}

// ---------------------------------------------------------------------------
// Generic scroll-triggered fade-in variant (used by FadeIn component)
// ---------------------------------------------------------------------------

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: "blur(3px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: easeOutQuart },
  },
}
