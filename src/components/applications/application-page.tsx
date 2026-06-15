"use client";

import * as React from "react";
import Image from "next/image";
import { ApplicationForm } from "@/components/applications/application-form";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const carouselImages = [
  {
    src: "/images/application_carousel/1000006861 1.png",
    alt: "KTH AI Society members gathered at an event",
  },
  {
    src: "/images/application_carousel/20260129_NORRSKEN-Adrian-Pehrson-103 1.png",
    alt: "KTH AI Society event at Norrsken",
  },
  {
    src: "/images/application_carousel/Armada x AIS - Picture_3.png",
    alt: "KTH AI Society and Armada collaboration event",
  },
  {
    src: "/images/application_carousel/Ericcson_office 1.png",
    alt: "KTH AI Society visit at Ericsson office",
  },
  {
    src: "/images/application_carousel/FH_0147 1.png",
    alt: "KTH AI Society members in conversation",
  },
  {
    src: "/images/application_carousel/FVP_AIS.png",
    alt: "KTH AI Society workshop session",
  },
  {
    src: "/images/application_carousel/FVP_Hackathon.png",
    alt: "KTH AI Society hackathon participants",
  },
  {
    src: "/images/application_carousel/IMG_0769 1.png",
    alt: "KTH AI Society event audience",
  },
  {
    src: "/images/application_carousel/IMG_0888 1.png",
    alt: "KTH AI Society member at an event",
  },
  {
    src: "/images/application_carousel/IMG_7571 1.png",
    alt: "KTH AI Society speaker session",
  },
  {
    src: "/images/application_carousel/P3590366 1.png",
    alt: "KTH AI Society community event",
  },
  {
    src: "/images/application_carousel/P3590900 1.png",
    alt: "KTH AI Society panel or presentation",
  },
  {
    src: "/images/application_carousel/P3590987 3.png",
    alt: "KTH AI Society attendee portrait",
  },
  {
    src: "/images/application_carousel/Rectangle 103.png",
    alt: "KTH AI Society group activity",
  },
  {
    src: "/images/application_carousel/Rectangle 103_2.png",
    alt: "KTH AI Society members collaborating",
  },
  {
    src: "/images/application_carousel/Spring_Hackathon__Gustaf_Bergman-Ekstrom-4 1.png",
    alt: "KTH AI Society spring hackathon",
  },
  {
    src: "/images/application_carousel/antler.png",
    alt: "KTH AI Society event with Antler",
  },
  {
    src: "/images/application_carousel/nvidiagtc 2.png",
    alt: "KTH AI Society at NVIDIA GTC",
  },
];

function ApplicationCarousel() {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (!carouselApi) return;

    const updateCurrentSlide = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    updateCurrentSlide();
    carouselApi.on("select", updateCurrentSlide);
    carouselApi.on("reInit", updateCurrentSlide);

    return () => {
      carouselApi.off("select", updateCurrentSlide);
      carouselApi.off("reInit", updateCurrentSlide);
    };
  }, [carouselApi]);

  React.useEffect(() => {
    if (!carouselApi) return;

    const interval = window.setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0);
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [carouselApi]);

  return (
    <aside className="relative min-h-[28rem] overflow-hidden bg-secondary-black lg:sticky lg:top-0 lg:h-screen">
      <Carousel
        setApi={setCarouselApi}
        opts={{ align: "start", loop: true }}
        className="absolute inset-0"
        aria-label="KTH AI Society application highlights"
      >
        <CarouselContent className="h-[28rem] -ml-0 lg:h-screen">
          {carouselImages.map((image, index) => (
            <CarouselItem key={image.src} className="h-full pl-0">
              <div className="relative h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.68)),linear-gradient(90deg,rgba(0,0,0,0.32),rgba(0,0,0,0.04)_45%,rgba(0,0,0,0.42))]" />
        <CarouselPrevious className="left-5 z-20 hidden border-white/30 bg-black/25 text-white backdrop-blur-md hover:bg-white/20 hover:text-white disabled:opacity-30 sm:inline-flex" />
        <CarouselNext className="right-5 z-20 hidden border-white/30 bg-black/25 text-white backdrop-blur-md hover:bg-white/20 hover:text-white disabled:opacity-30 sm:inline-flex" />
      </Carousel>

      <div className="pointer-events-none relative z-10 flex min-h-[28rem] flex-col justify-end px-6 py-8 text-center sm:px-10 lg:h-full lg:px-14 lg:py-16">
        <div className="pointer-events-auto mx-auto flex max-w-full items-center justify-center gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-md">
          {carouselImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index}
              onClick={() => carouselApi?.scrollTo(index)}
              className="h-2.5 w-2.5 rounded-full bg-white/45 transition-all hover:bg-white aria-current:w-7 aria-current:bg-white"
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

export function ApplicationPage() {
  return (
    <main className="min-h-screen bg-white pt-24 text-secondary-black lg:pt-0">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section className="flex justify-center px-4 py-10 sm:px-6 lg:px-10 lg:pt-32 lg:pb-20">
          <div className="w-full max-w-2xl">
            <div className="mb-8 space-y-4">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Join KTH AI Society
              </h1>
            </div>

            <ApplicationForm />
          </div>
        </section>

        <ApplicationCarousel />
      </div>
    </main>
  );
}
