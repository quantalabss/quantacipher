"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Key, Activity, CreditCard, LogOut, X, BookOpen, HelpCircle, Home } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const navItems = [
    { name: "API Keys", href: "/dashboard", icon: Key },
    { name: "Usage", href: "/dashboard/usage", icon: Activity },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Documentation", href: "https://quantachain.gitbook.io/quantacipher", icon: BookOpen },
    { name: "Support", href: "/support", icon: HelpCircle },
    { name: "Back to Home", href: "/", icon: Home },
];

interface DashboardSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function DashboardSidebar({ isOpen, setIsOpen }: DashboardSidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside 
                className={`fixed lg:sticky top-0 left-0 z-[120] h-[100dvh] w-[280px] flex flex-col justify-between bg-[#0a0a0a] border-r border-white/10 overflow-hidden transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
            {/* Subtle dot grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.15] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, #C4ED5F 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Lime glow */}
            <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#C4ED5F] opacity-[0.04] rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10 flex flex-col h-full p-6 pb-12 lg:pb-6">
                {/* Logo & Mobile Close */}
                <div className="mb-12 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 relative z-10 group w-fit" onClick={() => setIsOpen(false)}>
                        <img
                            src="/logo/quanta-transparent-bg-logo.svg"
                            alt="QuantaCipher Logo"
                            className="w-8 h-8 transition-transform group-hover:scale-110"
                        />
                        <span className="text-xl font-bold tracking-tighter text-white">
                            QuantaCipher<span className="text-[#C4ED5F]">.</span>
                        </span>
                    </Link>
                    <button 
                        className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-3">
                        Menu
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                target={item.href.startsWith('http') ? "_blank" : undefined}
                                rel={item.href.startsWith('http') ? "noopener noreferrer" : undefined}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-[#C4ED5F]" : "text-gray-400"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="Profile" className="w-9 h-9 rounded-full border border-white/10" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-[#C4ED5F] text-black flex items-center justify-center text-sm font-black">
                                    {session?.user?.name?.[0] || "U"}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-[13px] font-medium text-white leading-tight">
                                    {session?.user?.name || "User"}
                                </span>
                                <span className="text-[11px] text-gray-500 truncate max-w-[120px]">
                                    {session?.user?.email || ""}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => signOut({ callbackUrl: "/" })} 
                            className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors" 
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            </aside>
        </>
    );
}
