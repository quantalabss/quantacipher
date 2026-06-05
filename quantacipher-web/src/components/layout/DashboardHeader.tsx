"use client";

import Link from "next/link";
import { Search, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-black";
    };

    return (
        <header className="bg-white border-b border-[#dadce0] sticky top-0 z-10 h-[64px] flex items-center px-6 justify-between">
            <div className="flex items-center gap-12">
                <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
                    <img
                        src="/logo/quanta-transparent-bg-logo.svg"
                        alt="QuantaCipher Logo"
                        className="w-7 h-7 transition-transform group-hover:scale-110"
                    />
                    <span className="text-lg font-bold tracking-tighter text-black">
                        QuantaCipher<span className="text-[#C4ED5F]">.</span>
                    </span>
                </Link>
                <nav className="hidden md:flex gap-6">
                    <Link href="/dashboard" className={`${isActive('/dashboard')} h-[64px] flex items-center px-1 font-bold text-sm transition-colors`}>API Keys</Link>
                    <Link href="/documentation" className={`text-gray-500 hover:text-black h-[64px] flex items-center px-1 font-bold text-sm transition-colors`}>Documentation</Link>
                    <Link href="/dashboard/billing" className={`${isActive('/dashboard/billing')} h-[64px] flex items-center px-1 font-bold text-sm transition-colors`}>Billing</Link>
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa0a6]" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-white border-none rounded-xl h-[40px] pl-10 pr-4 text-sm w-[240px] focus:ring-2 focus:ring-[#C4ED5F] focus:bg-white transition-all outline-none placeholder:text-gray-400 font-medium"
                    />
                </div>
                {session?.user?.image ? (
                    <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C4ED5F] text-black flex items-center justify-center text-sm font-black">
                        {session?.user?.name?.[0] || "U"}
                    </div>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500 hover:text-black p-2" title="Sign out">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
