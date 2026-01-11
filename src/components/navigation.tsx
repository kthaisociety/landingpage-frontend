"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { TextMorph } from "@/components/ui/text-morph";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Change to "AIS" when scrolled more than 50px
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Prevent body scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Dimmed overlay when mobile menu is open */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <nav
        className="fixed top-0 left-0 right-0 z-50 select-none"
      >
        {/* Always present progressive blur background */}
        <ProgressiveBlur
          className="pointer-events-none absolute top-0 left-0 w-full z-10"
          height="150%"
          position="top"
        />
        <div className="absolute top-0 left-0 h-[120%] w-full bg-linear-to-b from-white/60 via-white/50 to-white/0 pointer-events-none"></div>
        
        {/* Solid white overlay that fades in when menu opens */}
        <motion.div
          initial={false}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute top-0 left-0 h-full w-full bg-white pointer-events-none"
        />
        
        <div className="max-w-7xl mx-auto py-6 px-6 relative z-50">
        <div className="flex items-center justify-between">
          {/* Left side: Logo + Text */}
          <Link href="/">
            <div className="flex items-center gap-2">
              {/* AI Logo SVG */}
              <Image
                src="/kthais-logo.svg"
                alt="KTH AIS Logo"
                width={40}
                height={40}
                className="h-8 w-8"
              />

              {/* Text with morph animation */}
              <TextMorph
                as="span"
                className="text-3xl  tracking-tight text-foreground"
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 10,
                  mass: 0.3,
                }}
              >
                {isScrolled ? "KTH AIS" : "KTH AI Society"}
              </TextMorph>
            </div>
          </Link>
          {/* Right side: Navigation Links - Desktop */}
          <div className="items-center gap-6 hidden md:flex">
            <Link
              href="/"
              className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/events"
              className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Events
            </Link>
            <Link
              href="/projects"
              className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/business/jobs"
              className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Job Board
            </Link>
            <Link
              href="/newsletter"
              className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Newsletter
            </Link>
            <Link
              href="mailto:contact@kthais.com"
              className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-foreground hover:text-foreground/80 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

        {/* Mobile Menu - Expands from top */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ 
                height: "auto",
                transition: { 
                  duration: 0.4, 
                  ease: [0.25, 0.1, 0.25, 1],
                }
              }}
              exit={{ 
                height: 0,
                transition: { 
                  duration: 0.3, 
                  ease: [0.25, 0.1, 0.25, 1],
                }
              }}
              className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-6 pt-18 pb-2">
                <Link
                  href="/"
                  className="block py-3 text-base font-normal text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/events"
                  className="block py-3 text-base font-normal text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Events
                </Link>
                <Link
                  href="/projects"
                  className="block py-3 text-base font-normal text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Projects
                </Link>
                <Link
                  href="/business/jobs"
                  className="block py-3 text-base font-normal text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Job Board
                </Link>
                <Link
                  href="/newsletter"
                  className="block py-3 text-base font-normal text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Newsletter
                </Link>
                <Link
                  href="mailto:contact@kthais.com"
                  className="block py-3 text-base font-normal text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
