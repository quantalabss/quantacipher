"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const navGroups = [
  {
    name: "Product",
    links: [
      { label: "Overview", href: "/", desc: "The platform for post-quantum security" },
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

  // Handle scroll effect
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
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b ${
        scrolled
          ? "bg-[#000000] border-[#222222]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <Image
              src="/logo/quanta-transparent-bg-logo.svg"
              alt="QuantaCipher Logo"
              width={48}
              height={48}
              className="w-9 h-9 transition-transform group-hover:scale-110"
              priority
            />
            <span className="text-xl font-bold tracking-tighter text-white">
              QuantaCipher<span className="text-[#C4ED5F]">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navGroups.map((group) => (
              <div
                key={group.name}
                className="relative"
                onMouseEnter={() => handleMouseEnter(group.name)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                    activeDropdown === group.name
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
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
                  <div className="absolute top-full left-0 pt-4 w-[320px]">
                    <div className="bg-[#0A0A0A] border border-[#222] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3 space-y-1">
                        {group.links.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            target={link.href.startsWith('http') ? "_blank" : undefined}
                            rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                            className="block p-3 hover:bg-[#111] transition-colors group/link"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="text-sm font-semibold text-white mb-0.5 transition-colors">
                              {link.label}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
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
            <Link href="/pricing" className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Pricing</Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/demo"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/signin"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Start for free
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="lg:hidden bg-[#000000] border-b border-[#222] absolute top-full left-0 w-full max-h-[calc(100vh-96px)] overflow-y-auto animate-in fade-in slide-in-from-top-4">
          <div className="px-4 py-6 space-y-6">
            {navGroups.map((group) => (
              <div key={group.name}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 px-2">
                  {group.name}
                </h3>
                <div className="space-y-1">
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith('http') ? "_blank" : undefined}
                      rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                      className="block px-2 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#111] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link href="/pricing" className="block px-2 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#111] transition-colors" onClick={() => setIsOpen(false)}>
              Pricing
            </Link>
            
            <div className="pt-6 border-t border-[#222] flex flex-col gap-3 px-2">
              <Link
                href="/demo"
                className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-[#111] border border-[#222] hover:border-gray-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Demo
              </Link>
              <Link
                href="/signin"
                className="w-full py-2.5 px-4 text-center text-sm font-semibold text-black bg-white hover:bg-gray-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Start for free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
