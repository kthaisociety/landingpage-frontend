"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { ImageCard } from "@/components/ui/image-card"
import { useEvents } from "@/hooks/events"
import { EventsSkeleton } from "@/components/events/event-card-skeleton"
import type { LumaEvent } from "@/app/api/events/route"

type EventFilter = "all" | "upcoming" | "past"

function EventCard({ event }: { event: LumaEvent }) {
  const router = useRouter()
  const startDate = event.start_at ? new Date(event.start_at) : null
  const isPast = startDate ? startDate < new Date() : false

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  const handleCardClick = () => {
    router.push(`/events/${event.api_id}`)
  }

  return (
    <div onClick={handleCardClick} className="cursor-pointer">
      <ImageCard
        image={event.cover_url || "/event-placeholder.jpg"}
        alt={event.name}
        blurHeight="50%"
        className="relative"
        gradientColors={{
          from: "from-white/55",
          via: "via-white/50",
          to: "to-transparent",
        }}
        tags={isPast ? ["past"] : undefined}
      >
        {/* Title */}
        <h3 className="text-2xl font-base text-secondary-black mb-3 drop-shadow-lg tracking-tight truncate">
          {event.name}
        </h3>

        {/* Date */}
        <div className="flex flex-col gap-2">
          {startDate && (
            <div className="flex items-center gap-2 text-sm text-black/90 drop-shadow-md font-mono">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(startDate)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {event.url && (
        <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="default"
              asChild
            >
              <Link href={event.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                {isPast ? "View on Luma" : "Sign up"}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          )}
      </ImageCard>
    </div>
  )
}

export default function EventsPage() {
  const [eventsTextMask, setEventsTextMask] = useState<string | undefined>(undefined)
  const [selectedFilter, setSelectedFilter] = useState<EventFilter>("all")
  const { data: events = [], isLoading: loading, error: queryError } = useEvents()

  useEffect(() => {
    // Create a canvas-based text mask for "EVENTS"
    const canvas = document.createElement("canvas")
    canvas.width = 1200
    canvas.height = 400
    const ctx = canvas.getContext("2d")
    
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    
    const text = "EVENTS"
    ctx.fillText(text, 50, 50)
    
    const dataUrl = canvas.toDataURL("image/png")
    setEventsTextMask(dataUrl)
  }, [])

  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null

  const filteredEvents = events.filter((event) => {
    if (selectedFilter === "all") return true
    
    const startDate = event.start_at ? new Date(event.start_at) : null
    const isPast = startDate ? startDate < new Date() : false
    
    if (selectedFilter === "past") return isPast
    if (selectedFilter === "upcoming") return !isPast
    
    return true
  })

  // Sort events: upcoming first, then past (most recent first)
  // Calculate "now" once per render to avoid impure function during render
  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), [])
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = a.start_at ? new Date(a.start_at).getTime() : 0
    const dateB = b.start_at ? new Date(b.start_at).getTime() : 0
    
    const aIsPast = dateA < now
    const bIsPast = dateB < now
    
    // Upcoming events first
    if (!aIsPast && bIsPast) return -1
    if (aIsPast && !bIsPast) return 1
    
    // For same category, sort by date (upcoming: earliest first, past: most recent first)
    if (!aIsPast && !bIsPast) return dateA - dateB
    return dateB - dateA
  })

  const getFilterLabel = (filter: EventFilter): string => {
    switch (filter) {
      case "all":
        return "All events"
      case "upcoming":
        return "Upcoming"
      case "past":
        return "Past"
      default:
        return "All events"
    }
  }

  return (
    <div className="min-h-screen">
      {/* Dark Blue Header Section */}
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        {/* Ascii Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid 
            color="rgba(0, 0, 0, 0.2)" 
            cellSize={12} 
            logoSrc={eventsTextMask}
            logoPosition="center"
            logoScale={0.6}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>
        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          {/* Main Title */}
          <h4 className="text-3xl mb-2 tracking-tighter">
            <span className="font-serif font-normal text-primary">(Featured)</span> Gatherings
          </h4>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
            Events
          </h1>

        </div>
      </section>

      {/* White Content Area */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 mb-24 shadow-lg border">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <div>
                <Link href="/" className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium">
                  Home
                </Link>
                <span className="text-gray-300 mx-2">/</span>
                <span className="text-primary font-medium text-sm">Events</span>
              </div>
              <p className="text-lg md:text-xl max-w-2xl opacity-95 leading-relaxed font-serif">
                Discover upcoming events and browse past gatherings from our community.
              </p>
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {getFilterLabel(selectedFilter)}
                  <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="min-w-[220px]">
                <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                  All events
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("upcoming")}>
                  Upcoming
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("past")}>
                  Past
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Events Grid */}
          {loading ? (
            <EventsSkeleton />
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-lg">Error: {error}</p>
            </div>
          ) : sortedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {sortedEvents.map((event) => (
                <EventCard key={event.api_id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-secondary-gray">
              <p className="text-lg">No events found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}


