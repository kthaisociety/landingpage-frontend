import type { Metadata } from "next"

import { NewsletterForm } from "./newsletter-form"

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Subscribe to KTH AI newsletter updates about events, projects, and community news.",
}

export default function NewsletterPage() {
  return <NewsletterForm />
}
