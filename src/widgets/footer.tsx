import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Navigation",
    links: [
      { label: "About", href: "/" },
      { label: "Events", href: "/events" },
      { label: "Projects", href: "/projects" },
      { label: "Job Board", href: "/business/jobs" },
      { label: "Contact", href: "mailto:contact@kthais.com" },
    ],
  },
  {
    title: "Socials",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/company/kth-ai-society/", external: true },
      { label: "Instagram", href: "https://instagram.com/kthaisociety", external: true },
      { label: "Github", href: "https://github.com/kthaisociety", external: true },
      { label: "Medium", href: "https://medium.com/@kthaisociety", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
      { label: "Privacy & Cookies", href: "/legal/privacy-and-cookies" },
      { label: "Legal Notice", href: "/legal/legal-notice" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden font-mono">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
                {section.title}
              </h3>
              <nav className="flex flex-col gap-3 text-sm">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-foreground/80 hover:text-foreground transition-colors"
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
            
            <div className="absolute left-1/2 -bottom-20 md:top-20 -translate-x-1/2 max-h-[1500px] w-full md:w-auto aspect-square rounded-lg overflow-hidden opacity-30 bg-muted pointer-events-none -z-1 ">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover scale-160 brightness-101 saturate-0 "
              >
                <source src="/videos/kth-spin.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground/60">
              © {new Date().getFullYear()} KTH AI Society. All rights reserved.
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

