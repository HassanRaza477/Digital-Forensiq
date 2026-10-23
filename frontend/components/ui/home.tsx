"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import Ferrofluid from "@/components/Ferrofluid";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut",
    },
  },
};

const STATS = [
  { label: "Images analyzed", value: "10k+" },
  { label: "Tampering accuracy", value: "99%" },
  { label: "Supported formats", value: "10+" },
  { label: "AI models used", value: "5" },
];

function ArrowUpRight() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 11.5L11.5 3.5M4.5 3.5H11.5V10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 2.5H3.5C2.95 2.5 2.5 2.95 2.5 3.5V6.5M11.5 2.5H14.5C15.05 2.5 15.5 2.95 15.5 3.5V6.5M15.5 11.5V14.5C15.5 15.05 15.05 15.5 14.5 15.5H11.5M2.5 11.5V14.5C2.5 15.05 2.95 15.5 3.5 15.5H6.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M5 9H13"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-[0.16] grayscale"
      >
        <source src="/images/home-bg.webm" type="video/webm" />
        <source src="/images/home-bg.mp4" type="video/mp4" />
      </video>

      {/* Ferrofluid visual layer */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.24]">
        <Ferrofluid
          colors={["#ffffff", "#ffffff", "#a1a4a5"]}
          speed={0.35}
          scale={1.55}
          turbulence={0.8}
          fluidity={0.08}
          rimWidth={0.18}
          sharpness={2}
          shimmer={0.8}
          glow={1.2}
          flowDirection="down"
          opacity={0.8}
          mouseInteraction
          mouseStrength={0.7}
          mouseRadius={0.3}
        />
      </div>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:56px_56px]" />

      {/* Radial dark overlay */}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_32%,transparent_0%,rgba(0,0,0,0.2)_38%,#000_88%)]" />

      {/* Main hero */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex min-h-[calc(100vh-74px)] max-w-7xl flex-col justify-center px-6 pb-20 pt-20 sm:px-8 lg:px-12"
      >
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left content */}
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.14] bg-white/[0.045] px-3.5 py-2 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>

                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/65">
                  Phase 1 · Private beta
                </span>

                <span className="text-white/30">→</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              className="mt-7 max-w-4xl font-serif text-[clamp(3.8rem,9vw,8.5rem)] leading-[0.87] tracking-[-0.065em] text-white"
            >
              Know what&apos;s{" "}
              <span className="bg-gradient-to-r from-white via-white to-white/35 bg-clip-text text-transparent">
                real.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-xl text-base leading-7 text-white/55 sm:text-lg"
            >
              Upload an image and uncover tampering, hidden edits, metadata
              inconsistencies and AI-generated content with intelligent visual
              forensics.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <Link
                href="/tools/forensic-image"
                className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_14px_45px_rgba(255,255,255,0.16)]"
              >
                <ScanIcon />
                Analyze an image
                <span className="transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight />
                </span>
              </Link>

              <Link
                href="#features"
                className="group inline-flex h-12 items-center gap-2 px-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                See how it works
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="mt-14 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-7 border-t border-white/[0.14] pt-7 sm:grid-cols-4"
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-white">
                    {stat.value}
                  </p>

                  <p className="mt-1.5 text-[10px] uppercase leading-4 tracking-[0.13em] text-white/38">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right visual panel */}
          <motion.div
            variants={fadeUp}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto aspect-square max-w-[430px]">
              {/* Outer rings */}
              <div className="absolute inset-0 rounded-full border border-white/[0.1]" />
              <div className="absolute inset-8 rounded-full border border-dashed border-white/[0.12]" />
              <div className="absolute inset-20 rounded-full border border-white/[0.1]" />

              {/* Crosshair */}
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.1]" />
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/[0.1]" />

              {/* Center analysis card */}
              <div className="absolute left-1/2 top-1/2 w-[245px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.16] bg-[#0a0a0c]/90 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                      Live analysis
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      Evidence scan
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.06] text-white/70">
                    <ScanIcon />
                  </div>
                </div>

                {/* Scan preview */}
                <div className="relative h-28 overflow-hidden rounded-xl border border-white/[0.12] bg-[#101012]">
                  <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:18px_18px]" />

                  <motion.div
                    animate={{ y: ["-20%", "120%", "-20%"] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute left-0 right-0 h-px bg-white shadow-[0_0_14px_rgba(255,255,255,0.85)]"
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full border border-white/45">
                      <div className="mx-auto mt-5 h-3 w-3 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.7)]" />
                    </div>
                  </div>
                </div>

                {/* Analysis rows */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/45">Pixel integrity</span>
                    <span className="text-white/80">98.4%</span>
                  </div>

                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.1]">
                    <div className="h-full w-[98%] rounded-full bg-white" />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-white/45">Metadata match</span>
                    <span className="text-white/80">Verified</span>
                  </div>
                </div>
              </div>

              {/* Floating labels */}
              <div className="absolute -left-4 top-1/4 rounded-lg border border-white/[0.12] bg-black/70 px-3 py-2 backdrop-blur-md">
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/35">
                  Signal
                </p>
                <p className="mt-1 font-mono text-xs text-white/80">
                  STABLE
                </p>
              </div>

              <div className="absolute -bottom-3 right-0 rounded-lg border border-white/[0.12] bg-black/70 px-3 py-2 backdrop-blur-md">
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/35">
                  Confidence
                </p>
                <p className="mt-1 font-mono text-xs text-white/80">
                  0.984
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-black to-transparent" />
    </main>
  );
}
