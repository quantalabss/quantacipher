"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  BookOpen,
  Blocks,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  Code2,
  ChevronDown,
  LayoutDashboard,
  Server,
  CreditCard,
  MessageSquare,
  Lock
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  external?: boolean;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
};

type NavGroup = {
  name: string;
  href?: string;
  items: NavItem[];
  footer?: { label: string; href: string };
};

const navGroups: NavGroup[] = [
  {
    name: "Product",
    href: "/architecture",
    footer: { label: "View Architecture →", href: "/architecture" },
    items: [
      {
        name: "Demo",
        href: "/demo",
        description: "Interactive API usage demo",
        icon: Cpu,
      },
      {
        name: "Architecture",
        href: "/architecture",
        description: "Zero-trust PQC infrastructure",
        icon: Blocks,
      },
      {
        name: "API Reference",
        href: "/api",
        description: "RESTful endpoint specifications",
        icon: Server,
        badge: "v1.0",
      },
    ],
  },
  {
    name: "Resources",
    items: [
      {
        name: "Documentation",
        href: "/documentation",
        description: "Integration guides and tutorials",
        icon: BookOpen,
      },
      {
        name: "Developer SDKs",
        href: "/documentation#sdks",
        description: "Official JS, Python, Go clients",
        icon: Code2,
      },
      {
        name: "Support",
        href: "/support",
        description: "Technical assistance and SLAs",
        icon: MessageSquare,
      },
    ],
  },
  {
    name: "Company",
    items: [
      {
        name: "Pricing",
        href: "/pricing",
        description: "Transparent API usage plans",
        icon: CreditCard,
      },
      {
        name: "Security",
        href: "/security",
        description: "Compliance and threat models",
        icon: ShieldCheck,
      },
      {
        name: "Dashboard",
        href: "/dashboard",
        description: "Manage API keys and usage",
        icon: LayoutDashboard,
      },
    ],
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, []);

  const handleMouseEnter = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20">
        <div className="flex items-center justify-between h-full">

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
            <span className="text-xl font-bold tracking-tighter text-black">
              QuantaCipher<span className="text-[#00E599]">.</span>
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
                  className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-full transition-all ${activeDropdown === group.name
                      ? "text-black bg-gray-100"
                      : "text-gray-600 hover:text-black hover:bg-white"
                    }`}
                >
                  {group.name}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === group.name ? "rotate-180 text-[#00E599]" : ""
                      }`}
                  />
                </button>

                {/* Dropdown panel */}
                {activeDropdown === group.name && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
                    style={{ minWidth: "22rem" }}
                    onMouseEnter={() => handleMouseEnter(group.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="bg-white rounded-2xl shadow-[0_24px_60px_-10px_rgba(0,0,0,0.12)] border border-black/5 overflow-hidden">
                      <div className="p-2">
                        {group.items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            className="group/item flex items-start gap-3 p-3 rounded-xl hover:bg-white transition-all"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover/item:bg-black group-hover/item:text-white transition-all">
                              {item.icon && <item.icon className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-bold text-gray-900">{item.name}</span>
                                {item.badge && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                                    {item.badge}
                                  </span>
                                )}
                                {item.external && (
                                  <ArrowUpRight className="w-3 h-3 text-gray-300 group-hover/item:text-gray-500 transition-colors" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 font-medium leading-snug">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Footer link */}
                      {group.footer && (
                        <div className="px-4 py-3 border-t border-gray-50 bg-white">
                          <Link
                            href={group.footer.href}
                            className="text-xs font-bold text-gray-400 hover:text-[#00E599] transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {group.footer.label}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/signin"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100 rounded-full transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signin"
              className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 bg-black text-white rounded-full font-semibold text-sm hover:bg-[#00E599] hover:text-black transition-all"
            >
              Get Free API Key
            </Link>
            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ───────────────────────────────────────── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bottom-0 bg-white border-t border-gray-100 overflow-y-auto z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-2">

            {navGroups.map((group) => (
              <div key={group.name} className="border border-gray-100 rounded-2xl overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() =>
                    setMobileExpanded(mobileExpanded === group.name ? null : group.name)
                  }
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-bold text-sm text-black uppercase tracking-wider">
                    {group.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${mobileExpanded === group.name ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Expanded items */}
                {mobileExpanded === group.name && (
                  <div className="border-t border-gray-50 bg-white px-3 py-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                          {item.icon && <item.icon className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{item.name}</span>
                            {item.badge && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-medium">{item.description}</p>
                        </div>
                        {item.external && <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 ml-auto shrink-0" />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/signin"
              onClick={() => setIsOpen(false)}
              className="mt-4 block px-6 py-4 text-sm font-bold text-black bg-gray-100 rounded-2xl text-center hover:bg-gray-200 transition-all tracking-wider"
            >
              Sign In
            </Link>
            <Link
              href="/signin"
              onClick={() => setIsOpen(false)}
              className="mt-2 block px-6 py-4 text-sm font-bold text-white bg-black rounded-2xl text-center hover:bg-[#00E599] hover:text-black transition-all tracking-wider"
            >
              Get Free API Key
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
