"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white border-b border-[#dadce0]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-[64px]">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            {/* Google Product Logo Style: Simple Icon or Text */}
                            <div className="flex items-center gap-2">
                                <span className="text-[22px] font-normal text-[#5f6368] tracking-tight group-hover:text-[#202124] transition-colors relative top-[-1px]">
                                    QuantaCipher
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/dashboard" className="text-[#5f6368] hover:text-[#202124] hover:no-underline transition-colors text-[14px] font-medium tracking-wide">View demo</Link>
                        <Link href="#pricing" className="text-[#5f6368] hover:text-[#202124] hover:no-underline transition-colors text-[14px] font-medium tracking-wide">Pricing</Link>
                        <Link href="#integrations" className="text-[#5f6368] hover:text-[#202124] hover:no-underline transition-colors text-[14px] font-medium tracking-wide">Integrations</Link>

                        <div className="h-6 w-px bg-[#dadce0] mx-2"></div>

                        <Link href="/signin" className="text-[#1a73e8] hover:text-[#174ea6] text-[14px] font-medium tracking-wide">Sign in</Link>
                        <Link href="/signin">
                            <Button className="bg-[#1a73e8] hover:bg-[#1967d2] hover:shadow-md text-white rounded-[4px] px-6 text-[14px] font-medium h-[36px] shadow-sm transition-all">
                                Get free API key
                            </Button>
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-[#5f6368] hover:bg-[#f1f3f4] p-2 rounded-full transition-colors focus:outline-none">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0.95 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.95 }}
                        className="md:hidden bg-white border-b border-[#dadce0] origin-top shadow-lg"
                    >
                        <div className="px-6 py-6 space-y-4">
                            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block text-[#202124] font-medium text-[16px]">View demo</Link>
                            <Link href="#pricing" onClick={() => setIsOpen(false)} className="block text-[#202124] font-medium text-[16px]">Pricing</Link>
                            <Link href="#integrations" onClick={() => setIsOpen(false)} className="block text-[#202124] font-medium text-[16px]">Integrations</Link>
                            <Link href="/signin" onClick={() => setIsOpen(false)} className="block text-[#1a73e8] font-medium text-[16px]">Sign in</Link>
                            <div className="h-px bg-[#dadce0] my-4"></div>
                            <Link href="/signin" onClick={() => setIsOpen(false)}>
                                <Button className="w-full bg-[#1a73e8] text-white rounded-[4px] h-[40px] font-medium">
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
