"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TOOLS = [
  {
    number: "01",
    name: "Image & Video Forensics",
    href: "/tools/forensic-image",
    description:
      "Detect manipulation, inspect metadata, and identify AI-generated media.",
  },
  {
    number: "02",
    name: "Scam Checker",
    href: "/tools/scam-checker",
    description:
      "Analyze suspicious messages, URLs, and emails for scam indicators.",
  },
];

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
];

function ForensiQMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.12)]">
      <svg
        width="20"
        height="20"
        viewBox="0 0 21 21"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="9"
          cy="9"
          r="5.4"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M13 13L18 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      </svg>
    </span>
  );
}

function ArrowUpRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 11L11 3M4 3H11V10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      aria-hidden="true"
    >
      <path
        d="M2.5 4.5L6 8L9.5 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setToolsOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.1] bg-black/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="ForensiQ home"
        >
          <ForensiQMark />

          <div className="leading-none">
            <div className="flex items-center gap-2">
              <span className="font-display text-[17px] font-semibold tracking-[-0.03em] text-white">
                ForensiQ
              </span>

              <span className="rounded-full border border-white/20 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/45">
                Beta
              </span>
            </div>

            <span className="mt-1 block text-[9px] uppercase tracking-[0.18em] text-white/35">
              Visual evidence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.035] p-1 md:flex">
          {NAV_LINKS.slice(0, 1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                isActive(link.href)
                  ? "bg-white text-black shadow-sm"
                  : "text-white/55 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Tools Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setToolsOpen((current) => !current)}
              onFocus={() => setToolsOpen(true)}
              aria-expanded={toolsOpen}
              aria-haspopup="menu"
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                pathname.startsWith("/tools")
                  ? "bg-white/[0.1] text-white"
                  : "text-white/55 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              Tools
              <ChevronDown open={toolsOpen} />
            </button>

            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-1/2 top-full w-[340px] -translate-x-1/2 pt-3"
                  role="menu"
                >
                  <div className="overflow-hidden rounded-2xl border border-white/[0.14] bg-[#0a0a0c]/95 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
                    <div className="mb-1 flex items-center justify-between px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                        Forensic tools
                      </span>

                      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    </div>

                    {TOOLS.map((tool, index) => (
                      <motion.div
                        key={tool.href}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={tool.href}
                          role="menuitem"
                          className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.08]"
                        >
                          <span className="pt-0.5 font-mono text-[10px] text-white/30">
                            {tool.number}
                          </span>

                          <span className="min-w-0">
                            <span className="flex items-center gap-2 text-sm font-medium text-white">
                              {tool.name}
                              <span className="translate-x-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
                                <ArrowUpRight />
                              </span>
                            </span>

                            <span className="mt-1 block text-xs leading-5 text-white/45">
                              {tool.description}
                            </span>
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                isActive(link.href)
                  ? "bg-white text-black shadow-sm"
                  : "text-white/55 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/login"
            className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
          >
            Sign in
          </Link>

          <Link
            href="/tools/forensic-image"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_rgba(255,255,255,0.16)]"
          >
            Try it free
            <span className="transition-transform group-hover:translate-x-0.5">
              <ArrowUpRight />
            </span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.04] text-white transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
        >
          <span className="relative flex h-4 w-4 flex-col justify-center gap-1">
            <span
              className={`block h-px w-4 bg-current transition-transform ${
                mobileOpen ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-4 bg-current transition-opacity ${
                mobileOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-px w-4 bg-current transition-transform ${
                mobileOpen ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden md:hidden"
          >
            <nav className="border-t border-white/[0.1] py-5">
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-white text-black"
                        : "text-white/65 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    {link.name}
                    <ArrowUpRight />
                  </Link>
                ))}

                <div className="my-4 border-t border-white/[0.1]" />

                <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Tools
                </p>

                {TOOLS.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"
                  >
                    {tool.name}
                    <ArrowUpRight />
                  </Link>
                ))}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="rounded-xl border border-white/[0.14] px-4 py-3 text-center text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/tools/forensic-image"
                    className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-white/90"
                  >
                    Try it free
                  </Link>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
