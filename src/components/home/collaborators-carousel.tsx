"use client"

import Image from "next/image"
import AutoScroll from "embla-carousel-auto-scroll"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

interface Collaborator {
  id: string
  name: string
  image: string
}

const collaborators: Collaborator[] = [
  { id: "mannheimer-swartling", name: "Mannheimer Swartling", image: "/partners/mannheimer-swartling.png" },
  { id: "lovable", name: "Lovable", image: "/partners/lovable.png" },
  { id: "kinnevik", name: "Kinnevik", image: "/partners/kinnevik.png" },
  { id: "jane-street", name: "Jane Street", image: "/partners/jane-street.png" },
  { id: "google", name: "Google", image: "/partners/google.png" },
  { id: "microsoft", name: "Microsoft", image: "/partners/microsoft.png" },
  { id: "florent-venture-partners", name: "Florent Venture Partners", image: "/partners/florent-venture-partners.jpeg" },
  { id: "ericsson", name: "Ericsson", image: "/partners/ericsson.png" },
  { id: "legora", name: "Legora", image: "/partners/legora.webp" },
  { id: "bcg-x", name: "BCG X", image: "/partners/bcg-x.jpg" },
  { id: "a16z", name: "a16z", image: "/partners/a16z.png" },
  { id: "accel", name: "Accel", image: "/partners/accel.png" },
  { id: "modulai", name: "Modulai", image: "/partners/modulai.png" },
  { id: "norrsken", name: "Norrsken", image: "/partners/norrsken.png" },
  { id: "pareto", name: "Pareto", image: "/partners/pareto.webp" },
  { id: "antler", name: "Antler", image: "/partners/antler.svg" },
  { id: "gilion", name: "Gilion", image: "/partners/gilion.png" },
  { id: "eqt-ventures", name: "EQT Ventures", image: "/partners/eqt-ventures.png" },
]

export function CollaboratorsCarousel() {
  return (
    <section id="collaborators" className="py-16 md:py-24">
      <div className="container mx-auto flex max-w-7xl flex-col items-center text-center px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          <span className="font-times font-normal text-primary">(Our)</span> Collaborators
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg tracking-tight text-black/80 sm:text-xl">
          Selection of companies that we have partnered with during the years.
        </p>
      </div>

      <div className="pt-10 md:pt-14">
        <div className="relative mx-auto flex items-center justify-center px-4 md:px-6 lg:max-w-5xl">
          <Carousel
            opts={{ loop: true }}
            plugins={[AutoScroll({ playOnInit: true, stopOnInteraction: false })]}
          >
            <CarouselContent className="ml-0">
              {collaborators.map((collaborator) => (
                <CarouselItem
                  key={collaborator.id}
                  className="flex basis-1/2 justify-center pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <div className="flex h-24 w-full max-w-40 shrink-0 items-center justify-center rounded-xl border bg-white p-4 shadow-sm">
                    <Image
                      src={collaborator.image}
                      alt={collaborator.name}
                      width={160}
                      height={64}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-background to-transparent" />
          <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent" />
        </div>
      </div>
    </section>
  )
}
