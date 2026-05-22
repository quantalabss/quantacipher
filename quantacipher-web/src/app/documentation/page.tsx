"use client";

import Link from "next/link";
import { Book, Code, Zap, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function DocumentationPage() {
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
                        <h1 className="text-[48px] font-normal text-[#202124] mb-4">Documentation</h1>
                        <p className="text-[18px] text-[#5f6368] leading-relaxed">
                            Everything you need to monitor your Enterprise APIs and blockchain infrastructure.
                        </p>
                    </motion.div>

                    {/* Quick Start */}
                    <div className="max-w-[800px] mb-16 border-b border-[#dadce0] pb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-6 h-6 text-[#1a73e8]" />
                            <h2 className="text-[32px] font-normal text-[#202124]">Quick Start</h2>
                        </div>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="bg-[#f8f9fa] rounded-[8px] p-6 border border-[#dadce0]"
                            >
                                <h3 className="text-[20px] font-medium text-[#202124] mb-4">1. Create an Account</h3>
                                <p className="text-[16px] text-[#5f6368] mb-4">
                                    Sign up using your Google account. No credit card required for the free tier.
                                </p>
                                <Link href="/signin" className="text-[#1a73e8] hover:underline text-[14px] font-medium">
                                    Get Started →
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-[#f8f9fa] rounded-[8px] p-6 border border-[#dadce0]"
                            >
                                <h3 className="text-[20px] font-medium text-[#202124] mb-4">2. Add Your First Monitor</h3>
                                <p className="text-[16px] text-[#5f6368] mb-4">
                                    Navigate to your dashboard and click "Add Monitor". Paste your RPC endpoint URL.
                                </p>
                                <div className="bg-[#202124] rounded-[4px] p-4 font-mono text-[13px] text-[#e8eaed] overflow-x-auto">
                                    https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-[#f8f9fa] rounded-[8px] p-6 border border-[#dadce0]"
                            >
                                <h3 className="text-[20px] font-medium text-[#202124] mb-4">3. Configure Alerts</h3>
                                <p className="text-[16px] text-[#5f6368] mb-4">
                                    Choose between email alerts (default) or webhook notifications for Discord/Slack.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-[14px] text-[#3c4043]">
                                        <CheckCircle2 className="w-4 h-4 text-[#34a853] mt-0.5 flex-shrink-0" />
                                        Email: Instant alerts to your registered email
                                    </li>
                                    <li className="flex items-start gap-2 text-[14px] text-[#3c4043]">
                                        <CheckCircle2 className="w-4 h-4 text-[#34a853] mt-0.5 flex-shrink-0" />
                                        Webhook: Real-time notifications in Discord/Slack
                                    </li>
                                </ul>
                            </motion.div>
                        </div>
                    </div>

                    {/* API Reference */}
                    <div className="max-w-[800px] mb-16 border-b border-[#dadce0] pb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Code className="w-6 h-6 text-[#1a73e8]" />
                            <h2 className="text-[32px] font-normal text-[#202124]">Supported Networks</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="border border-[#dadce0] rounded-[8px] p-6">
                                <h3 className="text-[18px] font-medium text-[#202124] mb-2">EVM Compatible Chains</h3>
                                <p className="text-[14px] text-[#5f6368] mb-4">
                                    We perform <code className="bg-[#f1f3f4] px-2 py-1 rounded text-[13px] font-mono">eth_blockNumber</code> checks to verify node synchronization.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Ethereum", "Polygon", "Arbitrum", "Optimism", "BSC", "Avalanche", "Base"].map((chain) => (
                                        <span key={chain} className="bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full text-[12px] font-medium">
                                            {chain}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-[#dadce0] rounded-[8px] p-6">
                                <h3 className="text-[18px] font-medium text-[#202124] mb-2">Solana & SVM Chains</h3>
                                <p className="text-[14px] text-[#5f6368] mb-4">
                                    We perform <code className="bg-[#f1f3f4] px-2 py-1 rounded text-[13px] font-mono">getSlot</code> checks to verify node health.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Solana Mainnet", "Solana Devnet", "Custom SVM"].map((chain) => (
                                        <span key={chain} className="bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full text-[12px] font-medium">
                                            {chain}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Webhook Setup */}
                    <div className="max-w-[800px]">
                        <div className="flex items-center gap-3 mb-6">
                            <Book className="w-6 h-6 text-[#1a73e8]" />
                            <h2 className="text-[32px] font-normal text-[#202124]">Webhook Setup</h2>
                        </div>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <h3 className="text-[20px] font-medium text-[#202124] mb-3">Discord Webhook</h3>
                                <ol className="space-y-3 list-decimal list-inside text-[14px] text-[#5f6368]">
                                    <li>Go to your Discord server settings → Integrations → Webhooks</li>
                                    <li>Click "New Webhook" and select your channel</li>
                                    <li>Copy the webhook URL</li>
                                    <li>Paste it in QuantaCipher when creating a monitor</li>
                                </ol>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <h3 className="text-[20px] font-medium text-[#202124] mb-3">Slack Webhook</h3>
                                <ol className="space-y-3 list-decimal list-inside text-[14px] text-[#5f6368]">
                                    <li>Visit <a href="https://api.slack.com/messaging/webhooks" className="text-[#1a73e8] hover:underline" target="_blank">Slack Incoming Webhooks</a></li>
                                    <li>Create a new app and enable Incoming Webhooks</li>
                                    <li>Add webhook to your workspace and select a channel</li>
                                    <li>Copy the webhook URL and paste it in QuantaCipher</li>
                                </ol>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
