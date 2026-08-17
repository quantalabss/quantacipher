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
        <div className="min-h-[100dvh] bg-[#FCFBF9] font-sans text-[#111111] grid lg:grid-cols-[280px_1fr]">
            
            <DashboardSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
            <main className="w-full relative z-10 h-[100dvh] overflow-y-auto">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between px-4 h-[64px] border-b border-[#E8E5DF] sticky top-0 bg-[#FFFFFF]/80 backdrop-blur-md z-[110]">
                    <div className="flex items-center gap-3">
                        <img src="/logo/quanta-transparent-bg-logo.svg" alt="Logo" className="w-7 h-7" />
                        <span className="text-lg font-bold tracking-tighter text-[#111111] font-serif">QuantaCipher<span className="text-[#8b7355]">.</span></span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-[#6B6356] hover:text-[#111111] transition-colors bg-[#FCFBF9] rounded border border-[#E8E5DF]">
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
