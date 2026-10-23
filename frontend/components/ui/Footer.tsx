import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { name: "Image Forensics", href: "/tools/forensic-image" },
    { name: "Pricing", href: "/pricing" },
  ],
  Company: [
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

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

function ForensiQMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white">
      <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
        <circle
          cx="9"
          cy="9"
          r="5.5"
          stroke="#000"
          strokeWidth="1.7"
        />
        <path
          d="M13 13L18 18"
          stroke="#000"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="9" cy="9" r="1.6" fill="#000" />
      </svg>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.14] bg-black px-6 pb-7 pt-16 text-white sm:px-8 sm:pt-20">
      {/* Subtle monochrome background texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
          {/* Brand section */}
          <div className="max-w-md">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="ForensiQ home"
            >
              <ForensiQMark />

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl tracking-tight text-white">
                    ForensiQ
                  </span>

                  <span className="rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
                    Beta
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Evidence, not assumptions
                </span>
              </div>
            </Link>

            <p className="mt-7 max-w-sm text-sm leading-7 text-white/55">
              Verify what&apos;s real, one image at a time. ForensiQ helps
              teams inspect visual evidence with clarity and confidence.
            </p>

            {/* System status */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/[0.14] bg-white/[0.04] px-3.5 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>

              <span className="text-xs font-medium text-white/65">
                All systems operational
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category}>
                <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  {category}
                </p>

                <ul className="space-y-3.5">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <span>{link.name}</span>

                        <span className="translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                          <ArrowUpRight />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA panel */}
        <div className="mt-16 flex flex-col gap-5 rounded-2xl border border-white/[0.14] bg-white/[0.045] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-medium text-white">
              Have an image you&apos;re unsure about?
            </p>

            <p className="mt-1 text-sm text-white/50">
              Start with a clear, evidence-based analysis.
            </p>
          </div>

          <Link
            href="/tools/forensic-image"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Run an analysis

            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowUpRight />
            </span>
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.14] pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ForensiQ. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <span>Built for better evidence</span>

            <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />

            <span>Secure by design</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
