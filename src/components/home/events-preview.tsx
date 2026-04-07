"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRightIcon, CalendarIcon, ArrowSquareOutIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/ui/fade-in"
import { ImageCard } from "@/components/ui/image-card"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { useEvents } from "@/hooks/events"
import { EventCardSkeleton } from "@/components/events/event-card-skeleton"
import type { LumaEvent } from "@/app/api/events/route"

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)

function EventCard({ event, featured = false }: { event: LumaEvent; featured?: boolean }) {
  const router = useRouter()
  const startDate = event.start_at ? new Date(event.start_at) : null
  const isPast = startDate ? startDate < new Date() : false

  return (
    <div
      onClick={() => router.push(`/events/${event.api_id}`)}
      className="cursor-pointer h-full"
    >
      <ImageCard
        image={event.cover_url || "/event-placeholder.jpg"}
        alt={event.name}
        blurHeight={featured ? "55%" : "50%"}
        aspectRatio={featured ? "aspect-[16/9]" : "aspect-[22/25]"}
        className="h-full"
        gradientColors={{
          from: "from-white/55",
          via: "via-white/50",
          to: "to-transparent",
        }}
        tags={isPast ? ["past"] : undefined}
      >
        <h3
          className={`font-base text-foreground drop-shadow-lg tracking-tight mb-3 ${
            featured ? "text-2xl md:text-3xl" : "text-2xl truncate"
          }`}
        >
          {event.name}
        </h3>

        {startDate && (
          <div className="flex items-center gap-2 text-sm text-foreground/90 drop-shadow-md font-mono mb-4">
            <CalendarIcon className="size-4 shrink-0" />
            <span className={featured ? "" : "truncate"}>{formatDate(startDate)}</span>
          </div>
        )}

        {event.url && (
          <div onClick={(e) => e.stopPropagation()}>
            <Button variant="default" size="sm" asChild>
              <Link href={event.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                {isPast ? "View on Luma" : "Sign up"}
                <ArrowSquareOutIcon className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </ImageCard>
    </div>
  )
}

export function EventsPreview() {
  const { data: events = [], isLoading } = useEvents()

  const now = new Date()

  const upcomingEvents = events
    .filter((e) => e.start_at && new Date(e.start_at) >= now)
    .sort((a, b) => new Date(a.start_at!).getTime() - new Date(b.start_at!).getTime())

  const pastEvents = events
    .filter((e) => e.start_at && new Date(e.start_at) < now)
    .sort((a, b) => new Date(b.start_at!).getTime() - new Date(a.start_at!).getTime())

  const upcomingCount = Math.min(upcomingEvents.length, 3)
  const pastCount = Math.max(0, 3 - upcomingCount)
  const displayEvents = [
    ...upcomingEvents.slice(0, upcomingCount),
    ...pastEvents.slice(0, pastCount),
  ]

  const hasUpcomingEvents = upcomingEvents.length > 0
  const [featuredEvent, ...secondaryEvents] = displayEvents

  return (
    <section className="container mx-auto py-20 px-4 max-w-7xl w-full">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          <span className="text-primary font-serif font-normal">
            {hasUpcomingEvents ? "(Upcoming)" : "(Recent)"}
          </span>{" "}
          Events
        </h2>
        <Button asChild>
          <Link href="/events">
            <span className="hidden md:block">See all </span>Events
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
      </FadeIn>

      <FadeIn delay={0.1}>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      ) : displayEvents.length > 0 ? (
        /* Featured-large + stacked-secondary */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {featuredEvent && (
            <div className="md:col-span-2">
              <EventCard event={featuredEvent} featured />
            </div>
          )}
          {secondaryEvents.length > 0 && (
            <div className="flex flex-col gap-6">
              {secondaryEvents.map((event) => (
                <EventCard key={event.api_id} event={event} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Empty className="border border-dashed border-border py-12">
          <EmptyHeader>
            <EmptyTitle>No events available</EmptyTitle>
            <EmptyDescription>
              There are no events at the moment. Check back soon for upcoming activities.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      </FadeIn>
    </section>
  )
}
