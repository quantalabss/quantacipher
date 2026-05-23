"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Shield, Code, Cpu, Key, Briefcase, Activity, Building2, Book, Terminal, Github, BarChart2 } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Menu Data ────────────────────────────────────────────────────────────────

const PLATFORM_GROUPS = [
    {
        label: "Core Infrastructure",
        items: [
            { icon: Shield, title: "Zero-Trust Gateway", desc: "Secure API routing with ML-based threat detection", href: "/platform/gateway" },
            { icon: Cpu, title: "Kyber-1024 Engine", desc: "NIST-approved post-quantum encryption core", href: "/platform/engine" },
        ],
    },
    {
        label: "Developer Tools",
        items: [
            { icon: Code, title: "Client SDKs", desc: "Two-line drop-in payload encryption", href: "/platform/sdks" },
            { icon: Key, title: "Key Management", desc: "Dynamic, auto-rotating API keys", href: "/platform/keys" },
            { icon: BarChart2, title: "Secure Analytics", desc: "Encrypted usage insights and audit logs", href: "/platform/analytics" },
        ],
    },
];

const SOLUTIONS_GROUPS = [
    {
        label: "By Industry",
        items: [
            { icon: Briefcase, title: "Fintech", desc: "Secure financial data against harvest attacks", href: "/solutions/fintech" },
            { icon: Activity, title: "Healthcare", desc: "HIPAA-compliant encrypted API payloads", href: "/solutions/healthcare" },
            { icon: Building2, title: "Enterprise", desc: "Global deployment with SLA guarantees", href: "/solutions/enterprise" },
        ],
    },
];

const DEVELOPER_GROUPS = [
    {
        label: "Learn",
        items: [
            { icon: Book, title: "Documentation", desc: "Quickstarts, guides, and references", href: "/documentation" },
            { icon: Terminal, title: "API Reference", desc: "Full REST API and Gateway specification", href: "/api-reference" },
        ],
    },
    {
        label: "Open Source",
        items: [
            { icon: Github, title: "GitHub", desc: "Star and fork the WASM encryption core", href: "https://github.com/quantacipher" },
        ],
    },
];

// ─── Components ───────────────────────────────────────────────────────────────

function DropdownPanel({ groups }: { groups: { label: string; items: any[] }[] }) {
    const multiCol = groups.length > 1;
    return (
        <div className={`flex ${multiCol ? "flex-row divide-x divide-[#f1f3f4]" : "flex-col"} p-4 gap-0`}>
            {groups.map((group, gi) => (
                <div key={gi} className={`${multiCol ? "flex-1 px-4 first:pl-0 last:pr-0" : ""}`}>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-[#80868b] mb-3 px-1">
                        {group.label}
                    </p>
                    <div className="flex flex-col gap-0.5">
                        {group.items.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className="flex items-start gap-3 px-2 py-2.5 rounded-[6px] hover:bg-[#f1f3f4] transition-colors group"
                            >
                                <item.icon className="w-[18px] h-[18px] mt-0.5 shrink-0 text-[#5f6368] group-hover:text-[#202124] transition-colors" />
                                <div>
                                    <p className="text-[#202124] text-[14px] font-medium leading-snug group-hover:text-[#1a73e8] transition-colors">
                                        {item.title}
                                    </p>
                                    <p className="text-[#5f6368] text-[12px] leading-snug mt-0.5">{item.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function NavDropdown({ title, groups }: { title: string; groups: { label: string; items: any[] }[] }) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(true);
    };
    const handleLeave = () => {
        timeoutRef.current = setTimeout(() => setOpen(false), 80);
    };

    return (
        <div className="relative h-full flex items-center" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <button
                className={`flex items-center gap-1 text-[14px] font-medium tracking-wide py-5 transition-colors ${open ? "text-[#202124]" : "text-[#5f6368] hover:text-[#202124]"}`}
            >
                {title}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180 text-[#202124]" : "text-[#80868b]"}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.13, ease: "easeOut" }}
                        className="absolute top-[calc(100%+1px)] left-0 bg-white border border-[#dadce0] rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden min-w-[260px]"
                        style={{ width: groups.length > 1 ? 500 : 280 }}
                    >
                        <DropdownPanel groups={groups} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MobileNavSection({ title, groups }: { title: string; groups: { label: string; items: any[] }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const allItems = groups.flatMap((g) => g.items);

    return (
        <div className="border-b border-[#dadce0] last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left text-[#202124] font-medium text-[15px] py-4"
            >
                {title}
                <ChevronDown className={`w-4 h-4 text-[#5f6368] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 space-y-1 pl-2">
                            {allItems.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className="flex items-center gap-3 px-2 py-2 rounded-[6px] text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] transition-colors"
                                >
                                    <item.icon className="w-4 h-4 shrink-0 text-[#5f6368]" />
                                    <span className="text-[14px] font-medium">{item.title}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function Navbar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white border-b border-[#dadce0]">
            <div className="max-w-[1440px] mx-auto px-6">
                <div className="flex justify-between items-center h-[64px]">

                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 group">
                        <span className="text-[22px] font-bold text-[#202124] tracking-tight group-hover:text-[#1a73e8] transition-colors">
                            QuantaCipher
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-7 h-full">
                        <NavDropdown title="Platform" groups={PLATFORM_GROUPS} />
                        <NavDropdown title="Solutions" groups={SOLUTIONS_GROUPS} />
                        <NavDropdown title="Developers" groups={DEVELOPER_GROUPS} />
                        <Link
                            href="/pricing"
                            className="text-[#5f6368] hover:text-[#202124] transition-colors text-[14px] font-medium"
                        >
                            Pricing
                        </Link>
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-5">
                        <Link href="/signin" className="text-[#1a73e8] hover:text-[#174ea6] text-[14px] font-medium transition-colors">
                            Sign in
                        </Link>
                        <Link href="/signin">
                            <Button className="bg-[#1a73e8] hover:bg-[#1967d2] text-white rounded-[4px] px-5 text-[14px] font-medium h-[36px] shadow-sm hover:shadow-md transition-all">
                                Get API key
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="text-[#5f6368] hover:bg-[#f1f3f4] p-2 rounded-full transition-colors"
                        >
                            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="md:hidden absolute top-[64px] left-0 w-full bg-white border-b border-[#dadce0] shadow-xl max-h-[calc(100vh-64px)] overflow-y-auto pb-12"
                    >
                        <div className="px-6 py-4">
                            <MobileNavSection title="Platform" groups={PLATFORM_GROUPS} />
                            <MobileNavSection title="Solutions" groups={SOLUTIONS_GROUPS} />
                            <MobileNavSection title="Developers" groups={DEVELOPER_GROUPS} />
                            <Link
                                href="/pricing"
                                onClick={() => setIsMobileOpen(false)}
                                className="block text-[#202124] font-medium text-[15px] py-4 border-b border-[#dadce0]"
                            >
                                Pricing
                            </Link>
                            <div className="mt-6 space-y-3 pb-4">
                                <Link
                                    href="/signin"
                                    onClick={() => setIsMobileOpen(false)}
                                    className="flex items-center justify-center w-full border border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] rounded-[4px] h-[40px] font-medium transition-colors text-[14px]"
                                >
                                    Sign in
                                </Link>
                                <Link href="/signin" onClick={() => setIsMobileOpen(false)}>
                                    <Button className="w-full bg-[#1a73e8] hover:bg-[#1967d2] text-white rounded-[4px] h-[40px] font-medium shadow-sm">
                                        Get API key
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

