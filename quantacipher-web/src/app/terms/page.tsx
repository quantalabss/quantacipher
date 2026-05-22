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
                        <h1 className="text-[48px] font-normal text-[#202124] mb-4">Terms of Service</h1>
                        <p className="text-[14px] text-[#5f6368] mb-12">Last updated: January 29, 2026</p>

                        <div className="prose prose-lg max-w-none">
                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">1. Acceptance of Terms</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        By accessing and using QuantaCipher, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our service.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">2. Description of Service</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        QuantaCipher provides blockchain Enterprise API monitoring services. We perform periodic health checks on your specified endpoints and send alerts when issues are detected. Our service is provided "as is" and we make no guarantees about uptime or accuracy of monitoring.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">3. User Accounts</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed mb-4">
                                        You are responsible for:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-[#5f6368] ml-4">
                                        <li>Maintaining the confidentiality of your account</li>
                                        <li>All activities that occur under your account</li>
                                        <li>Ensuring your RPC endpoints are properly secured</li>
                                        <li>Complying with all applicable laws and regulations</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">4. Payment Terms</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed mb-4">
                                        Paid plans are billed monthly in cryptocurrency (ETH). By upgrading to a paid plan, you agree to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-[#5f6368] ml-4">
                                        <li>Pay the subscription fee for your selected plan</li>
                                        <li>Cryptocurrency payments are non-refundable</li>
                                        <li>We reserve the right to change pricing with 30 days notice</li>
                                        <li>Failure to pay may result in service suspension</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">5. Acceptable Use</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed mb-4">
                                        You agree not to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-[#5f6368] ml-4">
                                        <li>Use the service for any illegal purpose</li>
                                        <li>Attempt to gain unauthorized access to our systems</li>
                                        <li>Interfere with or disrupt the service</li>
                                        <li>Use the service to monitor endpoints you don't own or have permission to monitor</li>
                                        <li>Resell or redistribute our service without permission</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">6. Service Limits</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        Each plan has specific limits on the number of monitors, check frequency, and data retention. Exceeding these limits may result in service degradation or suspension. We reserve the right to enforce fair use policies.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">7. Limitation of Liability</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        QuantaCipher shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. We do not guarantee 100% uptime or that all alerts will be delivered successfully.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">8. Termination</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        We reserve the right to suspend or terminate your account at any time for violation of these terms. You may cancel your account at any time through your account settings.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">9. Changes to Terms</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        We may modify these terms at any time. We will notify users of significant changes via email. Continued use of the service after changes constitutes acceptance of the new terms.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">10. Contact</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        For questions about these Terms of Service, contact us at{" "}
                                        <a href="mailto:legal@quantacipher.com" className="text-[#1a73e8] hover:underline">
                                            legal@quantacipher.com
                                        </a>
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
