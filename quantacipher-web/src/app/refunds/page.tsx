"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function RefundsPage() {
    return (
        <div className="min-h-screen bg-[#000000] relative">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-[48px] font-normal text-white mb-4">Cancellation and Refund Policy</h1>
                        <p className="text-[14px] text-gray-400 mb-12">Last updated: May 23, 2026</p>

                        <div className="prose prose-lg max-w-none">
                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">1. General Policy</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed mb-4">
                                        At QUANTALABS PRIVATE LIMITED ("QuantaCipher", "we", "us", or "our"), we strive to provide the best post-quantum cryptographic infrastructure for your business. Due to the digital and infrastructure-intensive nature of our SaaS (Software as a Service) products, all subscription fees and payments made to QuantaCipher are strictly non-refundable, except as legally required.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">2. Subscription Cancellations</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed mb-4">
                                        You may cancel your QuantaCipher subscription at any time through your dashboard. If you cancel your subscription, the cancellation will take effect at the end of your current billing cycle (monthly or annual). 
                                    </p>
                                    <p className="text-[16px] text-gray-400 leading-relaxed mb-4">
                                        <strong>No Prorated Refunds:</strong> We do not provide prorated refunds for mid-cycle cancellations or downgrades. You will retain access to the paid features of your subscription until the billing cycle concludes.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">3. Exceptional Circumstances</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed mb-4">
                                        If you believe there has been a billing error or unauthorized charge on your account, please contact our billing department immediately. All other service disruptions or outages are not eligible for refunds or service credits.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">4. Contact Us</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed">
                                        If you have any questions or concerns regarding our Refund Policy, please contact our support team at:{" "}
                                        <br/><br/>
                                        <strong>QUANTALABS PRIVATE LIMITED</strong><br/>
                                        Email: <a href="mailto:support@quantacipher.com" className="text-[#C4ED5F] hover:underline">support@quantacipher.com</a>
                                    </p>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                </div>
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
