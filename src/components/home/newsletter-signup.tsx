"use client"

import { Separator } from "@/components/ui/separator"
import { FadeIn } from "@/components/ui/fade-in"
import { NewsletterForm } from "@/app/newsletter/newsletter-form"

export function NewsletterSignup() {
  return (
    <section className="flex w-full items-center justify-center py-24 pb-16">
      <div className="container flex h-full flex-col items-center justify-center px-4 text-center md:px-6">
        <FadeIn>
          <div className="w-full max-w-4xl space-y-6">
          <h2 className="text-4xl tracking-tighter text-foreground">
            <span className="font-serif text-primary">(Newsletter)</span>{" "}
            Updates
          </h2>

          <p className="mx-auto max-w-xl text-lg tracking-tight text-muted-foreground sm:text-xl">
            Stay informed about upcoming events, new projects, and the latest
            AI community news from KTH.
          </p>

          <div className="mx-auto w-16">
            <Separator className="bg-primary/30" />
          </div>

          <div className="pt-4">
            <div className="text-left w-full flex justify-center">
              <NewsletterForm />
            </div>
          </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
