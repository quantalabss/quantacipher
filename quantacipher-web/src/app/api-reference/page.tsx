"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Code, Terminal } from "lucide-react";

export default function ApiReferencePage() {
    return (
        <div className="min-h-screen bg-[#000000] text-white relative">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-[48px] font-normal text-white mb-4">API Reference</h1>
                        <p className="text-[18px] text-gray-400 mb-12">
                            Integrate post-quantum encryption into your applications with our REST API.
                        </p>

                        <div className="space-y-12">
                            {/* Authentication */}
                            <section>
                                <h2 className="text-[24px] font-medium text-white mb-4 flex items-center gap-2">
                                    <Terminal className="w-6 h-6 text-[#C4ED5F]" /> Authentication
                                </h2>
                                <p className="text-[16px] text-gray-400 leading-relaxed mb-4">
                                    All API requests must be authenticated via a Bearer token in the Authorization header. You can generate an API key from your dashboard.
                                </p>
                                <div className="bg-[#111] border border-[#222] rounded-none p-4 font-mono text-[14px] text-gray-400">
                                    Authorization: Bearer qkc_live_xxxxxxxxxxxxxxxxx
                                </div>
                            </section>

                            {/* Endpoints */}
                            <section>
                                <h2 className="text-[24px] font-medium text-white mb-4 flex items-center gap-2">
                                    <Code className="w-6 h-6 text-[#C4ED5F]" /> Endpoints
                                </h2>
                                
                                {/* Encrypt */}
                                <div className="bg-[#111] border border-[#222] rounded-none overflow-hidden mb-6">
                                    <div className="bg-[#0f0f0f] border-b border-[#222] px-6 py-4 flex items-center gap-4">
                                        <span className="bg-[#C4ED5F] text-black px-3 py-1 rounded-none text-[12px] font-bold">POST</span>
                                        <span className="font-mono text-[15px] text-white">/v1/encrypt</span>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[15px] text-gray-400 mb-4">
                                            Encrypts a plaintext payload using NIST Kyber-1024.
                                        </p>
                                        <h4 className="text-[14px] font-medium text-white mb-2">Request Body</h4>
                                        <pre className="bg-[#0a0a0a] border border-[#222] p-4 rounded-none text-[13px] text-gray-400 overflow-x-auto">
{`{
  "plaintext": "string",
  "algorithm": "kyber1024-aesgcm" // Optional, defaults to kyber1024
}`}
                                        </pre>
                                    </div>
                                </div>

                                {/* Decrypt */}
                                <div className="bg-[#111] border border-[#222] rounded-none overflow-hidden">
                                    <div className="bg-[#0f0f0f] border-b border-[#222] px-6 py-4 flex items-center gap-4">
                                        <span className="bg-[#C4ED5F] text-black px-3 py-1 rounded-none text-[12px] font-bold">POST</span>
                                        <span className="font-mono text-[15px] text-white">/v1/decrypt</span>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[15px] text-gray-400 mb-4">
                                            Decrypts a quantum-safe ciphertext.
                                        </p>
                                        <h4 className="text-[14px] font-medium text-white mb-2">Request Body</h4>
                                        <pre className="bg-[#0a0a0a] border border-[#222] p-4 rounded-none text-[13px] text-gray-400 overflow-x-auto">
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

