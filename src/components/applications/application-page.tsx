import Image from "next/image";
import { ApplicationForm } from "@/components/applications/application-form";

function ApplicationRecruitmentPoster() {
  return (
    <aside className="relative h-[42svh] min-h-[18rem] overflow-hidden bg-secondary-black sm:h-[48svh] lg:h-screen lg:min-h-screen">
      <Image
        src="/images/recruitment-post.png"
        alt="KTH AI Society recruitment is open"
        fill
        priority
        sizes="(min-width: 1024px) 52vw, 100vw"
        className="object-cover object-center"
      />
    </aside>
  );
}

export function ApplicationPage() {
  return (
    <main className="min-h-screen bg-white text-secondary-black lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:min-h-0 lg:grid-cols-[minmax(28rem,0.92fr)_minmax(0,1.08fr)]">
        <section className="order-2 flex flex-col px-4 pt-8 pb-10 sm:px-6 sm:pt-10 sm:pb-12 lg:order-1 lg:h-screen lg:min-h-0 lg:justify-center lg:px-10 lg:py-28 xl:px-14">
          <div className="mx-auto flex w-full max-w-xl flex-col lg:h-full lg:min-h-0 lg:max-w-[36rem]">
            <ApplicationForm />
          </div>
        </section>

        <div className="order-1 lg:order-2 lg:h-screen">
          <ApplicationRecruitmentPoster />
        </div>
      </div>
    </main>
  );
}
