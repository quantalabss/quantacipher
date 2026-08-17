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
        <div className="min-h-screen bg-[#FCFBF9] font-sans">
            <Navbar />

            <main className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero */}
                    <div className="max-w-[800px] mb-16 border-b border-[#E8E5DF] pb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-bold text-[#111111] mb-6 tracking-tight font-serif">Technical Support</h1>
                            <p className="text-lg text-[#6B6356] font-medium leading-relaxed">
                                Need help integrating the SDK or managing your Post-Quantum gateway? We're here to assist.
                            </p>
                        </motion.div>
                    </div>

                    {/* Contact Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mb-16 pb-16 border-b border-[#E8E5DF]">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-[#FFFFFF] border border-[#E8E5DF] rounded p-8 hover:border-[#8b7355] transition-colors shadow-clean"
                        >
                            <div className="w-10 h-10 bg-[#FCFBF9] border border-[#E8E5DF] rounded flex items-center justify-center mb-6">
                                <Mail className="w-5 h-5 text-[#111111]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#111111] mb-2 font-serif">Enterprise Email</h3>
                            <p className="text-sm text-[#6B6356] mb-6 font-medium">
                                Direct support for integration, billing, and technical inquiries. SLA responses within 24 hours.
                            </p>
                            <a href="mailto:contact@quantalabs.cc" className="text-[#8b7355] hover:text-[#111111] text-sm font-bold uppercase tracking-widest transition-colors">
                                contact@quantalabs.cc
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-[#FFFFFF] border border-[#E8E5DF] rounded p-8 hover:border-[#8b7355] transition-colors shadow-clean"
                        >
                            <div className="w-10 h-10 bg-[#FCFBF9] border border-[#E8E5DF] rounded flex items-center justify-center mb-6">
                                <MessageCircle className="w-5 h-5 text-[#111111]" />
                            </div>
                            <h3 className="text-lg font-bold text-[#111111] mb-2 font-serif">Developer Docs</h3>
                            <p className="text-sm text-[#6B6356] mb-6 font-medium">
                                Access complete API references, quickstarts, and Kyber-1024 implementation details.
                            </p>
                            <Link href="https://quantachain.gitbook.io/quantacipher" target="_blank" rel="noopener noreferrer" className="text-[#8b7355] hover:text-[#111111] text-sm font-bold uppercase tracking-widest transition-colors">
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
                        <h2 className="text-2xl font-bold text-[#111111] mb-8 font-serif">Submit a Ticket</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#6B6356] uppercase tracking-widest">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-12 px-4 bg-[#FFFFFF] border border-[#E8E5DF] rounded focus:border-[#8b7355] focus:ring-1 focus:ring-[#8b7355] text-[#111111] text-sm outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#6B6356] uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-12 px-4 bg-[#FFFFFF] border border-[#E8E5DF] rounded focus:border-[#8b7355] focus:ring-1 focus:ring-[#8b7355] text-[#111111] text-sm outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#6B6356] uppercase tracking-widest">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full h-12 px-4 bg-[#FFFFFF] border border-[#E8E5DF] rounded focus:border-[#8b7355] focus:ring-1 focus:ring-[#8b7355] text-[#111111] text-sm outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#6B6356] uppercase tracking-widest">Message</label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={6}
                                    className="w-full p-4 bg-[#FFFFFF] border border-[#E8E5DF] rounded focus:border-[#8b7355] focus:ring-1 focus:ring-[#8b7355] text-[#111111] text-sm outline-none transition-all resize-none shadow-sm"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="bg-[#111111] hover:bg-[#2c2c2c] text-white rounded px-8 h-12 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-clean"
                            >
                                <Send className="w-4 h-4" />
                                Send Ticket
                            </Button>

                            {submitted && (
                                <div className="bg-[#FCFBF9] border border-[#8b7355] p-4 text-[#8b7355] rounded text-sm font-medium mt-4">
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
