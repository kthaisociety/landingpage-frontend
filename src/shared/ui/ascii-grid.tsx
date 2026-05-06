"use client"

import { useEffect, useRef } from "react"

interface AsciiGridProps {
  className?: string
  color?: string
  cellSize?: number
  logoSrc?: string
  logoPosition?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
  logoScale?: number
  enableDripping?: boolean
}

export function AsciiGrid({ 
  className, 
  color = "#1954A6",
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
          
          // Calculate position based on logoPosition prop
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
            case "center":
            default:
              x = (canvas.width - w) / 2
              y = (canvas.height - h) / 2
              break
          }
          
          maskCtx.drawImage(img, x, y, w, h)
          maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height).data
          maskWidth = canvas.width
          maskHeight = canvas.height
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
                  
                  // Calculate position based on logoPosition prop
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
                    case "center":
                    default:
                      x = (canvas.width - w) / 2
                      y = (canvas.height - h) / 2
                      break
                  }
                  
                  maskCtx.drawImage(img, x, y, w, h)
                  maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height).data
                  maskWidth = canvas.width
                  maskHeight = canvas.height
                }
             }
        }
      }
    }

    window.addEventListener("resize", resize)
    resize()
    
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
    const piDigits = "31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632788659361533818279682303019520353018529689957736225994138912497217752834791315155748572424541506959508295331168617278558890750983817546374649393192550604009277016711390098488240128583616035637076601047101819429555961989467678374494482553797747268471040475346462080466842590694912933136770289891521047521620569660240580381501935112533824300355876402474964732639141992726042699227967823547816360093417216412199245863150302861829745557067498385054945885869269956909272107975093029553211653449872027559602364806654991198818347977535663698074265425278625518184175746728909777727938000816470600161452491921732172147723501414419735685481613611573525521334757418494684385233239073941433345477624168625189835694855620992192221842725502542568876717904946016534668049886272327917860857843838279679766814541009538837863609506800642251252051173929848960841284886269456042419652850222106611863067442786220391949450471237137869609563643719172874677646575739624138908658326459958133904780275900994657640789512694683983525957098258226205224894077267194782684826014769909026401363944374553050682034962524517493996514314298091906592509372216964615157098583874105978859597729754989301617539284681382686838689427741559918559252459539594310499725246808459872736446958486538367362226260991246080512438843904512441365497627807977156914359977001296160894416948685558484063534220722258284886481584560285060168427394522674676788952521385225499546667278239864565961163548862305774564980355936345681743241125150760694794510965960940252288797108931456691368672287489405601015033086179286809208747609178249385890097149096759852613655497818931297848216829989487226588048575640142704775551323796414515237462343645428584447952658678210511413547357395231134271661021359695362314429524849371871101457654035902799344037420073105785390621983874478084784896833214457138687519435064302184531910484810053706146806749192781911979399520614196634287544406437451237181921799983910159195618146751426912397489409071864942319615679452080951465502252316038819301420937621378559566389377870830390697920773467221825625996615014215030680384477345492026054146659252014974428507325186660021324340881907104863317346496514539057962685610055081066587969981635747363840525714591028970641401109712062804390397595156771577004203378699360072305587631763594218731251471205329281918261861258673215791984148488291644706095752706957220917567116722910981690915280173506712748583222871835209353965725121083579151369882091444210067510334671103" 

    const render = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const isRevealing = elapsed < revealDuration
      
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)
      
      ctx.font = `${cellSize}px monospace`
      ctx.fillStyle = color
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
