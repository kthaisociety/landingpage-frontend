"use client"

import { NewsletterForm } from "@/app/newsletter/newsletter-form"

export function NewsletterSignup() {
  return (
    <section className="flex min-h-[60vh] w-full items-center justify-center pb-12">
      <div className="container flex h-full flex-col items-center justify-center px-4 pt-20 pb-20 text-center md:px-6">
        <div className="w-full max-w-4xl space-y-6">
          <h2 className="bg-clip-text text-4xl tracking-tighter text-black">
            Stay Updated
            <span className="ml-2 font-serif text-[#1954A6]">
              (Newsletter)
            </span>
          </h2>

          <p className="mx-auto max-w-xl text-lg tracking-tight text-black/80 sm:text-xl">
            Join our newsletter to stay informed about upcoming events, new
            projects, and the latest AI community news.
          </p>

          <div className=" pt-4">
            <div className="text-left w-full flex justify-center">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
