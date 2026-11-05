"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/providers/auth-provider/authProvider";
import { useShowApplyCta } from "@/hooks/applications";
import { useHydrated } from "@/hooks/use-hydrated";

export function Navigation() {
  // const { user, isLoggedIn, logoutUser: logout } = useAuth();
  const { isAuthenticated, user, logout } = useAuth();
  const showApplyCta = useShowApplyCta();
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useHydrated();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const needsSolidNav = pathname === "/contact";
  const showApply = isHydrated && showApplyCta;

  useEffect(function () {
    function handleScroll() {
      setIsScrolled(window.scrollY > 50);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return function () {
      return window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(
    function () {
      document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
      return function () {
        document.body.style.overflow = "unset";
      };
    },
    [isMobileMenuOpen],
  );

  useEffect(function () {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return function () {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMobileMenuToggle = () =>
    setIsMobileMenuOpen(function (prev) {
      return !prev;
    });
  function handleMobileLinkClick() {
    return setIsMobileMenuOpen(false);
  }
  function handleOverlayClick() {
    return setIsMobileMenuOpen(false);
  }
  function handleProfileDropdownToggle() {
    return setIsProfileOpen(function (prev) {
      return !prev;
    });
  }

  function handleProfileClick() {
    router.push("/member/dashboard");
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }

  function handleAdminDashboardClick() {
    router.push("/member/admin");
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }

  async function handleLogoutClick() {
    try {
      await logout();
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  function renderLogo() {
    return (
      <Link
        href="/"
        aria-label="AI Society - Home"
        className="flex items-center gap-[9px] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Image
          src="/kthais-logo.svg"
          alt=""
          width={40}
          height={40}
          className="h-9 w-9 shrink-0"
          priority
        />
        <span
          aria-hidden={isScrolled}
          className={`font-arial text-[2.125rem] font-bold leading-none tracking-[-0.05em] text-[#1751A6] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            isScrolled ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          AI Society
        </span>
      </Link>
    );
  }

  function renderAuthDropdown() {
    if (!isAuthenticated || !user) {
      return (
        <Link
          href="/contact"
          className="text-md font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          Contact
        </Link>
      );
    }
    

    return (
      <div className="relative" ref={profileRef}>
        <button
          type="button"
          onClick={handleProfileDropdownToggle}
          className="flex items-center gap-2 text-md font-medium text-foreground/80 hover:text-foreground transition-colors focus:outline-none"
        >
          {user.firstName}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-1"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm font-semibold truncate">
                  {user.firstName}
                </p>
              </div>
              <button
                type="button"
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground/80 hover:bg-gray-50 hover:text-foreground flex items-center gap-2 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </button>
              {user?.roles?.includes("admin") && (
                <button
                  type="button"
                  onClick={handleAdminDashboardClick}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground/80 hover:bg-gray-50 hover:text-foreground flex items-center gap-2 transition-colors"
                >
                  <User className="h-4 w-4" /> Admin
                </button>
              )}
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-50"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  function renderDesktopNav() {
    const linkClass =
      "text-md font-medium text-foreground/80 hover:text-foreground transition-colors";

    return (
      <div className="hidden items-center gap-6 md:flex">
        <Link href="/about" className={linkClass}>
          About
        </Link>
        <Link href="/events" className={linkClass}>
          Events
        </Link>
        <Link href="/projects" className={linkClass}>
          Projects
        </Link>
        <Link href="/business/jobs" className={linkClass}>
          Job Board
        </Link>
        <Link href="/newsletter" className={linkClass}>
          Newsletter
        </Link>
        {renderAuthDropdown()}
        {showApply ? (
          <Button asChild>
            <Link href="/apply">Apply</Link>
          </Button>
        ) : null}
      </div>
    );
  }

  function renderMobileNav() {
    return (
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{
              height: "auto",
              transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
            }}
            exit={{
              height: 0,
              transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
            }}
            className="fixed top-0 right-0 left-0 z-[60] overflow-hidden bg-white shadow-md md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 pt-18 pb-6">
              {showApply ? (
                <Button asChild className="mb-3 w-full" size="lg">
                  <Link href="/apply" onClick={handleMobileLinkClick}>
                    Apply
                  </Link>
                </Button>
              ) : null}
              <Link
                href="/about"
                className="block py-3 text-base text-foreground/70 hover:text-foreground"
                onClick={handleMobileLinkClick}
              >
                About
              </Link>
              <Link
                href="/events"
                className="block py-3 text-base text-foreground/70 hover:text-foreground"
                onClick={handleMobileLinkClick}
              >
                Events
              </Link>
              <Link
                href="/projects"
                className="block py-3 text-base text-foreground/70 hover:text-foreground"
                onClick={handleMobileLinkClick}
              >
                Projects
              </Link>
              <Link
                href="/business/jobs"
                className="block py-3 text-base text-foreground/70 hover:text-foreground"
                onClick={handleMobileLinkClick}
              >
                Job Board
              </Link>
              <Link
                href="/newsletter"
                className="block py-3 text-base text-foreground/70 hover:text-foreground"
                onClick={handleMobileLinkClick}
              >
                Newsletter
              </Link>
              {!isAuthenticated ? (
                <Link
                  href="/contact"
                  className="block py-3 text-base text-foreground/70 hover:text-foreground"
                  onClick={handleMobileLinkClick}
                >
                  Contact
                </Link>
              ) : null}

              {isAuthenticated && user && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="px-2 mb-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">
                      Account
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start pl-0 text-base font-medium hover:bg-transparent"
                    onClick={handleProfileClick}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" /> {user.firstName}{" "}
                    (Dashboard)
                  </Button>
                  {user?.roles?.includes("admin") && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start pl-0 text-base font-medium hover:bg-transparent"
                      onClick={handleAdminDashboardClick}
                    >
                      <User className="mr-2 h-4 w-4" /> Admin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start pl-0 text-base font-medium text-red-600 hover:bg-transparent hover:text-red-700"
                    onClick={handleLogoutClick}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 z-50 select-none">
        {needsSolidNav ? (
          <div className="pointer-events-none absolute inset-0 z-10 bg-white/95 shadow-sm backdrop-blur-md" />
        ) : (
          <>
            <ProgressiveBlur
              className="pointer-events-none absolute top-0 left-0 z-10 w-full"
              height="150%"
              position="top"
            />
            <div className="pointer-events-none absolute top-0 left-0 h-[120%] w-full bg-linear-to-b from-white/60 via-white/50 to-white/0" />
          </>
        )}

        <motion.div
          initial={false}
          animate={{ opacity: isMobileMenuOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute top-0 left-0 h-full w-full bg-white"
        />

        <div className="relative z-50 mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            {renderLogo()}
            {renderDesktopNav()}
            <button
              type="button"
              className="p-2 text-foreground transition-colors hover:text-foreground/80 md:hidden"
              onClick={handleMobileMenuToggle}
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

        {renderMobileNav()}
      </nav>
    </>
  );
}
