"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-[48px] font-normal text-[black] mb-4">Terms of Service</h1>
                        <p className="text-[14px] text-[#6b7280] mb-12">Last updated: May 23, 2026</p>

                        <div className="prose prose-lg max-w-none">
                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4">1. Agreement to Terms</h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed mb-4">
                                        These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and QUANTALABS PRIVATE LIMITED ("QuantaCipher", "we", "us", or "our"), concerning your access to and use of the QuantaCipher API, SDKs, and associated web dashboard (collectively, the "Services"). By accessing the Services, you agree that you have read, understood, and agree to be bound by all of these Terms.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4">2. API Usage and Licenses</h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed mb-4">
                                        Subject to your compliance with these Terms, QuantaCipher grants you a limited, non-exclusive, non-transferable, revocable license to access and use our post-quantum cryptographic APIs for your internal business purposes or for integration into your consumer-facing applications. 
                                    </p>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed mb-4">
                                        You agree not to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-[#6b7280] ml-4">
                                        <li>Exceed the rate limits associated with your subscribed pricing tier.</li>
                                        <li>Reverse engineer, decompile, or attempt to extract the source code of our WASM engines or gateway servers.</li>
                                        <li>Use the Services for any illegal or unauthorized purpose, including but not limited to cryptojacking or distributing malware.</li>
                                        <li>Share or expose your QuantaCipher API keys publicly. You are solely responsible for the security of your API keys.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4">3. Subscriptions and Payments</h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed mb-4">
                                        QuantaCipher offers both free ("Developer") and paid ("Startup", "Professional", "Enterprise") subscription tiers. By selecting a paid tier, you agree to pay the monthly or annual subscription fees indicated at the time of purchase. Fees are non-refundable except as required by law.
                                    </p>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed">
                                        We reserve the right to change our pricing or institute new charges upon 30 days' notice to you. Continued use of the Services after such changes constitutes your acceptance of the new fees.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4">4. Service Level Agreements (SLAs)</h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed">
                                        Paid tiers ("Startup", "Professional", "Enterprise") are subject to a 99.9% Uptime SLA. If we fail to meet this SLA in a given calendar month, you may be eligible for a service credit. The Developer (Free) tier is provided "as-is" without any warranty of uptime or availability.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4">5. Intellectual Property</h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed">
                                        All intellectual property rights in the Services, including but not limited to our Kyber-1024 implementations, gateway architecture, and dashboard UI, remain the exclusive property of QUANTALABS PRIVATE LIMITED. These Terms do not grant you any right, title, or interest in our intellectual property.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4">6. Limitation of Liability</h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed">
                                        IN NO EVENT WILL QUANTACIPHER BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE SIX (6) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4">7. Termination</h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed">
                                        We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation a breach of the Terms.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4">8. Contact Information</h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed">
                                        For legal inquiries regarding these Terms of Service, please contact us at: <a href="mailto:legal@quantacipher.com" className="text-[#C4ED5F] hover:underline">legal@quantacipher.com</a>.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
