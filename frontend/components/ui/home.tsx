"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import Ferrofluid from "@/components/Ferrofluid";

// Staggered Animation Variants
const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Stats data for social proof
const STATS = [
  { label: "Images analyzed", value: "10k+" },
  { label: "Tampering accuracy", value: "99%" },
  { label: "Supported formats", value: "10+" },
  { label: "AI models used", value: "5" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-canvas text-ink overflow-hidden selection:bg-accent-blue/20 selection:text-ink">
      {/* ===== LAYER 1: VIDEO BACKGROUND (scrolls with the section) ===== */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 pointer-events-none"
      >
        <source src="/images/home-bg.webm" type="video/webm" />
        <source src="/images/home-bg.mp4" type="video/mp4" />
      </video>

      {/* ===== LAYER 2: FERROFLUID OVERLAY (scrolls with the section) ===== */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <Ferrofluid
          colors={["#ffffff", "#ffffff", "#ffffff"]}
          speed={0.5}
          scale={1.6}
          turbulence={1}
          fluidity={0.1}
          rimWidth={0.2}
          sharpness={2.5}
          shimmer={1.5}
          glow={2}
          flowDirection="down"
          opacity={1}
          mouseInteraction
          mouseStrength={1}
          mouseRadius={0.35}
        />
      </div>

      {/* ===== LAYER 3: CONTENT (Centered Hero Text) ===== */}
      <motion.section
        className="relative max-w-3xl mx-auto px-6 pt-16 pb-24 lg:pt-20 lg:pb-32 z-10 flex flex-col items-center text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Badge Pill */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2.5 bg-surface-elevated/80 backdrop-blur-sm border border-hairline-strong rounded-full px-4 py-1.5 shadow-[0_0_20px_rgba(255,255,255,0.03)]"
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-accent-green"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-body text-[13px] tracking-[0.35px] font-medium font-sans flex items-center gap-1">
            Phase 1 · Beta <span className="text-mute">→</span>
          </span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-serif text-5xl md:text-7xl lg:text-[88px] leading-[0.95] tracking-[-0.04em] text-ink drop-shadow-sm mt-6"
        >
          Know what&apos;s{" "}
          <span className="relative inline-block bg-gradient-to-r from-ink via-ink to-accent-orange bg-clip-text text-transparent">
            real.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-body text-lg md:text-xl leading-relaxed font-sans max-w-xl mt-6"
        >
          Upload any image and instantly check for tampering, hidden edits,
          and metadata inconsistencies with AI-powered forensics.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/tools/forensic-image"
              className="inline-flex h-12 px-6 items-center justify-center rounded-[12px] bg-primary text-primary-on text-[14px] font-medium font-sans hover:bg-[#f1f7fe] transition-all duration-200 shadow-[0_0_30px_rgba(252,253,255,0.1)]"
            >
              Analyze an image
            </Link>
          </motion.div>
          <motion.div whileHover={{ x: 6 }} transition={{ type: "spring", stiffness: 400 }}>
            <Link
              href="#features"
              className="inline-flex items-center h-12 px-2 text-body text-[14px] font-medium font-sans hover:text-ink transition-colors"
            >
              See how it works →
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-8 pt-8 mt-8 border-t border-hairline w-full"
        >
          {STATS.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-ink text-lg font-semibold">{stat.value}</span>
              <span className="text-mute text-xs uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.section>
    </main>
  );
}