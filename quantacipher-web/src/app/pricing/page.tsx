"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/sections/Pricing";
import { CTA } from "@/components/sections/CTA";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Navbar />
            
            <main className="pt-20">
                {/* We use the Pricing section component which already has top/bottom padding */}
                <Pricing />
                
                {/* Include the CTA at the bottom for better conversion */}
                <CTA />
            </main>
            
            <Footer />
        
            {/* Global Noise Overlay */}
            <div 
              className="fixed inset-0 z-[100] pointer-events-none opacity-[0.25] mix-blend-screen"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '120px 120px'
              }} 
            />
        </div>
    );
}

