"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/sections/Pricing";
import { CTA } from "@/components/sections/CTA";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            
            <main className="pt-20">
                {/* We use the Pricing section component which already has top/bottom padding */}
                <Pricing />
                
                {/* Include the CTA at the bottom for better conversion */}
                <CTA />
            </main>
            
            <Footer />
        </div>
    );
}
