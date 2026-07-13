"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-[100dvh] bg-transparent font-sans text-white grid lg:grid-cols-[280px_1fr]">
            
            <DashboardSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
            <main className="w-full relative z-10 h-[100dvh] overflow-y-auto">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between px-4 h-[64px] border-b border-white/10 sticky top-0 bg-black/50 backdrop-blur-md z-[110]">
                    <div className="flex items-center gap-3">
                        <img src="/logo/quanta-transparent-bg-logo.svg" alt="Logo" className="w-7 h-7" />
                        <span className="text-lg font-bold tracking-tighter text-white">QuantaCipher<span className="text-[#C4ED5F]">.</span></span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto pt-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
