"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#202124]">
            <DashboardHeader />
            <main className="w-full">
                {children}
            </main>
        </div>
    );
}
