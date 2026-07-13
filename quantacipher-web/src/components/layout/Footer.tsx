import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const socialLinks = [
  {
    label: "Discord",
    href: "https://discord.gg/7KmMBrrJEz",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/quantachain",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/quantanetwork",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/quantachain",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
];

const footerColumns = [
  {
    heading: "Product",
    links: [
      { label: "Overview", href: "/", badge: null },
      { label: "Interactive Demo", href: "/demo", badge: null },
      { label: "Pricing", href: "/pricing", badge: null },
      { label: "Security", href: "/security", badge: null },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "Documentation", href: "https://quantachain.gitbook.io/quantacipher", badge: null },
      { label: "NPM: SDK", href: "https://www.npmjs.com/package/quantacipher-sdk", badge: "Live", external: true },
      { label: "PyPI: SDK", href: "https://pypi.org/project/quantacipher", badge: "Live", external: true },
      { label: "Crates.io: Core", href: "https://crates.io/crates/quantacipher-core", badge: "Live", external: true },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About QuantaLabs", href: "https://quantalabs.cc", badge: "Reg", external: true },
      { label: "Support", href: "/support", badge: null },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy", badge: null },
      { label: "Terms of Service", href: "/terms", badge: null },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.02] bg-transparent text-white">



      {/* ── MAIN FOOTER ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Brand */}
          <div className="lg:col-span-3">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <Image
                src="/logo/quanta-transparent-bg-logo.svg"
                alt="QuantaCipher Logo"
                width={40}
                height={40}
                className="w-9 h-9 transition-transform group-hover:scale-110"
              />
              <span className="text-xl font-bold tracking-tighter">
                QuantaCipher<span className="text-[#C4ED5F]">.</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              Enterprise post-quantum encryption API. NIST ML-KEM (Kyber-1024). Zero-trust, zero complexity.
            </p>
            {/* Social links */}
            <div className="flex gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-none border border-[#333] flex items-center justify-center text-gray-400 hover:border-[#C4ED5F] hover:text-[#C4ED5F] transition-all hover:scale-110"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-10">
            {footerColumns.map((col) => (
              <div key={col.heading}>
                <h4 className="font-black text-xs uppercase tracking-widest text-white mb-5">
                  {col.heading}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label} className="flex items-center gap-2">
                      <Link
                        href={link.href}
                        target={(link as { external?: boolean }).external ? "_blank" : undefined}
                        rel={(link as { external?: boolean }).external ? "noopener noreferrer" : undefined}
                        className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                      >
                        {link.label}
                      </Link>
                      {link.badge && (
                        <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-none border border-[#333] text-gray-400 bg-[#111]">
                          {link.badge}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── BOTTOM BAR ──────────────────────────────────────────── */}
      <div className="border-t border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px] text-gray-400">
            © {new Date().getFullYear()} QuantaLabs Private Limited. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/support" className="hover:text-white transition-colors">Contact</Link>
            <a href="mailto:contact@quantalabs.cc" className="hover:text-white transition-colors">
              contact@quantalabs.cc
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
}
