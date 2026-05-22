import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TechStack } from "@/components/sections/TechStack";
import { CTA } from "@/components/sections/CTA";

export default function IntegrationsPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <main className="flex-grow pt-16">
                {/* Header specifically for Integrations Page */}
                <div className="bg-[#f8f9fa] border-b border-[#dadce0] py-20 px-4 sm:px-6 lg:px-8 mt-16">
                    <div className="max-w-[1200px] mx-auto text-center">
                        <h1 className="text-[40px] sm:text-[48px] font-normal text-[#202124] mb-4">
                            Connect QuantaCipher Everywhere
                        </h1>
                        <p className="text-[18px] sm:text-[20px] text-[#5f6368] max-w-2xl mx-auto leading-relaxed">
                            Whether you're building a cloud-native microservice or a simple frontend app, QuantaCipher integrates flawlessly into your existing stack.
                        </p>
                    </div>
                </div>
                <TechStack />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
