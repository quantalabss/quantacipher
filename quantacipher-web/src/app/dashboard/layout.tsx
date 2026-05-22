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
            <main className="max-w-[1280px] mx-auto p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}
