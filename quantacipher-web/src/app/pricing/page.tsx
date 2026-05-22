import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/sections/Pricing";
import { CTA } from "@/components/sections/CTA";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <Navbar />
            <main className="flex-grow pt-16">
                <Pricing />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
