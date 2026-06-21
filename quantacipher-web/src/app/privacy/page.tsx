"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-[48px] font-normal text-white mb-4">Privacy Policy</h1>
                        <p className="text-[14px] text-gray-400 mb-12">Last updated: May 23, 2026</p>

                        <div className="prose prose-lg max-w-none">
                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">1. Introduction</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed mb-4">
                                        QUANTALABS PRIVATE LIMITED ("QuantaCipher", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our post-quantum cryptographic services and APIs (collectively, the "Services").
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">2. Information We Collect</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed mb-4">
                                        We collect information that you provide directly to us, including:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-gray-400 ml-4">
                                        <li><strong>Account Information:</strong> Name, email address, and authentication credentials (e.g., via Google OAuth).</li>
                                        <li><strong>Billing Information:</strong> Payment details processed securely by our third-party payment processors (e.g., Stripe). We do not store your raw credit card numbers.</li>
                                        <li><strong>Usage Data:</strong> API request volumes, IP addresses, timestamp logs, and system performance metrics necessary to provide and monitor our Services.</li>
                                        <li><strong>Customer Support Data:</strong> Information you provide when contacting our support team.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">3. How We Use Your Information</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed mb-4">
                                        We use the collected information for various purposes, including to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-gray-400 ml-4">
                                        <li>Provide, operate, and maintain our cryptographic infrastructure.</li>
                                        <li>Process transactions and send related billing information.</li>
                                        <li>Send administrative notices, security alerts, and technical updates.</li>
                                        <li>Respond to comments, questions, and provide customer support.</li>
                                        <li>Monitor and analyze usage trends to improve the Services and ensure strict compliance with our SLAs.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">4. Data Security & Cryptography</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed">
                                        Security is at the core of QuantaCipher. We implement enterprise-grade security measures, including NIST-approved Kyber-1024 encryption protocols, to protect your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable cryptographic means to protect your personal information, we cannot guarantee its absolute security against unprecedented quantum attacks prior to full post-quantum migration.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">5. Data Sharing and Disclosure</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed mb-4">
                                        We do not sell your personal data. We may share information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf (e.g., payment processing, data analysis, email delivery, hosting services). These third parties are bound by strict confidentiality agreements and data processing addendums.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">6. Your Data Rights</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed" >
                                        Depending on your location, you may have the right to request access to, correction of, or deletion of your personal data. You may also have the right to object to processing or request data portability. To exercise these rights, please contact our Data Protection Officer at contact@quantalabs.cc.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-white mb-4">7. Contact Us</h2>
                                    <p className="text-[16px] text-gray-400 leading-relaxed">
                                        If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:{" "}
                                        <br/><br/>
                                        <strong>QUANTALABS PRIVATE LIMITED</strong><br/>
                                        Email: <a href="mailto:contact@quantalabs.cc" className="text-[#C4ED5F] hover:underline">contact@quantalabs.cc</a>
                                    </p>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                </div>
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



