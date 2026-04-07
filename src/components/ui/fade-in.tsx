"use client"

import type { HTMLMotionProps } from "framer-motion"
import { motion } from "framer-motion"
import { fadeInVariants, useAnimationReady } from "@/lib/animations"
import { cn } from "@/lib/utils"

type As = "div" | "section" | "article" | "li" | "header" | "footer" | "p" | "span" | "h2" | "h3"

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView" | "viewport" | "animate"> {
  delay?: number
  as?: As
  className?: string
}

export function FadeIn({ delay = 0, as = "div", className, children, ...props }: FadeInProps) {
  const ready = useAnimationReady()

  const variants = delay
    ? {
        hidden: fadeInVariants.hidden,
        visible: {
          ...fadeInVariants.visible,
          transition: {
            ...(fadeInVariants.visible as { transition?: object }).transition,
            delay,
          },
        },
      }
    : fadeInVariants

  const Tag = motion[as] as typeof motion.div

  // Before mount: render a plain element so content is always visible with no flash
  if (!ready) {
    const Plain = as as React.ElementType
    return <Plain className={cn(className)}>{children}</Plain>
  }

  return (
    <Tag
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      {...props}
    >
      {children}
    </Tag>
  )
}
