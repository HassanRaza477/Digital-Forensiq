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
    { name: "Privacy Policy", href: "/" },
    { name: "Terms of Service", href: "/" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-canvas text-charcoal px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <p className="font-display text-lg text-ink mb-2">ForensiQ</p>
            <p className="text-mute text-sm">
              Verify what&apos;s real, one image at a time.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="text-ink text-sm font-medium mb-3">{category}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-charcoal text-sm hover:text-ink transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-mute"
          style={{ borderTop: "1px solid var(--color-hairline)" }}
        >
          <p>© {new Date().getFullYear()} ForensiQ. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: "var(--color-accent-green)" }}
            />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}