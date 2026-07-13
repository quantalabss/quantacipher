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
        <main className="min-h-screen bg-transparent relative">
            {/* Content Wrapper */}
            <div className="relative z-[1]">
                <Navbar />
            <Hero />
            <WhyChooseUs />
            <HowItWorks />
            <TechStack />
            <Pricing />
                <CTA />
                <Footer />
            </div>
        </main>
    );
}
