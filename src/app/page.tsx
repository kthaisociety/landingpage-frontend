import { Hero } from "@/widgets/hero";
import { EventsPreview } from "@/entities/events/events-preview";
import { ProjectsPreview } from "@/entities/projects/projects-preview";
// import { JobsPreview } from "@/entities/jobs/jobs-preview";
import { HistoryTimeline } from "@/widgets/history-timeline";
import { NewsletterSignup } from "@/features/newsletter/newsletter-signup";
// import { Homepage } from "@/components/home";

export const dynamic = "force-dynamic";
export const revalidate = 60; 


export default function Homepage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      {/* <JobsPreview /> */}
      <HistoryTimeline
        title="OUR HISTORY"
        introText="KTH AI Society has a rich history of building the AI community at KTH, bringing together students, industry leaders, and innovators to shape the future of artificial intelligence."
        defaultYear={2023}
      />
      <EventsPreview />

      <ProjectsPreview />
      <NewsletterSignup />
    </main>
  );
}

