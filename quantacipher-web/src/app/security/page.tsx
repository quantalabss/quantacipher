"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-[800px] mb-16 border-b border-[#dadce0] pb-16"
                    >
                        <h1 className="text-[48px] font-normal text-[#202124] mb-4">Security</h1>
                        <p className="text-[18px] text-[#5f6368] leading-relaxed">
                            Your data security is our top priority. Learn about our security practices and how we protect your infrastructure and data.
                        </p>
                    </motion.div>

                    {/* Security Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1000px] mb-16 pb-16 border-b border-[#dadce0]">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-[#f8f9fa] border border-[#dadce0] rounded-[16px] p-8"
                        >
                            <div className="w-12 h-12 bg-[#1a73e8] rounded-[12px] flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-[20px] font-medium text-[#202124] mb-3">Data Encryption</h3>
                            <p className="text-[14px] text-[#5f6368] leading-relaxed">
                                All data is encrypted in transit using TLS 1.3. Database connections use encrypted channels. We never store your RPC API keys - only endpoint URLs.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-[#f8f9fa] border border-[#dadce0] rounded-[16px] p-8"
                        >
                            <div className="w-12 h-12 bg-[#1a73e8] rounded-[12px] flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-[20px] font-medium text-[#202124] mb-3">Authentication</h3>
                            <p className="text-[14px] text-[#5f6368] leading-relaxed">
                                We use Google OAuth 2.0 for secure authentication. No passwords are stored on our servers. Session tokens are securely managed and automatically expire.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-[#f8f9fa] border border-[#dadce0] rounded-[16px] p-8"
                        >
                            <div className="w-12 h-12 bg-[#1a73e8] rounded-[12px] flex items-center justify-center mb-4">
                                <Eye className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-[20px] font-medium text-[#202124] mb-3">Access Control</h3>
                            <p className="text-[14px] text-[#5f6368] leading-relaxed">
                                Your API usage data is isolated and only accessible to your account. We implement strict role-based access controls for our internal systems.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-[#f8f9fa] border border-[#dadce0] rounded-[16px] p-8"
                        >
                            <div className="w-12 h-12 bg-[#1a73e8] rounded-[12px] flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-[20px] font-medium text-[#202124] mb-3">Incident Response</h3>
                            <p className="text-[14px] text-[#5f6368] leading-relaxed">
                                We maintain an incident response plan and monitor our systems 24/7. Any security incidents are investigated immediately and users are notified as required.
                            </p>
                        </motion.div>
                    </div>

                    {/* Best Practices */}
                    <div className="max-w-[800px] mb-16 border-b border-[#dadce0] pb-16">
                        <h2 className="text-[32px] font-normal text-[#202124] mb-8">Security Best Practices</h2>

                        <div className="space-y-6">
                            <div className="border-l-4 border-[#1a73e8] pl-6">
                                <h3 className="text-[18px] font-medium text-[#202124] mb-2">Protect Your Endpoints</h3>
                                <p className="text-[14px] text-[#5f6368] leading-relaxed">
                                    Always use HTTPS endpoints. Secure your Gateway integration properly. Rotate keys regularly and never share them publicly.
                                </p>
                            </div>

                            <div className="border-l-4 border-[#1a73e8] pl-6">
                                <h3 className="text-[18px] font-medium text-[#202124] mb-2">Secure Your API Keys</h3>
                                <p className="text-[14px] text-[#5f6368] leading-relaxed">
                                    Keep your QuantaCipher API keys private. These keys grant access to encrypt and decrypt your data. Revoke and regenerate them if they're ever exposed.
                                </p>
                            </div>

                            <div className="border-l-4 border-[#1a73e8] pl-6">
                                <h3 className="text-[18px] font-medium text-[#202124] mb-2">Monitor Account Activity</h3>
                                <p className="text-[14px] text-[#5f6368] leading-relaxed">
                                    Regularly review your API keys and usage analytics. Revoke any keys you no longer need. Sign out of unused sessions.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Compliance */}
                    <div className="max-w-[800px]">
                        <h2 className="text-[32px] font-normal text-[#202124] mb-6">Infrastructure & Compliance</h2>

                        <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-[8px] p-6 mb-6">
                            <h3 className="text-[18px] font-medium text-[#202124] mb-3">Hosting</h3>
                            <p className="text-[14px] text-[#5f6368] leading-relaxed">
                                QuantaCipher is hosted on Vercel's secure infrastructure with automatic HTTPS, DDoS protection, and global CDN. Database services are provided by MongoDB Atlas with enterprise-grade security.
                            </p>
                        </div>

                        <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-[8px] p-6">
                            <h3 className="text-[18px] font-medium text-[#202124] mb-3">Responsible Disclosure</h3>
                            <p className="text-[14px] text-[#5f6368] leading-relaxed mb-4">
                                If you discover a security vulnerability, please report it to us responsibly:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-[14px] text-[#5f6368] ml-4">
                                <li>Email: <a href="mailto:security@quantacipher.com" className="text-[#1a73e8] hover:underline">security@quantacipher.com</a></li>
                                <li>Do not publicly disclose the issue until we've had time to address it</li>
                                <li>We aim to respond to security reports within 48 hours</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
