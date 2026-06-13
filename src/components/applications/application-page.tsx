"use client";

import Image from "next/image";
import { ApplicationForm } from "@/components/applications/application-form";


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

        <aside className="relative min-h-[28rem] overflow-hidden bg-secondary-black lg:sticky lg:top-0 lg:h-screen">
          <Image
            src="/images/brand_assets/ais-symbol-white-outlines.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="scale-105 object-cover object-center blur-md"
          />
          <div className="relative z-10 flex min-h-[28rem] items-center justify-center px-6 py-10 text-center sm:px-10 lg:h-full lg:px-14 lg:py-16">
            <p className="max-w-2xl text-lg font-medium leading-8 text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] md:text-2xl md:leading-10">
            KTH AI Society is a student organisation cultivating the next generation of AI leaders.
            <br className="block my-4" />
            We grow AI literacy, bridge academia and industry, and share new insights through projects, research, and events. <br className="block my-4" /> Find your team and help build the community.
            </p>
         
          </div>
        </aside>
      </div>
    </main>
  );
}
