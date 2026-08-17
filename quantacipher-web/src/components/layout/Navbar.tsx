"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const navGroups = [
  {
    name: "Product",
    links: [
      { label: "Whitepaper", href: "/assets/QuantaCipher-Whitepaper.pdf", desc: "Technical overview of our zero-trust architecture" },
      { label: "Interactive Demo", href: "/demo", desc: "Live test of Kyber-1024 encryption" },
      { label: "Security Architecture", href: "/security", desc: "Zero-trust WASM & NIST standards" },
    ],
  },
  {
    name: "Developers",
    links: [
      { label: "Documentation", href: "https://quantachain.gitbook.io/quantacipher", desc: "Integration guides and API reference" },
      { label: "API Reference", href: "/api-reference", desc: "REST API Documentation" },
      { label: "NPM Package", href: "https://www.npmjs.com/package/quantacipher-sdk", desc: "Install the Node/Browser SDK" },
      { label: "Python PIP", href: "https://pypi.org/project/quantacipher", desc: "Install the Python bindings" },
    ],
  },
  {
    name: "Company",
    links: [
      { label: "About", href: "https://quantalabs.cc", desc: "Learn about QuantaLabs" },
      { label: "Support", href: "/support", desc: "Get in touch with our team" },
    ],
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (name: string) => setActiveDropdown(name);
  const handleMouseLeave = () => setActiveDropdown(null);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FCFBF9]/90 backdrop-blur-md border-b border-[#E8E5DF]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <Logo size={28} className="transition-transform group-hover:scale-105 text-[#111111]" />
            <span className="text-xl font-bold tracking-tight text-[#111111] font-serif">
              QuantaCipher<span className="text-[#8b7355]">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-2 font-sans">
            {navGroups.map((group) => (
              <div
                key={group.name}
                className="relative"
                onMouseEnter={() => handleMouseEnter(group.name)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium transition-colors rounded-sm ${
                    activeDropdown === group.name
                      ? "text-[#111111] bg-[#EAE6DF]/50"
                      : "text-[#6B6356] hover:text-[#111111]"
                  }`}
                >
                  {group.name}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === group.name ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {activeDropdown === group.name && (
                  <div className="absolute top-full left-0 pt-2 w-[320px]">
                    <div className="bg-[#FFFFFF] shadow-clean rounded-md overflow-hidden border border-[#E8E5DF] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 space-y-1">
                        {group.links.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            target={link.href.startsWith('http') ? "_blank" : undefined}
                            rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                            className="block p-3 rounded hover:bg-[#F4F2EC] transition-colors group/link"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="text-sm font-medium text-[#111111] mb-0.5 transition-colors">
                              {link.label}
                            </div>
                            <div className="text-xs text-[#6B6356] font-normal transition-colors">
                              {link.desc}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link href="/pricing" className="text-[#6B6356] hover:text-[#111111] px-4 py-2.5 text-sm font-medium transition-colors rounded-sm">Pricing</Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4 flex-shrink-0 font-sans">
            <Link
              href="/demo"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#6B6356] hover:text-[#111111] transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/signin"
              className="hidden md:inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#111111] text-white font-medium text-sm hover:bg-[#2c2c2c] transition-colors duration-200 shadow-clean"
            >
              Access platform
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-[#111111] transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="lg:hidden bg-[#FCFBF9] border-b border-[#E8E5DF] absolute top-full left-0 w-full max-h-[calc(100vh-80px)] overflow-y-auto shadow-clean">
          <div className="px-4 py-6 space-y-6 font-sans">
            {navGroups.map((group) => (
              <div key={group.name}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8b7355] mb-3 px-2">
                  {group.name}
                </h3>
                <div className="space-y-1">
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith('http') ? "_blank" : undefined}
                      rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                      className="block px-3 py-2 rounded text-sm font-medium text-[#111111] hover:bg-[#EAE6DF] transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link href="/pricing" className="block px-3 py-2 rounded text-sm font-medium text-[#111111] hover:bg-[#EAE6DF] transition-all" onClick={() => setIsOpen(false)}>
              Pricing
            </Link>
            
            <div className="pt-6 border-t border-[#E8E5DF] flex flex-col gap-3 px-2">
              <Link
                href="/demo"
                className="w-full py-3 px-4 rounded text-center text-sm font-medium text-[#111111] border border-[#E8E5DF] hover:bg-[#EAE6DF] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Demo
              </Link>
              <Link
                href="/signin"
                className="w-full py-3 px-4 rounded text-center text-sm font-medium text-white bg-[#111111] hover:bg-[#2c2c2c] transition-colors shadow-clean"
                onClick={() => setIsOpen(false)}
              >
                Access platform
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
