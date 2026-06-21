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
      { label: "Architecture", href: "/architecture", desc: "How our zero-trust system works" },
      { label: "Dashboard", href: "/dashboard", desc: "Manage API keys and settings" },
    ],
  },
  {
    name: "Resources",
    links: [
      { label: "Documentation", href: "/documentation", desc: "Integration guides and API reference" },
      { label: "NPM Package", href: "https://www.npmjs.com/package/quanta-sdk", desc: "Install the Node/Browser SDK" },
      { label: "Python PIP", href: "#", desc: "Install the Python bindings" },
    ],
  },
  {
    name: "Company",
    links: [
      { label: "About", href: "https://quantalabs.cc", desc: "Learn about QuantaLabs" },
      { label: "Pricing", href: "/pricing", desc: "Simple, predictable pricing" },
      { label: "Contact", href: "mailto:hello@quantacipher.com", desc: "Get in touch with our team" },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[#0a0a0a]/70 backdrop-blur-xl border-white/10 py-3 shadow-2xl"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
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
                  className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                    activeDropdown === group.name
                      ? "text-white bg-[#111]"
                      : "text-gray-400 hover:text-white hover:bg-[#111]"
                  }`}
                >
                  {group.name}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === group.name ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {activeDropdown === group.name && (
                  <div className="absolute top-full left-0 pt-2 w-[320px]">
                    <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 space-y-1">
                        {group.links.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            className="block p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors group/link"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="text-sm font-bold text-white mb-0.5 group-hover/link:text-[#C4ED5F] transition-colors">
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
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/signin"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signin"
              className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-[#C4ED5F] transition-colors"
            >
              Start for free
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#111] transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="lg:hidden bg-[#000] border-b border-[#222] absolute w-full max-h-[calc(100vh-72px)] overflow-y-auto animate-in fade-in slide-in-from-top-4">
          <div className="px-4 py-6 space-y-8">
            {navGroups.map((group) => (
              <div key={group.name}>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">
                  {group.name}
                </h3>
                <div className="space-y-1">
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block px-2 py-3 text-base font-semibold text-gray-300 hover:text-white hover:bg-[#111] rounded-xl transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="pt-6 border-t border-[#222] flex flex-col gap-3 px-2">
              <Link
                href="/signin"
                className="w-full py-3 px-4 text-center text-sm font-bold text-white bg-[#111] rounded-xl border border-[#222]"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signin"
                className="w-full py-3 px-4 text-center text-sm font-bold text-black bg-white hover:bg-[#C4ED5F] rounded-xl"
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
