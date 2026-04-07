"use client"

import { useEffect, useRef } from "react"

interface AsciiGridProps {
  className?: string
  color?: string
  cellSize?: number
  logoSrc?: string
  logoPosition?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "right"
  logoScale?: number
  enableDripping?: boolean
}

export function AsciiGrid({ 
  className, 
  color = "var(--color-primary)",
  cellSize = 16,
  logoSrc,
  logoPosition = "center",
  logoScale = 0.6,
  enableDripping = true
}: AsciiGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    const startTime = Date.now()
    
    // Mouse tracking
    const mouse = { x: -1000, y: -1000 } // Start off-screen
    const mouseRadius = 40 // Smaller radius of mouse effect in pixels
    
    // Mask data
    let maskData: Uint8ClampedArray | null = null
    let maskWidth = 0
    let maskHeight = 0

    // Initial reveal animation - track which cells have appeared
    const revealMap = new Map<string, number>()
    const revealDuration = 2000 // 2 seconds for initial reveal
    
    // Dripping animation - track drip columns
    interface Drip {
      col: number
      startRow: number
      currentRow: number
      speed: number
      intensity: number
      lastUpdate: number
    }
    const drips: Drip[] = []
    
    // Initialize some drips
    const initDrips = (cols: number) => {
      if (!enableDripping) return
      const numDrips = Math.floor(cols / 16) // One drip every 16 columns (half as often)
      for (let i = 0; i < numDrips; i += 1) {
        drips.push({
          col: Math.floor(Math.random() * cols),
          startRow: -5,
          currentRow: -5,
          speed: 0.1 + Math.random() * 0.1, // Much slower: 0.1-0.2 rows per frame
          intensity: 0.6 + Math.random() * 0.4,
          lastUpdate: Date.now()
        })
      }
    }

    // Load logo if provided
    if (logoSrc) {
      const img = new Image()
      img.src = logoSrc
      img.onload = () => {
        const maskCanvas = document.createElement("canvas")
        maskCanvas.width = canvas.width
        maskCanvas.height = canvas.height
        const maskCtx = maskCanvas.getContext("2d")
        if (maskCtx) {
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * logoScale
          const w = img.width * scale
          const h = img.height * scale
          
          let x: number, y: number
          switch (logoPosition) {
            case "top-left":
              x = canvas.width * 0.05
              y = canvas.height * 0.05
              break
            case "top-right":
              x = canvas.width - w - canvas.width * 0.05
              y = canvas.height * 0.05
              break
            case "bottom-left":
              x = canvas.width * 0.05
              y = canvas.height - h - canvas.height * 0.05
              break
            case "bottom-right":
              x = canvas.width - w - canvas.width * 0.05
              y = canvas.height - h - canvas.height * 0.05
              break
            case "right":
              x = canvas.width * 0.5 + (canvas.width * 0.5 - w) / 2
              y = (canvas.height - h) / 2
              break
            case "center":
            default:
              x = (canvas.width - w) / 2
              y = (canvas.height - h) / 2
              break
          }
          
          if (canvas.width > 0 && canvas.height > 0) {
            maskCtx.drawImage(img, x, y, w, h)
            maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height).data
            maskWidth = canvas.width
            maskHeight = canvas.height
          }
        }
      }
    }

    // Resize handler
    const resize = () => {
      const parent = canvas.parentElement
      if (parent) {
        const dpr = window.devicePixelRatio || 1
        canvas.width = parent.clientWidth * dpr
        canvas.height = parent.clientHeight * dpr
        ctx.scale(dpr, dpr)
        
        // Reinitialize drips on resize
        drips.length = 0
        const cols = Math.ceil(canvas.clientWidth / cellSize)
        initDrips(cols)
        
        if (logoSrc) {
          const img = new Image()
          img.src = logoSrc
          img.onload = () => {
            const maskCanvas = document.createElement("canvas")
            maskCanvas.width = canvas.width
            maskCanvas.height = canvas.height
            const maskCtx = maskCanvas.getContext("2d")
            if (maskCtx) {
              const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * logoScale
              const w = img.width * scale
              const h = img.height * scale
              
              let x: number, y: number
              switch (logoPosition) {
                case "top-left":
                  x = canvas.width * 0.05
                  y = canvas.height * 0.05
                  break
                case "top-right":
                  x = canvas.width - w - canvas.width * 0.05
                  y = canvas.height * 0.05
                  break
                case "bottom-left":
                  x = canvas.width * 0.05
                  y = canvas.height - h - canvas.height * 0.05
                  break
                case "bottom-right":
                  x = canvas.width - w - canvas.width * 0.05
                  y = canvas.height - h - canvas.height * 0.05
                  break
                case "right":
                  x = canvas.width * 0.5 + (canvas.width * 0.5 - w) / 2
                  y = (canvas.height - h) / 2
                  break
                case "center":
                default:
                  x = (canvas.width - w) / 2
                  y = (canvas.height - h) / 2
                  break
              }
              
              if (canvas.width > 0 && canvas.height > 0) {
                maskCtx.drawImage(img, x, y, w, h)
                maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height).data
                maskWidth = canvas.width
                maskHeight = canvas.height
              }
            }
          }
        }
      }
    }

    window.addEventListener("resize", resize)
    // Defer the initial resize to the next paint so the canvas parent has
    // real layout dimensions (avoids a 0×0 canvas when the component mounts
    // before the browser has finished its first layout pass).
    const initFrameId = requestAnimationFrame(resize)
    
    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    
    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }
    
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    // Pi digits in order (10,000 digits to minimize repetition)
    const piDigits = "3141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930381964428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273724587006606315588174881520920962829254091715364367892590360011330530548820466521384146951941511609433057270365759591953092186117381932611793105118548074462379962749567351885752724891227938183011949129833673362440656643086021394946395224737190702179860943702770539217176293176752384674818467669405132000568127145263560827785771342757789609173637178721468440901224953430146549585371050792279689258923542019956112129021960864034418159813629774771309960518707211349999998372978049951059731732816096318595024459455346908302642522308253344685035261931188171010003137838752886587533208381420617177669147303598253490428755468731159562863882353787593751957781857780532171226806613001927876611195909216420198938095257201065485863278865936153381827968230301952035301852968995773622599413891249721775283479131515574857242454150695950829533116861727855889075098381754637464939319255060400927701671139009848824012858361603563707660104710181942955596198946767837449448255379774726847104047534646208046684259069491293313677028989152104752162056966024058038150193511253382430035587640247496473263914199272604269922796782354781636009341721641219924586315030286182974555706749838505494588586926995690927210797509302955321165344987202755960236480665499119881834797753566369807426542527862551818417574672890977772793800081647060016145249192173217214772350141441973568548161361157352552133475741849468438523323907394143334547762416862518983569485562099219222184272550254256887671790494601653466804988627232791786085784383827967976681454100953883786360950680064225125205117392984896084128488626945604241965285022210661186306744278622039194945047123713786960956364371917287467764657573962413890865832"

    const render = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const isRevealing = elapsed < revealDuration
      
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)
      
      ctx.font = `${cellSize}px monospace`
      // Resolve CSS custom properties (e.g. var(--color-primary)) to
      // actual color values the canvas API can use.
      let resolvedColor = color
      if (color.startsWith("var(")) {
        const varName = color.replace(/^var\(\s*/, "").replace(/\s*\)$/, "")
        const computed = getComputedStyle(canvas).getPropertyValue(varName).trim()
        if (computed) resolvedColor = computed
      }
      ctx.fillStyle = resolvedColor
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const cols = Math.ceil(width / cellSize)
      const rows = Math.ceil(height / cellSize)

      // Update drips
      if (enableDripping) {
        drips.forEach(drip => {
          drip.currentRow += drip.speed
          
          // Reset drip when it goes off screen
          if (drip.currentRow > rows + 5) {
            drip.col = Math.floor(Math.random() * cols)
            drip.currentRow = -5
            drip.speed = 0.1 + Math.random() * 0.1 // Match slower speed
            drip.intensity = 0.6 + Math.random() * 0.4
          }
        })
      }

      for (let i = 0; i < rows; i += 1) {
        for (let j = 0; j < cols; j += 1) {
          const x = j * cellSize + cellSize / 2
          const y = i * cellSize + cellSize / 2
          
          // Check mask
          let inLogo = false
          if (maskData) {
            const px = Math.floor(x * (canvas.width / canvas.clientWidth))
            const py = Math.floor(y * (canvas.height / canvas.clientHeight))
            if (px >= 0 && px < maskWidth && py >= 0 && py < maskHeight) {
              const index = (py * maskWidth + px) * 4
              if (maskData[index + 3] > 50) {
                inLogo = true
              }
            }
          }

          // Base opacity
          let opacity = inLogo ? 0.7 : 0.15
          
          // Check if this cell is part of a drip
          if (enableDripping) {
            for (const drip of drips) {
              if (drip.col === j) {
                const distanceFromDrip = i - drip.currentRow
                // Create a trail effect
                if (distanceFromDrip >= -2 && distanceFromDrip <= 8) {
                  // Brightest at the drip head, fading behind
                  const dripOpacity = distanceFromDrip <= 0 
                    ? drip.intensity 
                    : drip.intensity * Math.max(0, 1 - distanceFromDrip / 8)
                  opacity = Math.max(opacity, dripOpacity)
                }
              }
            }
          }
          
          // Mouse proximity effect - random scattered lighting, more centered
          const dx = x - mouse.x
          const dy = y - mouse.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          let isMouseHighlighted = false
          
          if (distance < mouseRadius) {
            // Use cell position to generate a stable random value for this cell
            const cellRandom = Math.abs(Math.sin(i * 7.919 + j * 13.371))
            
            // Higher chance to light up, more centered
            const proximityFactor = 1 - (distance / mouseRadius)
            const lightUpChance = 0.5 + proximityFactor * 0.4 // 50-90% chance based on distance
            
            if (cellRandom < lightUpChance) {
              // Less random intensity variation
              const intensityRandom = Math.abs(Math.sin(i * 3.141 + j * 2.718))
              const mouseOpacity = 0.6 + intensityRandom * 0.4 // Range from 0.6 to 1.0
              opacity = Math.max(opacity, mouseOpacity)
              isMouseHighlighted = true
            }
          }
          
          // Initial reveal animation
          let revealOpacity = 1
          if (isRevealing) {
            const cellKey = `${i}-${j}`
            if (!revealMap.has(cellKey)) {
              // Randomly assign a reveal time for this cell
              const revealTime = Math.random() * revealDuration * 0.8 // Most appear in first 80%
              revealMap.set(cellKey, revealTime)
            }
            const cellRevealTime = revealMap.get(cellKey)!
            if (elapsed < cellRevealTime) {
              revealOpacity = 0
            } else {
              // Quick fade in over 200ms
              const fadeProgress = Math.min(1, (elapsed - cellRevealTime) / 200)
              revealOpacity = fadeProgress
            }
          }
          
          opacity *= revealOpacity
          
          if (opacity > 0.05) {
            ctx.globalAlpha = opacity
            
            // Use 6 or 7 for mouse-highlighted cells, otherwise use pi digits
            let char: string
            if (isMouseHighlighted) {
              // Use cell position to deterministically choose between 6 and 7
              const highlightIndex = (i * cols + j) % 2
              char = highlightIndex === 0 ? "6" : "7"
            } else {
              // Use pi digits in order based on cell position
              const piIndex = (i * cols + j) % piDigits.length
              char = piDigits[piIndex]
            }
            
            ctx.fillText(char, x, y)
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(initFrameId)
      cancelAnimationFrame(animationFrameId)
    }
  }, [color, cellSize, logoSrc, logoPosition, logoScale, enableDripping])

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
    />
  )
}
