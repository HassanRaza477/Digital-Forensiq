"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOOLS = [
  {
    name: "Image & Video Forensics",
    href: "/tools/forensic-image",
    description: "Detect tampering, check metadata",
  },
  // Aap yahan aur tools add kar sakte hain
];

export default function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const pathname = usePathname();

  // Shared styles for nav links
  const navLinkClasses =
    "relative text-body hover:text-ink transition-colors text-sm font-medium tracking-[0.35px] py-1";

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.98 },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-canvas/80 backdrop-blur-md border-b border-hairline flex items-center px-8">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-ink text-xl font-bold tracking-tight font-sans hover:opacity-80 transition-opacity"
        >
          ForensiQ
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`${navLinkClasses} ${
              pathname === "/" ? "text-ink after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-primary" : ""
            }`}
          >
            Home
          </Link>

          {/* Tools Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              className={`${navLinkClasses} flex items-center gap-1 ${
                pathname.startsWith("/tools") ? "text-ink" : ""
              }`}
            >
              Tools
              <motion.svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                animate={{ rotate: toolsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </motion.svg>
            </button>

            {/* Animated Dropdown Menu */}
            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-0 pt-3 w-64 z-50"
                >
                  <div className="bg-surface-elevated/90 backdrop-blur-lg border border-hairline-strong rounded-[12px] p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
                    {TOOLS.map((tool) => (
                      <motion.div
                        key={tool.href}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.05 * TOOLS.indexOf(tool) }}
                        whileHover={{ x: 6 }}
                        className="block"
                      >
                        <Link
                          href={tool.href}
                          className="block px-3 py-3 rounded-[8px] hover:bg-surface-card transition-colors"
                        >
                          <p className="text-ink text-sm font-medium">{tool.name}</p>
                          <p className="text-mute text-xs mt-1 font-sans">
                            {tool.description}
                          </p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/pricing"
            className={`${navLinkClasses} ${
              pathname === "/pricing" ? "text-ink" : ""
            }`}
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className={`${navLinkClasses} ${
              pathname === "/contact" ? "text-ink" : ""
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Right side Actions */}
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className={`${navLinkClasses} hidden sm:block`}
          >
            Sign in
          </Link>

          {/* Primary CTA Button */}
          <Link
            href="/tools/forensic-image"
            className="h-9 px-4 rounded-[8px] bg-primary text-primary-on text-sm font-medium font-sans flex items-center hover:bg-[#f1f7fe] hover:scale-[1.02] transition-all duration-200"
          >
            Try it free
          </Link>
        </div>
      </div>
    </header>
  );
}