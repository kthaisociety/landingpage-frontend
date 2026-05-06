"use client"

import { useEffect, useState } from "react"
import { cn } from "@/shared/lib/utils";

interface TextScrambleProps {
  children: string
  className?: string
  duration?: number
  speed?: number
  characterSet?: string
}

export function TextScramble({
  children,
  className,
  duration = 800,
  speed = 30,
  characterSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?",
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(children)

  useEffect(() => {
    let iteration = 0
    const totalIterations = duration / speed
    const originalText = children
    
    const interval = setInterval(() => {
      setDisplayText((_current) => {
        return originalText
          .split("")
          .map((char, index) => {
            if (index < (iteration / totalIterations) * originalText.length) {
              return originalText[index]
            }
            return characterSet[Math.floor(Math.random() * characterSet.length)]
          })
          .join("")
      })

      if (iteration >= totalIterations) {
        clearInterval(interval)
        setDisplayText(originalText)
      }
      
      iteration += 1
    }, speed)

    return () => clearInterval(interval)
  }, [children, duration, speed, characterSet])

  return (
    <span className={cn("inline-block font-mono", className)}>
      {displayText}
    </span>
  )
}




