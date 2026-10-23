"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";

const sectionReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
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

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const CAPABILITIES = [
  {
    number: "01",
    title: "Image Forensics",
    description:
      "Inspect pixel-level inconsistencies, cloned regions, unusual compression and suspicious image edits.",
    icon: "scan",
  },
  {
    number: "02",
    title: "AI Media Detection",
    description:
      "Identify visual patterns and signals that may indicate AI-generated or synthetically altered media.",
    icon: "spark",
  },
  {
    number: "03",
    title: "Metadata Analysis",
    description:
      "Review EXIF data, timestamps, editing software, file history and other hidden metadata signals.",
    icon: "data",
  },
  {
    number: "04",
    title: "Video Inspection",
    description:
      "Analyze video content for suspicious frames, visual inconsistencies and possible manipulation.",
    icon: "video",
  },
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

function CapabilityIcon({ type }: { type: string }) {
  if (type === "spark") {
    return (
      <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
        <path
          d="M10.5 2.5L12 8.5L18 10L12 11.5L10.5 17.5L9 11.5L3 10L9 8.5L10.5 2.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "data") {
    return (
      <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
        <rect
          x="3"
          y="3"
          width="15"
          height="15"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M6 7H15M6 10.5H15M6 14H11"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "video") {
    return (
      <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
        <rect
          x="2.8"
          y="5"
          width="15.4"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M8 8L13 10.5L8 13V8Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
      <path
        d="M4 4H8M4 4V8M17 4H13M17 4V8M4 17H8M4 17V13M17 17H13M17 17V13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.5H15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white">
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path
          d="M2.2 5.5L4.4 7.6L8.8 3.3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function MvpSections() {
  return (
    <main className="overflow-hidden bg-black text-white">
      {/* =====================================================
          1. PRODUCT CAPABILITIES
      ====================================================== */}
      <section
        id="capabilities"
        className="relative border-t border-white/[0.1] px-6 py-24 sm:px-8 lg:px-12 lg:py-32"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[600px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-2xl"
          >
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              What ForensiQ checks
            </p>

            <h2 className="max-w-xl font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl">
              See beyond the surface.
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/50">
              A file can look normal and still contain hidden inconsistencies.
              ForensiQ combines visual analysis, metadata inspection and
              AI-assisted signals to help you understand what you are seeing.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {CAPABILITIES.map((capability) => (
              <motion.article
                key={capability.number}
                variants={sectionReveal}
                className="group relative min-h-[270px] rounded-2xl border border-white/[0.12] bg-[#0a0a0c] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-[#101012]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.13] bg-white/[0.05] text-white/75 transition-colors group-hover:bg-white group-hover:text-black">
                    <CapabilityIcon type={capability.icon} />
                  </div>

                  <span className="font-mono text-[10px] tracking-[0.12em] text-white/30">
                    {capability.number}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-base font-medium text-white">
                    {capability.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/45">
                    {capability.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          2. HOW IT WORKS
      ====================================================== */}
      <section
        id="how-it-works"
        className="border-t border-white/[0.1] bg-[#050505] px-6 py-24 sm:px-8 lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"
          >
            <div>
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Simple by design
              </p>

              <h2 className="max-w-xl font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl">
                From upload to insight.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-white/45">
              No complicated workflow. Add your file, let the system inspect
              the signals, then review the evidence behind the result.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="relative mt-20 grid gap-12 md:grid-cols-3 md:gap-8"
          >
            {/* Connector line */}
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-white/[0.14] md:block" />

            {[
              {
                number: "01",
                title: "Upload",
                description:
                  "Add an image, video or supported file directly from your device.",
              },
              {
                number: "02",
                title: "Analyze",
                description:
                  "ForensiQ checks pixels, metadata, compression patterns and other signals.",
              },
              {
                number: "03",
                title: "Understand",
                description:
                  "Review a clear result with confidence indicators and supporting evidence.",
              },
            ].map((step) => (
              <motion.article
                key={step.number}
                variants={sectionReveal}
                className="relative"
              >
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black font-mono text-sm text-white">
                  {step.number}
                </div>

                <h3 className="mt-7 text-lg font-medium text-white">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-xs text-sm leading-6 text-white/45">
                  {step.description}
                </p>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-20 rounded-2xl border border-white/[0.12] bg-[#0a0a0c] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Ready to inspect your first file?
                </p>

                <p className="mt-1 text-sm text-white/45">
                  Start with a fast, evidence-based analysis.
                </p>
              </div>

              <Link
                href="/tools/forensic-image"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-white/90"
              >
                Try it free
                <span className="transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          3. ANALYSIS PREVIEW
      ====================================================== */}
      <section
        id="analysis-preview"
        className="relative border-t border-white/[0.1] px-6 py-24 sm:px-8 lg:px-12 lg:py-32"
      >
        <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-white/[0.025] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Analysis preview
            </p>

            <h2 className="max-w-lg font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl">
              Evidence, not assumptions.
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-white/50">
              Every result is designed to be understandable. See the overall
              confidence, inspect individual signals and use the evidence to
              decide what to do next.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Clear confidence indicators",
                "Technical evidence summary",
                "Metadata and pixel-level signals",
                "Simple results for non-technical users",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-white/65"
                >
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative"
          >
            {/* Analysis card */}
            <div className="rounded-3xl border border-white/[0.14] bg-[#0a0a0c] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.1] pb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                    ForensiQ report
                  </p>

                  <h3 className="mt-1 text-lg font-medium text-white">
                    Analysis complete
                  </h3>
                </div>

                <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/60">
                  Demo result
                </span>
              </div>

              {/* Score */}
              <div className="grid gap-5 py-6 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
                <div className="flex items-center gap-5">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/15">
                    <div className="absolute inset-2 rounded-full border border-dashed border-white/20" />
                    <div className="text-center">
                      <p className="text-3xl font-semibold tracking-[-0.06em] text-white">
                        94.8%
                      </p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/40">
                        Confidence
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      Likely authentic
                    </p>
                    <p className="mt-1 max-w-[150px] text-xs leading-5 text-white/45">
                      No major manipulation signals detected.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.1] bg-white/[0.035] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-white/45">
                      Signal confidence
                    </span>
                    <span className="font-mono text-xs text-white/75">
                      0.948
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.1]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "94.8%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full bg-white"
                    />
                  </div>

                  <p className="mt-3 text-[11px] leading-5 text-white/40">
                    Score calculated from multiple visual and file-level
                    signals.
                  </p>
                </div>
              </div>

              {/* Signal rows */}
              <div className="space-y-2">
                {[
                  {
                    label: "Pixel integrity",
                    value: "98.4%",
                    status: "Strong",
                    width: "98%",
                  },
                  {
                    label: "Metadata consistency",
                    value: "Verified",
                    status: "Clear",
                    width: "92%",
                  },
                  {
                    label: "AI-generation signals",
                    value: "Low",
                    status: "Stable",
                    width: "18%",
                  },
                  {
                    label: "Manipulation indicators",
                    value: "Low",
                    status: "Stable",
                    width: "14%",
                  },
                ].map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-white/55">
                        {signal.label}
                      </span>

                      <span className="text-xs font-medium text-white/80">
                        {signal.value}
                      </span>
                    </div>

                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.1]">
                      <div
                        className="h-full rounded-full bg-white/70"
                        style={{ width: signal.width }}
                      />
                    </div>

                    <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/30">
                      {signal.status}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.1] pt-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
                <span>Processed in 3.2 seconds</span>
                <span>File remains private</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
