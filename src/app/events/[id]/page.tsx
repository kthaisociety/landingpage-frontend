"use client"

import { useState, useEffect, useMemo, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarIcon, ArrowSquareOutIcon, ArrowLeftIcon, UserIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { useEvent } from "@/hooks/events"
import { EventDetailSkeleton } from "@/components/events/event-detail-skeleton"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [_isPending, startTransition] = useTransition()
  
  const [eventTextMask, setEventTextMask] = useState<string | undefined>(undefined)
  const { data: event, isLoading: loading, error: queryError } = useEvent(eventId)

  useEffect(() => {
    if (!event?.name) {
      return
    }

    const generateTextMask = () => {
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
      
      ctx.fillText(event.name, 50, 50)
      
      const dataUrl = canvas.toDataURL("image/png")
      startTransition(() => {
        setEventTextMask(dataUrl)
      })
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const callbackId = requestIdleCallback(generateTextMask, { timeout: 2000 })
      return () => cancelIdleCallback(callbackId)
    } else {
      const frameId = requestAnimationFrame(generateTextMask)
      return () => cancelAnimationFrame(frameId)
    }
  }, [event?.name, startTransition])

  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    []
  )

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    []
  )

  const { startDate, endDate, isPast, formattedStartDate, formattedEndTime, hostName } = useMemo(() => {
    if (!event) {
      return {
        startDate: null,
        endDate: null,
        isPast: false,
        formattedStartDate: null,
        formattedEndTime: null,
        hostName: null,
      }
    }

    const start = event.start_at ? new Date(event.start_at) : null
    const end = event.end_at ? new Date(event.end_at) : null
    const past = start ? start < new Date() : false
    
    return {
      startDate: start,
      endDate: end,
      isPast: past,
      formattedStartDate: start && event.start_at ? dateFormatter.format(start) : null,
      formattedEndTime: end && event.end_at ? timeFormatter.format(end) : null,
      hostName: event.host?.name || event.host?.display_name || event.host_profile?.name || null,
    }
  }, [event, dateFormatter, timeFormatter])

  if (loading) {
    return <EventDetailSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Empty>
          <EmptyHeader>
            <EmptyTitle className="text-destructive">Error: {error}</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant="outline">
              <Link href="/events">Back to Events</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (!event && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Event not found</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant="outline">
              <Link href="/events">Back to Events</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (!event) {
    return <EventDetailSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="relative bg-background text-foreground pt-64 pb-24 overflow-hidden">
        {/* Ascii Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid 
            color="var(--color-primary)" 
            cellSize={12} 
            logoSrc={eventTextMask}
            logoPosition="center"
            logoScale={0.6}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-muted via-background/50 to-transparent pointer-events-none" />
        </div>
        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 -ml-4"
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Button>

          {/* Status Badge */}
          {isPast && (
            <div className="mb-4">
              <Badge variant="default" className="font-mono capitalize">
                Past Event
              </Badge>
            </div>
          )}

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-base mb-6 tracking-tighter">
            {event.name}
          </h1>

          {/* Event Details */}
          <div className="flex flex-col gap-4 mb-8">
            {startDate && formattedStartDate && (
              <div className="flex items-center gap-2 md:text-md text-sm text-foreground/90 font-mono">
                <CalendarIcon className="size-5" />
                <span>{formattedStartDate}</span>
                {formattedEndTime && (
                  <span>
                    - {formattedEndTime}
                  </span>
                )}
                {event.duration_minutes && !endDate && (
                  <span>
                    ({Math.floor(event.duration_minutes / 60)}h {event.duration_minutes % 60}m)
                  </span>
                )}
              </div>
            )}

            {hostName && (
              <div className="flex items-center gap-2 md:text-md text-sm text-foreground/90 font-mono">
                <UserIcon className="size-5" />
                <span>Hosted by {hostName}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-card text-card-foreground rounded-none p-4 md:p-8 mb-24 shadow-lg ring-1 ring-foreground/10">
          <div className="container mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/events">Events</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate max-w-md">{event.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Event Description */}
          {(event.description || event.description_html) && (
            <div className="mb-8">
              <h2 className="text-xl font-base mb-4 text-foreground">About Event</h2>
                          {event.description_html ? (
                <div 
                  className="prose prose-lg max-w-none text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: event.description_html }}
                />
              ) : (
                <div 
                  className="prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: (event.description || "").replace(/\n/g, "<br />") 
                  }}
                />
              )}
            </div>
          )}
          
          {/* Show message if no description */}
          {!event.description && !event.description_html && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">About</h2>
              <p className="text-muted-foreground">No description available for this event.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            {event.url && (
              <Button variant="default" asChild>
                <Link href={event.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  View on Luma
                  <ArrowSquareOutIcon className="size-4" />
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/events">All Events</Link>
            </Button>
          </div>
        </div>
        </section>
      </div>
    </div>
  )
}
