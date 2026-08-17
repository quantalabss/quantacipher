"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Code, Terminal } from "lucide-react";

export default function ApiReferencePage() {
    return (
        <div className="min-h-screen bg-[#FCFBF9] text-[#111111] relative font-sans">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-[48px] font-bold text-[#111111] mb-4 font-serif">API Reference</h1>
                        <p className="text-[18px] text-[#6B6356] mb-12 font-medium">
                            Integrate post-quantum encryption into your applications with our REST API.
                        </p>

                        <div className="space-y-12">
                            {/* Authentication */}
                            <section>
                                <h2 className="text-[24px] font-bold text-[#111111] mb-4 flex items-center gap-2 font-serif">
                                    <Terminal className="w-6 h-6 text-[#8b7355]" /> Authentication
                                </h2>
                                <p className="text-[16px] text-[#6B6356] leading-relaxed mb-4 font-medium">
                                    All API requests must be authenticated via a Bearer token in the Authorization header. You can generate an API key from your dashboard.
                                </p>
                                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded p-4 font-mono text-[14px] text-[#6B6356] shadow-sm">
                                    Authorization: Bearer qkc_live_xxxxxxxxxxxxxxxxx
                                </div>
                            </section>

                            {/* Endpoints */}
                            <section>
                                <h2 className="text-[24px] font-bold text-[#111111] mb-4 flex items-center gap-2 font-serif">
                                    <Code className="w-6 h-6 text-[#8b7355]" /> Endpoints
                                </h2>
                                
                                {/* Encrypt */}
                                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded overflow-hidden mb-6 shadow-clean">
                                    <div className="bg-[#FCFBF9] border-b border-[#E8E5DF] px-6 py-4 flex items-center gap-4">
                                        <span className="bg-[#111111] text-white px-3 py-1 rounded text-[12px] font-bold uppercase tracking-widest shadow-clean">POST</span>
                                        <span className="font-mono text-[15px] text-[#111111] font-bold">/v1/encrypt</span>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[15px] text-[#6B6356] mb-4 font-medium">
                                            Encrypts a plaintext payload using NIST Kyber-1024.
                                        </p>
                                        <h4 className="text-[14px] font-bold text-[#111111] mb-2 uppercase tracking-widest font-sans">Request Body</h4>
                                        <pre className="bg-[#FCFBF9] border border-[#E8E5DF] p-4 rounded text-[13px] text-[#6B6356] overflow-x-auto shadow-inner font-mono">
{`{
  "plaintext": "string",
  "algorithm": "kyber1024-aesgcm" // Optional, defaults to kyber1024
}`}
                                        </pre>
                                    </div>
                                </div>

                                {/* Decrypt */}
                                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded overflow-hidden shadow-clean">
                                    <div className="bg-[#FCFBF9] border-b border-[#E8E5DF] px-6 py-4 flex items-center gap-4">
                                        <span className="bg-[#111111] text-white px-3 py-1 rounded text-[12px] font-bold uppercase tracking-widest shadow-clean">POST</span>
                                        <span className="font-mono text-[15px] text-[#111111] font-bold">/v1/decrypt</span>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[15px] text-[#6B6356] mb-4 font-medium">
                                            Decrypts a quantum-safe ciphertext.
                                        </p>
                                        <h4 className="text-[14px] font-bold text-[#111111] mb-2 uppercase tracking-widest font-sans">Request Body</h4>
                                        <pre className="bg-[#FCFBF9] border border-[#E8E5DF] p-4 rounded text-[13px] text-[#6B6356] overflow-x-auto shadow-inner font-mono">
{`{
  "ciphertext": "string"
}`}
                                        </pre>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

