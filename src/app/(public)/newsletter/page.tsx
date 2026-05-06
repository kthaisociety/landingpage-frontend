import type { Metadata } from "next"

import { NewsletterForm } from "@/features/newsletter/newsletter-form"

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Subscribe to KTH AI newsletter updates about events, projects, and community news.",
}

export default function NewsletterPage() {
  return <NewsletterForm variant="page" />
}
