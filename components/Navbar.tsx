"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

const navItems: NavItem[] = [
  { label: "Work", href: "/#case-studies" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
  { label: "GitHub", href: "https://github.com/fderuiter/portfolio", isExternal: true },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 1. Scroll-driven backdrop color transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Scroll Spy: active section observer
  useEffect(() => {
    if (pathname !== "/") return;

    const sections = ["hero", "case-studies", "about", "contact"];
    const activeObservers: IntersectionObserver[] = [];

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-25% 0px -55% 0px", // triggers when section dominates screen middle
      threshold: 0.1,
    });

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        activeObservers.push(observer);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);



  // 4. Accessibility: Keyboard focus trapping and Esc key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus the first link when menu opens
    const timer = setTimeout(() => {
      if (menuRef.current) {
        const firstLink = menuRef.current.querySelector("a");
        firstLink?.focus();
      }
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "Tab") {
        if (!menuRef.current) return;
        const focusableElements = menuRef.current.querySelectorAll(
          'a[href], button:not([disabled])'
        );
        const elements = Array.from(focusableElements) as HTMLElement[];
        if (elements.length === 0) return;

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    // Prevent body scrolling when mobile menu is active
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle smooth scroll clicks on homepage
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.substring(2);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        setActiveSection(targetId);
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Navbar Container */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 w-full select-none",
          isScrolled
            ? "bg-brand-dark/75 backdrop-blur-md border-b border-neutral-900/60 py-4"
            : "bg-transparent py-6"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex justify-between items-center w-full">
          {/* Logo / Wordmark */}
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, "/#hero")}
            className="group flex items-center gap-2.5 font-mono text-sm tracking-widest font-extrabold text-white cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan/70 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
            </span>
            <span>FDERUITER</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isSectionActive = pathname === "/" && item.href.startsWith("/#") && activeSection === item.href.substring(2);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={cn(
                    "text-xs font-mono tracking-wider font-semibold transition-all duration-300 hover:text-white cursor-pointer flex items-center gap-1",
                    isSectionActive
                      ? "text-brand-cyan font-bold"
                      : "text-neutral-400"
                  )}
                >
                  {item.label}
                  {item.isExternal && <span className="text-[10px] text-neutral-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger Trigger */}
          <button
            ref={triggerRef}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 text-neutral-400 hover:text-white transition-colors cursor-pointer relative z-50"
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                y="4"
                width="24"
                height="2"
                rx="1"
                className={cn(
                  "origin-center transition-all duration-300",
                  isOpen ? "rotate-45 translate-y-[6px]" : ""
                )}
              />
              <rect
                y="11"
                width="24"
                height="2"
                rx="1"
                className={cn(
                  "transition-all duration-300",
                  isOpen ? "opacity-0" : ""
                )}
              />
              <rect
                y="18"
                width="24"
                height="2"
                rx="1"
                className={cn(
                  "origin-center transition-all duration-300",
                  isOpen ? "-rotate-45 -translate-y-[8px]" : ""
                )}
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Full-Screen Navigation Slide-out */}
      <AnimatePresence>
        {isOpen && (
          <div
            ref={menuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation overlay"
            className="fixed inset-0 z-40 bg-brand-dark/95 backdrop-blur-lg flex flex-col justify-center px-8"
          >
            {/* Ambient gradients */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/10 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-brand-blue/5 blur-[130px] pointer-events-none" />

            <nav className="flex flex-col gap-8 relative z-10">
              {navItems.map((item, index) => {
                const isSectionActive = pathname === "/" && item.href.startsWith("/#") && activeSection === item.href.substring(2);
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                  >
                    <Link
                      href={item.href}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={cn(
                        "text-3xl font-extrabold tracking-tight font-sans transition-all cursor-pointer flex items-center gap-2",
                        isSectionActive
                          ? "text-brand-cyan"
                          : "text-neutral-300 hover:text-white"
                      )}
                    >
                      {item.label}
                      {item.isExternal && <span className="text-lg text-neutral-600">↗</span>}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-8 left-8 font-mono text-[10px] text-neutral-500 tracking-[0.2em]"
            >
              © 2026 FREDERICK DE RUITER
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
