import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { NewsletterForm } from "@/app/newsletter/newsletter-form";

// fullScreen=false renders just the content block (no min-h-screen shell),
// for embedding in the admin "preview closed page" dialog — same source of
// truth as the real /apply page, so a preview can never drift from it.
// heading/message come from admin-configurable settings (see
// RecruitmentPeriodPanel); the CTA reuses the exact same "fat" Luma button
// as the homepage newsletter section for visual consistency.
export function ApplicationClosed({
  heading,
  message,
  fullScreen = true,
}: {
  heading: string;
  message: string;
  fullScreen?: boolean;
}) {
  const Heading = fullScreen ? "h1" : "p";

  const content = (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        <CheckCircle2 className="size-7" />
      </div>

      <div className="space-y-3">
        <Heading className="text-3xl font-bold tracking-tight text-secondary-black md:text-4xl">
          {heading}
        </Heading>
        <p className="mx-auto max-w-xl text-lg tracking-tight text-black/80 sm:text-xl">
          {message}
        </p>
      </div>

      <div className="pt-2">
        <NewsletterForm />
      </div>

      <Link
        href="/"
        className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Back to home
      </Link>
    </div>
  );

  if (!fullScreen) {
    return (
      <div className="mx-auto w-full max-w-2xl bg-white px-6 py-10 text-secondary-black">
        {content}
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 pt-24 pb-16 text-secondary-black sm:px-6">
      <div className="mx-auto w-full max-w-2xl">{content}</div>
    </main>
  );
}
