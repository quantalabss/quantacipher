"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-5">
                        <Link href="/signin" className="text-[#1a73e8] hover:text-[#174ea6] text-[14px] font-medium transition-colors">
                            Sign in
                        </Link>
                        <Link href="/signin">
                            <Button className="bg-[#1a73e8] hover:bg-[#1967d2] text-white rounded-[4px] px-5 text-[14px] font-medium h-[36px] shadow-sm hover:shadow-md transition-all">
                                Get free API key
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
                        className="md:hidden absolute top-[64px] left-0 w-full bg-white border-b border-[#dadce0] shadow-xl overflow-y-auto"
                    >
                        <div className="px-6 py-6 space-y-4">
                            <Link
                                href="/signin"
                                onClick={() => setIsMobileOpen(false)}
                                className="flex items-center justify-center w-full border border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4] rounded-[4px] h-[44px] font-medium transition-colors text-[16px]"
                            >
                                Sign in
                            </Link>
                            <Link href="/signin" onClick={() => setIsMobileOpen(false)}>
                                <Button className="w-full bg-[#1a73e8] hover:bg-[#1967d2] text-white rounded-[4px] h-[44px] text-[16px] font-medium shadow-sm">
                                    Get free API key
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
