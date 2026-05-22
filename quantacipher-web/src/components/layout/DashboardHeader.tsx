"use client";

import Link from "next/link";
import { Search, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? "text-[#1a73e8] border-b-2 border-[#1a73e8]" : "text-[#5f6368] hover:text-[#202124]";
    };

    return (
        <header className="bg-white border-b border-[#dadce0] sticky top-0 z-10 h-[64px] flex items-center px-6 justify-between">
            <div className="flex items-center gap-12">
                <Link href="/" className="text-[22px] text-[#5f6368] tracking-tight hover:text-[#202124] transition-colors">
                    QuantaCipher
                </Link>
                <nav className="hidden md:flex gap-6">
                    <Link href="/dashboard" className={`${isActive('/dashboard')} h-[64px] flex items-center px-1 font-medium text-[14px] transition-colors`}>API Keys</Link>
                    <Link href="/documentation" className={`text-[#5f6368] hover:text-[#202124] h-[64px] flex items-center px-1 font-medium text-[14px] transition-colors`}>Documentation</Link>
                    <Link href="/dashboard/settings" className={`${isActive('/dashboard/settings')} h-[64px] flex items-center px-1 font-medium text-[14px] transition-colors`}>Settings</Link>
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa0a6]" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-[#f1f3f4] border-none rounded-[8px] h-[40px] pl-10 pr-4 text-[14px] w-[240px] focus:ring-2 focus:ring-[#1a73e8] focus:bg-white transition-all outline-none placeholder:text-[#9aa0a6]"
                    />
                </div>
                {session?.user?.image ? (
                    <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-[#dadce0]" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-sm font-medium">
                        {session?.user?.name?.[0] || "U"}
                    </div>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[#5f6368] hover:text-[#d93025] p-2" title="Sign out">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
