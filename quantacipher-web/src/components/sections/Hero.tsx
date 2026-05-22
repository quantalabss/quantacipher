"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";

const badges = [
    { icon: Shield, text: "NIST ML-KEM Certified" },
    { icon: Lock, text: "Zero-Trust Architecture" },
    { icon: Zap, text: "2 Lines of Code" },
];

export function Hero() {
    return (
        <section className="relative pt-[128px] pb-24 overflow-hidden bg-white">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="max-w-4xl"
                        >


                            <h1 className="text-[56px] sm:text-[72px] leading-[1.1] font-normal tracking-tight text-[#202124] mb-8">
                                Post-Quantum Security{" "}
                                <span className="text-[#1a73e8]">in two lines of code.</span>
                            </h1>
                            <p className="text-[20px] sm:text-[22px] leading-[1.6] text-[#5f6368] mb-8 max-w-xl">
                                Protect your enterprise data from quantum computer attacks today.
                                Our SDK encrypts everything locally on your machine before it ever hits a network — zero trust, zero compromise.
                            </p>

                            {/* Inline badges */}
                            <div className="flex flex-wrap gap-3 mb-10">
                                {badges.map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-2 bg-[#f8f9fa] border border-[#dadce0] rounded-full px-3 py-1.5">
                                        <Icon className="w-3.5 h-3.5 text-[#5f6368]" />
                                        <span className="text-[12px] text-[#5f6368] font-medium">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Link href="/signin">
                                <Button size="lg" className="bg-[#1a73e8] hover:bg-[#1967d2] hover:shadow-md text-white rounded-[4px] px-8 h-[48px] text-[16px] font-medium transition-all shadow-sm">
                                    Get your free API Key
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="#how-it-works">
                                <Button size="lg" variant="outline" className="border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa] rounded-[4px] px-8 h-[48px] text-[16px] font-medium transition-all">
                                    See how it works
                                </Button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right side: Code snippet + animated visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative hidden lg:block"
                    >
                        {/* Code card on top */}
                        <div className="relative z-10 bg-[#202124] rounded-[16px] p-6 shadow-2xl mb-4 font-mono text-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-[#ea4335]" />
                                <div className="w-3 h-3 rounded-full bg-[#fbbc04]" />
                                <div className="w-3 h-3 rounded-full bg-[#34a853]" />
                                <span className="ml-2 text-[#9aa0a6] text-xs">your-app.ts</span>
                            </div>
                            <div className="space-y-1 text-[13px] leading-relaxed">
                                <div>
                                    <span className="text-[#9aa0a6]">// Install: </span>
                                    <span className="text-[#8ab4f8]">npm install quantacipher-sdk</span>
                                </div>
                                <div className="mt-3">
                                    <span className="text-[#c586c0]">import </span>
                                    <span className="text-[#9cdcfe]">{"{ QuantaCipher }"}</span>
                                    <span className="text-[#c586c0]"> from </span>
                                    <span className="text-[#ce9178]">'quantacipher-sdk'</span>
                                    <span className="text-[#d4d4d4]">;</span>
                                </div>
                                <div className="mt-3">
                                    <span className="text-[#569cd6]">const </span>
                                    <span className="text-[#9cdcfe]">qz</span>
                                    <span className="text-[#d4d4d4]"> = </span>
                                    <span className="text-[#569cd6]">new </span>
                                    <span className="text-[#4ec9b0]">QuantaCipher</span>
                                    <span className="text-[#d4d4d4]">{"({"}</span>
                                </div>
                                <div className="pl-4">
                                    <span className="text-[#9cdcfe]">apiKey</span>
                                    <span className="text-[#d4d4d4]">: </span>
                                    <span className="text-[#ce9178]">'qz_live_xxxx'</span>
                                </div>
                                <div><span className="text-[#d4d4d4]">{"});"}</span></div>
                                <div className="mt-3">
                                    <span className="text-[#9aa0a6]">// That's it. Your data is quantum-safe. ✓</span>
                                </div>
                                <div>
                                    <span className="text-[#c586c0]">await </span>
                                    <span className="text-[#9cdcfe]">qz</span>
                                    <span className="text-[#d4d4d4]">.</span>
                                    <span className="text-[#dcdcaa]">secureData</span>
                                    <span className="text-[#d4d4d4]">(</span>
                                    <span className="text-[#9cdcfe]">patientRecord</span>
                                    <span className="text-[#d4d4d4]">);</span>
                                </div>
                            </div>
                            {/* Green receipt badge */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2, duration: 0.4 }}
                                className="mt-4 flex items-center gap-2 bg-[#137333]/20 border border-[#34a853]/30 rounded-[8px] px-3 py-2"
                            >
                                <div className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
                                <span className="text-[#34a853] text-[12px] font-medium">Receipt issued • Kyber-1024 encrypted • 1.2ms</span>
                            </motion.div>
                        </div>

                        {/* Animated blobs behind */}
                        <div className="absolute inset-0 -z-10 rounded-[24px] overflow-hidden opacity-30">
                            <motion.div
                                animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-[10%] left-[10%] w-[160px] h-[160px] bg-[#4285F4] rounded-full mix-blend-multiply"
                            />
                            <motion.div
                                animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute top-[30%] right-[20%] w-[200px] h-[200px] bg-[#34A853] rounded-full mix-blend-multiply"
                            />
                            <motion.div
                                animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-[15%] left-[30%] w-[140px] h-[140px] bg-[#1a73e8] rounded-full mix-blend-multiply"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
