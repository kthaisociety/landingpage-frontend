import { Hero } from "./hero"
import { EventsPreview } from "./events-preview"
import { ProjectsPreview } from "./projects-preview"
import { JobsPreview } from "./jobs-preview"
import { HistoryTimeline } from "./history-timeline"
import { NewsletterSignup } from "./newsletter-signup"
import { CollaboratorsCarousel } from "./collaborators-carousel"
import { Mini2048 } from "./mini-2048"

export function Homepage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <CollaboratorsCarousel />
      <JobsPreview />
      <HistoryTimeline
        title="OUR HISTORY"
        introText="KTH AI Society has a rich history of building the AI community at KTH, bringing together students, industry leaders, and innovators to shape the future of artificial intelligence."
        defaultYear={2023}
      />
      <EventsPreview />

      <ProjectsPreview />
      <NewsletterSignup />
      <Mini2048 />
    </main>
  )
}
