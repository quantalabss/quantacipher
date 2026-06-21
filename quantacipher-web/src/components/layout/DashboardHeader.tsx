"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (path: string) => {
        return pathname === path ? "text-white border-b-2 border-[#C4ED5F]" : "text-gray-500 hover:text-white border-b-2 border-transparent";
    };

    return (
        <header className={`sticky top-0 z-[100] flex items-center px-4 sm:px-6 md:px-8 justify-between transition-all duration-300 border-b ${
            scrolled 
                ? "bg-[#0a0a0a]/70 backdrop-blur-xl border-white/10 py-3 shadow-2xl" 
                : "bg-transparent border-transparent py-5"
        }`}>
            <div className="flex items-center gap-12">
                <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
                    <img
                        src="/logo/quanta-transparent-bg-logo.svg"
                        alt="QuantaCipher Logo"
                        className="w-7 h-7 transition-transform group-hover:scale-110"
                    />
                    <span className="text-lg font-bold tracking-tighter text-white">
                        QuantaCipher<span className="text-[#C4ED5F]">.</span>
                    </span>
                </Link>
                <nav className="hidden md:flex gap-6 items-center mt-1">
                    <Link href="/dashboard" className={`${isActive('/dashboard')} pb-1 font-bold text-sm transition-colors`}>API Keys</Link>
                    <Link href="/dashboard/usage" className={`${isActive('/dashboard/usage')} pb-1 font-bold text-sm transition-colors`}>Usage</Link>
                    <Link href="/dashboard/billing" className={`${isActive('/dashboard/billing')} pb-1 font-bold text-sm transition-colors`}>Billing</Link>
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa0a6]" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border border-white/10 rounded-xl h-[40px] pl-10 pr-4 text-sm w-[240px] focus:ring-1 focus:ring-[#C4ED5F] focus:border-[#C4ED5F] transition-all outline-none placeholder:text-gray-500 font-medium text-white"
                    />
                </div>
                {session?.user?.image ? (
                    <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C4ED5F] text-white flex items-center justify-center text-sm font-black">
                        {session?.user?.name?.[0] || "U"}
                    </div>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500 hover:text-white p-2" title="Sign out">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
