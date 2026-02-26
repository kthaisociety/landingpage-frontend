"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLogoutMutation } from "@/lib/apis/internal-apis";
import { useAppSelector } from "@/lib/store/store";

import { TextMorph } from "@/components/ui/text-morph";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const user = useAppSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMobileMenuToggle = () => setIsMobileMenuOpen((prev) => !prev);
  const handleMobileLinkClick = () => setIsMobileMenuOpen(false);
  const handleOverlayClick = () => setIsMobileMenuOpen(false);
  const handleProfileDropdownToggle = () => setIsProfileOpen((prev) => !prev);

  const handleProfileClick = () => {
    router.push("/member/dashboard");
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleAdminDashboardClick = () => {
    router.push("/member/admin");
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = async () => {
    try {
      await logout(undefined).unwrap();
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const renderLogo = () => (
    <Link href="/">
      <div className="flex items-center gap-2">
        <Image src="/kthais-logo.svg" alt="KTH AIS Logo" width={40} height={40} className="h-8 w-8" />
        <TextMorph as="span" className="text-3xl tracking-tight text-foreground" transition={{ type: "spring", stiffness: 150, damping: 10, mass: 0.3 }}>
          {isScrolled ? "KTH AIS" : "KTH AI Society"}
        </TextMorph>
      </div>
    </Link>
  );

  const renderAuthDropdown = () => {
    if (!isLoggedIn || !user) {
      return <Link href="/contact" className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors">Contact</Link>;
    }

    return (
      <div className="relative" ref={profileRef}>
        <button onClick={handleProfileDropdownToggle} className="flex items-center gap-2 text-md font-medium text-foreground/80 hover:text-foreground transition-colors focus:outline-none">
          {user.name}
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isProfileOpen && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm font-semibold truncate">{user.name}</p>
              </div>
              <button onClick={handleProfileClick} className="w-full text-left px-4 py-2.5 text-sm text-foreground/80 hover:bg-gray-50 hover:text-foreground flex items-center gap-2 transition-colors">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </button>
              {user.role === "admin" && (
                <button onClick={handleAdminDashboardClick} className="w-full text-left px-4 py-2.5 text-sm text-foreground/80 hover:bg-gray-50 hover:text-foreground flex items-center gap-2 transition-colors">
                  < User className="h-4 w-4" /> Admin
                </button>
              )}
              <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-50">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderDesktopNav = () => (
    <div className="items-center gap-6 hidden md:flex">
      <Link href="/" className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors">About</Link>
      <Link href="/events" className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors">Events</Link>
      <Link href="/projects" className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors">Projects</Link>
      <Link href="/business/jobs" className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors">Job Board</Link>
      <Link href="/newsletter" className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors">Newsletter</Link>
      {renderAuthDropdown()}
    </div>
  );

  const renderMobileNav = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto", transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }} exit={{ height: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }} className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 pt-18 pb-6 flex flex-col gap-1">
            <Link href="/" className="block py-3 text-base text-foreground/70 hover:text-foreground" onClick={handleMobileLinkClick}>About</Link>
            <Link href="/events" className="block py-3 text-base text-foreground/70 hover:text-foreground" onClick={handleMobileLinkClick}>Events</Link>
            <Link href="/projects" className="block py-3 text-base text-foreground/70 hover:text-foreground" onClick={handleMobileLinkClick}>Projects</Link>
            <Link href="/business/jobs" className="block py-3 text-base text-foreground/70 hover:text-foreground" onClick={handleMobileLinkClick}>Job Board</Link>
            <Link href="/newsletter" className="block py-3 text-base text-foreground/70 hover:text-foreground" onClick={handleMobileLinkClick}>Newsletter</Link>

            {!isLoggedIn && (
              <Link href="mailto:contact@kthais.com" className="block py-3 text-base text-foreground/70 hover:text-foreground" onClick={handleMobileLinkClick}>Contact</Link>
            )}

            {isLoggedIn && user && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="px-2 mb-2"><p className="text-xs text-muted-foreground uppercase font-semibold">Account</p></div>
                <Button variant="ghost" className="w-full justify-start pl-0 text-base font-medium hover:bg-transparent" onClick={handleProfileClick}>
                  < LayoutDashboard className="mr-2 h-4 w-4" /> {user.name} (Dashboard)
                </Button>
                {user.role === "admin" && (
                  <Button variant="ghost" className="w-full justify-start pl-0 text-base font-medium hover:bg-transparent" onClick={handleAdminDashboardClick}>
                    <User className="mr-2 h-4 w-4" /> Admin
                  </Button>
                )}
                <Button variant="ghost" className="w-full justify-start pl-0 text-base font-medium text-red-600 hover:bg-transparent hover:text-red-700" onClick={handleLogoutClick}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={handleOverlayClick} aria-hidden="true" />
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 z-50 select-none">
        <ProgressiveBlur className="pointer-events-none absolute top-0 left-0 w-full z-10" height="150%" position="top" />
        <div className="absolute top-0 left-0 h-[120%] w-full bg-linear-to-b from-white/60 via-white/50 to-white/0 pointer-events-none" />

        <motion.div initial={false} animate={{ opacity: isMobileMenuOpen ? 1 : 0 }} transition={{ duration: 0.3 }} className="absolute top-0 left-0 h-full w-full bg-white pointer-events-none" />

        <div className="max-w-7xl mx-auto py-6 px-6 relative z-50">
          <div className="flex items-center justify-between">
            {renderLogo()}
            {renderDesktopNav()}
            <button type="button" className="md:hidden p-2 text-foreground hover:text-foreground/80 transition-colors" onClick={handleMobileMenuToggle} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {renderMobileNav()}
      </nav>
    </>
  );
}