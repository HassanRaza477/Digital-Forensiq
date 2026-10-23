"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { name: "Single Image", href: "/tools/forensic-image" },
  { name: "Batch Analysis", href: "/tools/forensic-image/batch" },
  { name: "Compare Images", href: "/tools/forensic-image/compare" },
  { name: "Video Analysis", href: "/tools/forensic-image/video" },
];

export default function ForensicSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-white/[0.12] bg-black px-4 py-8 md:block">
      {/* Sidebar heading */}
      <div className="mb-7 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Forensic Tools
        </p>

        <p className="mt-2 text-xs leading-5 text-white/35">
          Select a tool to begin your analysis.
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {NAV_ITEMS.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-200 ${
                isActive
                  ? "border-white/[0.16] bg-white/[0.09] text-white"
                  : "border-transparent text-white/50 hover:border-white/[0.1] hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {/* Active indicator */}
              <span
                className={`absolute left-0 top-3 h-8 w-[2px] rounded-r-full bg-white transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Simple icon */}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm transition-colors ${
                  isActive
                    ? "border-white bg-white text-black"
                    : "border-white/[0.14] bg-white/[0.04] text-white/55 group-hover:border-white/25 group-hover:text-white"
                }`}
              >
                {index === 0 && "◈"}
                {index === 1 && "▦"}
                {index === 2 && "◫"}
                {index === 3 && "▷"}
              </span>

              {/* Link text */}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">
                  {item.name}
                </span>

                <span
                  className={`mt-1 block text-[10px] ${
                    isActive ? "text-white/50" : "text-white/30"
                  }`}
                >
                  {index === 0 && "Inspect one image"}
                  {index === 1 && "Analyze multiple files"}
                  {index === 2 && "Find visual differences"}
                  {index === 3 && "Inspect video frames"}
                </span>
              </span>

              {/* Number */}
              <span
                className={`self-start pt-1 font-mono text-[9px] ${
                  isActive ? "text-white/40" : "text-white/20"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom status card */}
      <div className="mt-10 rounded-xl border border-white/[0.12] bg-white/[0.035] p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]" />

          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/60">
            System ready
          </span>
        </div>

        <p className="mt-3 text-xs leading-5 text-white/35">
          Your forensic workspace is ready.
        </p>
      </div>
    </aside>
  );
}
