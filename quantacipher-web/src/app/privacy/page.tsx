"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function PrivacyPage() {
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
                        <h1 className="text-[48px] font-normal text-[#202124] mb-4">Privacy Policy</h1>
                        <p className="text-[14px] text-[#5f6368] mb-12">Last updated: January 29, 2026</p>

                        <div className="prose prose-lg max-w-none">
                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">1. Information We Collect</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed mb-4">
                                        We collect information you provide directly to us when you create an account, configure monitors, or contact support. This includes:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-[#5f6368] ml-4">
                                        <li>Email address and name (via Google OAuth)</li>
                                        <li>RPC endpoint URLs you wish to monitor</li>
                                        <li>Webhook URLs for alert notifications</li>
                                        <li>Payment information (crypto wallet addresses)</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">2. How We Use Your Information</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed mb-4">
                                        We use the information we collect to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-[#5f6368] ml-4">
                                        <li>Provide, maintain, and improve our monitoring services</li>
                                        <li>Send you alerts about your monitored endpoints</li>
                                        <li>Process payments and manage your subscription</li>
                                        <li>Respond to your support requests</li>
                                        <li>Detect and prevent fraud or abuse</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">3. Data Security</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        We implement industry-standard security measures to protect your data. All data is encrypted in transit using TLS. We do not store your RPC API keys or sensitive credentials - only the endpoint URLs you provide for monitoring purposes.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">4. Data Retention</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        We retain your monitoring data and incident history for the duration of your subscription. Historical check data is retained according to your plan (30 days for Validator, 7 days for Hobbyist). You can request deletion of your account and all associated data at any time.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">5. Third-Party Services</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed mb-4">
                                        We use the following third-party services:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-[#5f6368] ml-4">
                                        <li>Google OAuth for authentication</li>
                                        <li>MongoDB Atlas for data storage</li>
                                        <li>Vercel for hosting and infrastructure</li>
                                        <li>Resend for email delivery</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">6. Your Rights</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        You have the right to access, update, or delete your personal information at any time through your account settings. You may also contact us at privacy@quantacipher.com to exercise these rights.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[#202124] mb-4">7. Contact Us</h2>
                                    <p className="text-[16px] text-[#5f6368] leading-relaxed">
                                        If you have questions about this Privacy Policy, please contact us at{" "}
                                        <a href="mailto:privacy@quantacipher.com" className="text-[#1a73e8] hover:underline">
                                            privacy@quantacipher.com
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
