"use client"

import { NewsletterForm } from "@/app/newsletter/newsletter-form"

export function NewsletterSignup() {
  return (
    <section className="flex min-h-[60vh] w-full items-center justify-center pb-12">
      <div className="container flex h-full flex-col items-center justify-center px-4 pt-20 pb-20 text-center md:px-6">
        <div className="w-full max-w-4xl space-y-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            <span className="font-times font-normal text-primary">(Newsletter)</span>{" "}
            Stay Updated
          </h2>

          <p className="mx-auto max-w-xl text-lg tracking-tight text-black/80 sm:text-xl">
            Join our newsletter to stay informed about upcoming events, new
            projects, and the latest AI community news.
          </p>

          <div className="pt-4">
            <div className="flex w-full justify-center text-left">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
