"use client"

import React, { useMemo } from "react"

import { cn } from "@/shared/lib/utils";

export interface ProgressiveBlurProps {
  className?: string
  height?: string
  position?: "top" | "bottom" | "both"
  blurLevels?: number[]
  children?: React.ReactNode
}

export function ProgressiveBlur({
  className,
  height = "30%",
  position = "bottom",
  blurLevels = [1, 3, 6, 8],
}: ProgressiveBlurProps) {
  // Optimized: Reduced from 8 layers to 4 layers for better performance
  // Memoize gradient calculations to avoid recalculation
  const gradients = useMemo(() => {
    const layers = blurLevels.length
    const step = 100 / layers

    return blurLevels.map((blur, index) => {
      const start = index * step
      const end = (index + 1) * step

      let maskGradient: string
      if (position === "bottom") {
        maskGradient = `linear-gradient(to bottom, rgba(0,0,0,0) ${start}%, rgba(0,0,0,1) ${end}%)`
      } else if (position === "top") {
        maskGradient = `linear-gradient(to top, rgba(0,0,0,0) ${start}%, rgba(0,0,0,1) ${end}%)`
      } else {
        maskGradient = `linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)`
      }

      return {
        blur,
        maskGradient,
        zIndex: index + 1,
      }
    })
  }, [blurLevels, position])

  return (
    <div
      className={cn(
        "gradient-blur pointer-events-none absolute inset-x-0 z-10",
        className,
        position === "top"
          ? "top-0"
          : position === "bottom"
            ? "bottom-0"
            : "inset-y-0"
      )}
      style={{
        height: position === "both" ? "100%" : height,
        // GPU acceleration hints
        transform: "translateZ(0)",
        willChange: "transform",
        contain: "layout style paint",
      }}
    >
      {gradients.map(({ blur, maskGradient, zIndex }, index) => (
        <div
          key={`blur-${index}`}
          className="absolute inset-0"
          style={{
            zIndex,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient,
            // GPU acceleration hints
            transform: "translateZ(0)",
            willChange: "backdrop-filter",
            // Limit repaints
            contain: "layout style paint",
          }}
        />
      ))}
    </div>
  )
}
