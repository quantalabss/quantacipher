"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/sections/Pricing";
import { CTA } from "@/components/sections/CTA";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#000000] relative">
            <Navbar />
            
            <main className="pt-20">
                {/* We use the Pricing section component which already has top/bottom padding */}
                <Pricing />
                
                {/* Include the CTA at the bottom for better conversion */}
                <CTA />
            </main>
            
            <Footer />
        
            {/* Subtle grid background */}
            <div 
              className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
              style={{
                backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />
        </div>
    );
}

