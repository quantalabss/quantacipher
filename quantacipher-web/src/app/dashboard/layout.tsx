"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white font-sans text-[black]">
            <DashboardHeader />
            <main className="w-full">
                {children}
            </main>
        </div>
    );
}
