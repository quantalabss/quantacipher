"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BarChart3,
    CreditCard,
    BookOpen,
    LifeBuoy,
    LogOut,
    X,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Usage", href: "/dashboard/usage", icon: BarChart3 },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

const secondaryNavigation = [
    { name: "Documentation", href: "https://quantachain.gitbook.io/quantacipher", icon: BookOpen },
    { name: "Support", href: "/support", icon: LifeBuoy },
    { name: "Back to Home", href: "/", icon: LogOut },
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
                    className="fixed inset-0 z-[110] bg-[#111111]/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside 
                className={`fixed lg:sticky top-0 left-0 z-[120] h-[100dvh] w-[280px] flex flex-col justify-between bg-[#FCFBF9] border-r border-[#E8E5DF] overflow-hidden transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >

            <div className="relative z-10 flex flex-col h-full p-6 pb-12 lg:pb-6">
                {/* Logo & Mobile Close */}
                <div className="mb-12 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 relative z-10 group w-fit" onClick={() => setIsOpen(false)}>
                        <Logo size={28} className="transition-transform group-hover:scale-110 text-[#111111]" />
                        <span className="text-xl font-bold tracking-tighter text-[#111111] font-serif">
                            QuantaCipher<span className="text-[#8b7355]">.</span>
                        </span>
                    </Link>
                    <button 
                        className="lg:hidden text-[#6B6356] hover:text-[#111111] p-2 rounded hover:bg-[#E8E5DF] transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B6356] mb-4 px-3 font-sans">
                        Menu
                    </p>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded text-[13px] font-bold uppercase tracking-wider transition-colors ${
                                    isActive
                                        ? "bg-[#FFFFFF] text-[#111111] shadow-sm border border-[#E8E5DF]"
                                        : "text-[#6B6356] hover:text-[#111111] hover:bg-[#FFFFFF] border border-transparent"
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? "text-[#8b7355]" : "text-[#6B6356]"}`} />
                                {item.name}
                            </Link>
                        );
                    })}

                    <div className="mt-8 space-y-1">
                        <div className="px-3 mb-4 text-[10px] font-bold text-[#6B6356] uppercase tracking-widest font-sans">Resources</div>
                        {secondaryNavigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    target={item.href.startsWith('http') ? "_blank" : undefined}
                                    rel={item.href.startsWith('http') ? "noopener noreferrer" : undefined}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded text-[13px] font-bold uppercase tracking-wider text-[#6B6356] hover:text-[#111111] hover:bg-[#FFFFFF] transition-colors border border-transparent"
                                >
                                    <Icon className="w-4 h-4 text-[#6B6356]" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile & Logout */}
                <div className="mt-auto pt-6 border-t border-[#E8E5DF]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded border border-[#E8E5DF]" />
                            ) : (
                                <div className="w-8 h-8 rounded bg-[#FCFBF9] text-[#111111] border border-[#E8E5DF] flex items-center justify-center text-sm font-bold font-sans">
                                    {session?.user?.name?.[0] || "U"}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-[#111111] leading-tight font-sans">
                                    {session?.user?.name || "User"}
                                </span>
                                <span className="text-[11px] text-[#6B6356] truncate max-w-[120px] font-medium font-sans">
                                    {session?.user?.email || ""}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => signOut({ callbackUrl: "/" })} 
                            className="text-[#6B6356] hover:text-[#111111] p-2 rounded hover:bg-[#E8E5DF] transition-colors" 
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
