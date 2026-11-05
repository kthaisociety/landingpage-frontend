"use client";

import Link from "next/link";
import { useShowApplyCta } from "@/hooks/applications";
import { useHydrated } from "@/hooks/use-hydrated";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const SOCIAL_LINKS: FooterLink[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/kth-ai-society/",
    external: true,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/kthaisociety",
    external: true,
  },
  {
    label: "Github",
    href: "https://github.com/kthaisociety",
    external: true,
  },
  {
    label: "Medium",
    href: "https://medium.com/@kthaisociety",
    external: true,
  },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  { label: "Privacy & Cookies", href: "/legal/privacy-and-cookies" },
  { label: "Legal Notice", href: "/legal/legal-notice" },
  { label: "Documents", href: "/legal/documents" },
];

export function Footer() {
  const showApplyCta = useShowApplyCta();
  const isHydrated = useHydrated();
  const showApply = isHydrated && showApplyCta;

  const navigationLinks: FooterLink[] = [
    { label: "About", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "Projects", href: "/projects" },
    { label: "Job Board", href: "/business/jobs" },
    ...(showApply ? [{ label: "Apply", href: "/apply" }] : []),
    { label: "Contact", href: "/contact" },
    { label: "Login", href: "/member/login" },
  ];

  const sections: FooterSection[] = [
    { title: "Navigation", links: navigationLinks },
    { title: "Socials", links: SOCIAL_LINKS },
    { title: "Legal", links: LEGAL_LINKS },
  ];

  return (
    <footer className="relative w-full overflow-hidden font-mono">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/60">
                {section.title}
              </h3>
              <nav className="flex flex-col gap-3 text-sm">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-foreground/80 transition-colors hover:text-foreground"
                    {...(link.external && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="pointer-events-none absolute -bottom-20 left-1/2 -z-1 aspect-square max-h-[1500px] w-full -translate-x-1/2 overflow-hidden rounded-lg bg-muted opacity-30 md:top-20 md:w-auto">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full scale-160 object-cover brightness-101 saturate-0"
            >
              <source src="/videos/kth-spin.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        <div className="mt-16 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-foreground/60">
              © 2026 KTH AI Society. All rights reserved.
            </p>
            <p className="text-sm text-foreground/60">
              Building the future of AI at KTH
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
