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
    <aside
      style={{ width: "180px", flexShrink: 0 }}
      className="hidden md:block border-r border-hairline pt-10 px-4"
    >
      <p className="text-mute text-xs px-3 mb-3 uppercase tracking-wide">
        Forensic Tools
      </p>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "block px-3 py-2 rounded-md text-sm transition-colors " +
                (isActive
                  ? "bg-surface-elevated text-ink"
                  : "text-charcoal hover:text-ink hover:bg-surface-card")
              }
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}