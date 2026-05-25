"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function SupportPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would send to your support system
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero */}
                    <div className="max-w-[800px] mb-16 border-b border-[#e5e7eb] pb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-[48px] font-normal text-[black] mb-4">Contact Support</h1>
                            <p className="text-[18px] text-[#6b7280] leading-relaxed">
                                Need help? We're here to assist you with any questions or issues.
                            </p>
                        </motion.div>
                    </div>

                    {/* Contact Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mb-16 pb-16 border-b border-[#e5e7eb]">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white border border-[#e5e7eb] rounded-[2rem] p-8"
                        >
                            <div className="w-12 h-12 bg-[#00E599] rounded-[12px] flex items-center justify-center mb-4">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-[20px] font-medium text-[black] mb-2">Email Support</h3>
                            <p className="text-[14px] text-[#6b7280] mb-4">
                                Get help via email. We typically respond within 24 hours.
                            </p>
                            <a href="mailto:support@quantacipher.com" className="text-[#00E599] hover:underline text-[14px] font-medium">
                                support@quantacipher.com
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white border border-[#e5e7eb] rounded-[2rem] p-8"
                        >
                            <div className="w-12 h-12 bg-[#00E599] rounded-[12px] flex items-center justify-center mb-4">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-[20px] font-medium text-[black] mb-2">Documentation</h3>
                            <p className="text-[14px] text-[#6b7280] mb-4">
                                Browse our guides and API documentation for quick answers.
                            </p>
                            <Link href="/documentation" className="text-[#00E599] hover:underline text-[14px] font-medium">
                                View Docs ?
                            </Link>
                        </motion.div>
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-[600px]"
                    >
                        <h2 className="text-[32px] font-normal text-[black] mb-8">Send us a message</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder=" "
                                    className="peer w-full h-[56px] px-4 pt-4 rounded-[4px] bg-[#f1f3f4] border-b-[1px] border-[#6b7280] focus:border-[#00E599] focus:border-b-[2px] outline-none transition-all placeholder-transparent"
                                />
                                <label className="absolute left-4 top-4 text-[#6b7280] text-[16px] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-focus:top-2 peer-focus:text-[12px] peer-focus:text-[#00E599] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[12px] pointer-events-none">
                                    Your Name
                                </label>
                            </div>

                            <div className="relative group">
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder=" "
                                    className="peer w-full h-[56px] px-4 pt-4 rounded-[4px] bg-[#f1f3f4] border-b-[1px] border-[#6b7280] focus:border-[#00E599] focus:border-b-[2px] outline-none transition-all placeholder-transparent"
                                />
                                <label className="absolute left-4 top-4 text-[#6b7280] text-[16px] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-focus:top-2 peer-focus:text-[12px] peer-focus:text-[#00E599] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[12px] pointer-events-none">
                                    Email Address
                                </label>
                            </div>

                            <div className="relative group">
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder=" "
                                    className="peer w-full h-[56px] px-4 pt-4 rounded-[4px] bg-[#f1f3f4] border-b-[1px] border-[#6b7280] focus:border-[#00E599] focus:border-b-[2px] outline-none transition-all placeholder-transparent"
                                />
                                <label className="absolute left-4 top-4 text-[#6b7280] text-[16px] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-focus:top-2 peer-focus:text-[12px] peer-focus:text-[#00E599] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[12px] pointer-events-none">
                                    Subject
                                </label>
                            </div>

                            <div className="relative group">
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder=" "
                                    rows={6}
                                    className="peer w-full px-4 pt-4 rounded-[4px] bg-[#f1f3f4] border-b-[1px] border-[#6b7280] focus:border-[#00E599] focus:border-b-[2px] outline-none transition-all placeholder-transparent resize-none"
                                />
                                <label className="absolute left-4 top-4 text-[#6b7280] text-[16px] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-focus:top-2 peer-focus:text-[12px] peer-focus:text-[#00E599] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[12px] pointer-events-none">
                                    Message
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="bg-[#00E599] hover:bg-[black] text-white rounded-[4px] px-8 h-[48px] text-[16px] font-medium shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send Message
                            </Button>

                            {submitted && (
                                <div className="bg-[#e6f4ea] border border-[#ceead6] rounded-[4px] p-4 text-[#137333] text-[14px]">
                                    Thank you! We'll get back to you soon.
                                </div>
                            )}
                        </form>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
