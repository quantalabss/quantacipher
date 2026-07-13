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
        <div className="min-h-screen bg-[#000000]">
            <Navbar />

            <main className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero */}
                    <div className="max-w-[800px] mb-16 border-b border-[#222] pb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6 tracking-tight">Technical Support</h1>
                            <p className="text-lg text-gray-400 font-medium leading-relaxed">
                                Need help integrating the SDK or managing your Post-Quantum gateway? We're here to assist.
                            </p>
                        </motion.div>
                    </div>

                    {/* Contact Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mb-16 pb-16 border-b border-[#222]">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-[#000] border border-[#222] p-8 hover:bg-[#0a0a0a] transition-colors"
                        >
                            <div className="w-10 h-10 bg-[#111] border border-[#222] flex items-center justify-center mb-6">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Enterprise Email</h3>
                            <p className="text-sm text-gray-400 mb-6 font-medium">
                                Direct support for integration, billing, and technical inquiries. SLA responses within 24 hours.
                            </p>
                            <a href="mailto:contact@quantalabs.cc" className="text-[#C4ED5F] hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
                                contact@quantalabs.cc
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-[#000] border border-[#222] p-8 hover:bg-[#0a0a0a] transition-colors"
                        >
                            <div className="w-10 h-10 bg-[#111] border border-[#222] flex items-center justify-center mb-6">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Developer Docs</h3>
                            <p className="text-sm text-gray-400 mb-6 font-medium">
                                Access complete API references, quickstarts, and Kyber-1024 implementation details.
                            </p>
                            <Link href="https://quantachain.gitbook.io/quantacipher" target="_blank" rel="noopener noreferrer" className="text-[#C4ED5F] hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
                                View Documentation
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
                        <h2 className="text-2xl font-semibold text-white mb-8">Submit a Ticket</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-12 px-4 bg-[#0a0a0a] border border-[#222] focus:border-[#C4ED5F] text-white text-sm outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-12 px-4 bg-[#0a0a0a] border border-[#222] focus:border-[#C4ED5F] text-white text-sm outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full h-12 px-4 bg-[#0a0a0a] border border-[#222] focus:border-[#C4ED5F] text-white text-sm outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Message</label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={6}
                                    className="w-full p-4 bg-[#0a0a0a] border border-[#222] focus:border-[#C4ED5F] text-white text-sm outline-none transition-colors resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="bg-white hover:bg-[#C4ED5F] text-black rounded-none px-8 h-12 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                Send Ticket
                            </Button>

                            {submitted && (
                                <div className="bg-[#111] border border-[#222] p-4 text-[#C4ED5F] text-sm font-medium mt-4">
                                    Ticket submitted successfully. Our team will contact you shortly.
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
