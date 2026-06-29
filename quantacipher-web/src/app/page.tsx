import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Pricing } from "@/components/sections/Pricing";
import { TechStack } from "@/components/sections/TechStack";
import { CTA } from "@/components/sections/CTA";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { HowItWorks } from "@/components/sections/HowItWorks";

export default function Home() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] relative">
            {/* Content Wrapper */}
            <div className="relative z-[1]">
                <Navbar />
            <Hero />
            <TrustedBy />
            <WhyChooseUs />
            <HowItWorks />
            <TechStack />
            <Pricing />
                <CTA />
                <Footer />
            </div>
            
            {/* Global Noise Overlay for entire site (On TOP of background, but BEHIND overlays/navbar) */}
            <div 
              className="fixed inset-0 z-0 pointer-events-none opacity-[0.25] mix-blend-screen"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '120px 120px'
              }} 
            />
        </main>
    );
}
