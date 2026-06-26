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
        <div className="min-h-[100dvh] bg-[#0a0a0a] font-sans text-white grid lg:grid-cols-[280px_1fr]">
            {/* Global Noise Overlay */}
            <div 
                className="fixed inset-0 z-[200] pointer-events-none opacity-[0.25] mix-blend-screen"
                style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '120px 120px'
                }} 
            />
            
            <DashboardSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
            <main className="w-full relative z-10 h-[100dvh] overflow-y-auto">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between px-4 h-[64px] border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-[110]">
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
