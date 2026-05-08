"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageCard } from "@/components/ui/image-card"
import { useEvents } from "@/hooks/events"
import { EventCardSkeleton } from "@/components/events/event-card-skeleton"
import type { LumaEvent } from "@/app/api/events/route"

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
        {startDate && (
          <div className="flex items-center gap-2 text-sm text-black/90 drop-shadow-md font-mono">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(startDate)}</span>
          </div>
        )}

        
      </ImageCard>
    </div>
  )
}

export function EventsPreview() {
  const { data: events = [], isLoading } = useEvents()

  const now = new Date()

  // Filter upcoming events, sorted by date (earliest first)
  const upcomingEvents = events
    .filter((event) => {
      if (!event.start_at) return false // Exclude events without dates
      const startDate = new Date(event.start_at)
      return startDate >= now
    })
    .sort((a, b) => {
      const dateA = a.start_at ? new Date(a.start_at).getTime() : 0
      const dateB = b.start_at ? new Date(b.start_at).getTime() : 0
      return dateA - dateB
    })

  // Filter past events, sorted by date (most recent first)
  const pastEvents = events
    .filter((event) => {
      if (!event.start_at) return false // Exclude events without dates
      const startDate = new Date(event.start_at)
      return startDate < now
    })
    .sort((a, b) => {
      const dateA = a.start_at ? new Date(a.start_at).getTime() : 0
      const dateB = b.start_at ? new Date(b.start_at).getTime() : 0
      return dateB - dateA // Most recent first
    })

  // Combine: take up to 3 upcoming events, fill remaining slots with past events
  // Ensure we always show up to 3 events total
  const maxEvents = 3
  const upcomingCount = Math.min(upcomingEvents.length, maxEvents)
  const pastCount = Math.max(0, maxEvents - upcomingCount)
  
  const displayEvents = [
    ...upcomingEvents.slice(0, upcomingCount),
    ...pastEvents.slice(0, pastCount)
  ]

  const hasUpcomingEvents = upcomingEvents.length > 0

  return (
       <section className="container mx-auto py-16 px-4 max-w-7xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-primary font-times font-normal">
            {hasUpcomingEvents ? "(Upcoming)" : "(Recent)"}
          </span> Events
        </h2>
        <Button asChild>
          <Link href="/events">
            <span className="hidden md:block">See all </span>Events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      ) : displayEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayEvents.map((event) => (
            <EventCard key={event.api_id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-secondary-gray">
          <p className="text-lg">No events available at the moment.</p>
        </div>
      )}
    </section>
  )
}

