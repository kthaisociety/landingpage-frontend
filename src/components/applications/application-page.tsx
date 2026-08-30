"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { ApplicationForm } from "@/components/applications/application-form";
import { ApplicationDeadlineBanner } from "@/components/applications/application-deadline-banner";
import { ApplicationClosed } from "@/components/applications/application-closed";
import { useApplicationDeadlinePassed } from "@/components/applications/use-application-deadline-passed";
import { useApplicationSettings } from "@/hooks/applications";

function ApplicationRecruitmentPoster() {
  return (
    <aside className="relative h-[52svh] min-h-[24rem] overflow-hidden bg-secondary-black sm:h-[56svh] lg:mt-[8.75rem] lg:h-[calc(100svh-8.75rem)] lg:min-h-0">
      <Image
        src="/recruitment-post.png"
        alt="KTH AI Society recruitment is open"
        fill
        priority
        sizes="(min-width: 1024px) 52vw, 100vw"
        className="object-cover object-top lg:object-center"
      />
    </aside>
  );
}

function ApplicationSettingsLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white pt-24 text-secondary-black">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
    </main>
  );
}

export function ApplicationPage() {
  const { data: settings, isLoading, isError } = useApplicationSettings();
  const deadlineMs = settings ? new Date(settings.submission_deadline).getTime() : undefined;
  const deadlinePassed = useApplicationDeadlinePassed(deadlineMs);

  if (isLoading) {
    return <ApplicationSettingsLoading />;
  }

  // If the deadline itself failed to load, fail open — showing the form is
  // safer than silently locking every visitor out over a transient API blip.
  if (deadlinePassed && !isError && settings) {
    return (
      <ApplicationClosed heading={settings.closed_heading} message={settings.closed_message} />
    );
  }

  return (
    <>
      {deadlineMs !== undefined && <ApplicationDeadlineBanner deadlineMs={deadlineMs} />}
      <main className="min-h-screen bg-white pt-[8.75rem] text-secondary-black lg:h-screen lg:min-h-0 lg:overflow-hidden lg:pt-0">
        <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:min-h-0 lg:grid-cols-[minmax(28rem,0.92fr)_minmax(0,1.08fr)]">
          <section className="order-2 flex flex-col px-4 pt-8 pb-10 sm:px-6 sm:pt-10 sm:pb-12 lg:order-1 lg:h-screen lg:min-h-0 lg:justify-center lg:px-10 lg:pt-[9.75rem] lg:pb-28 xl:px-14">
            <div className="mx-auto flex w-full max-w-xl flex-col lg:h-full lg:min-h-0 lg:max-w-[36rem]">
              <ApplicationForm />
            </div>
          </section>

          <div className="order-1 lg:order-2">
            <ApplicationRecruitmentPoster />
          </div>
        </div>
      </main>
    </>
  );
}
