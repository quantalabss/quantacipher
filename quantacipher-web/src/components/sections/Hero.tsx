"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";

const badges = [
    { icon: Shield, text: "NIST ML-KEM Certified" },
    { icon: Lock, text: "Zero-Trust Architecture" },
    { icon: Zap, text: "2 Lines of Code" },
];

export function Hero() {
    return (
        <section className="relative pt-[128px] pb-24 overflow-hidden bg-white border-b border-[#dadce0]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="max-w-2xl">
                        <div className="max-w-4xl">
                            <h1 className="text-[56px] sm:text-[64px] leading-[1.1] font-bold tracking-tight text-[#202124] mb-8">
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
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/demo">
                                <Button size="lg" className="bg-[#1a73e8] hover:bg-[#1967d2] hover:shadow-md text-white rounded-[6px] px-8 h-[52px] text-[16px] font-medium transition-all shadow-sm">
                                    Try Live Demo
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/documentation">
                                <Button size="lg" variant="outline" className="border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa] rounded-[6px] px-8 h-[52px] text-[16px] font-medium transition-all">
                                    Read the Docs
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right side: Enlarged High-End Code Window */}
                    <div className="relative hidden lg:block w-full max-w-[650px] ml-auto">
                        <div className="relative z-10 bg-[#0d1117] rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.25)] font-mono text-[14px] sm:text-[15px] border border-[#30363d] overflow-hidden">
                            {/* Window Header */}
                            <div className="flex items-center bg-[#161b22] border-b border-[#30363d] px-4 py-3">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                </div>
                                <div className="mx-auto flex items-center gap-2 text-[#8b949e] text-[13px] font-medium">
                                    quantacipher-integration.ts
                                </div>
                            </div>

                            {/* Code Content */}
                            <div className="p-8 leading-[1.8]">
                                <div>
                                    <span className="text-[#8b949e]">// Install SDK via npm</span>
                                </div>
                                <div className="mb-5">
                                    <span className="text-[#8b949e]">// </span>
                                    <span className="text-[#ff7b72]">npm</span>
                                    <span className="text-[#c9d1d9]"> install quantacipher-sdk</span>
                                </div>

                                <div className="mb-6">
                                    <span className="text-[#ff7b72]">import</span>
                                    <span className="text-[#c9d1d9]"> {"{ "}</span>
                                    <span className="text-[#d2a8ff]">QuantaCipher</span>
                                    <span className="text-[#c9d1d9]">{" }"} </span>
                                    <span className="text-[#ff7b72]">from</span>
                                    <span className="text-[#a5d6ff]"> 'quantacipher-sdk'</span>
                                    <span className="text-[#c9d1d9]">;</span>
                                </div>

                                <div className="mb-2">
                                    <span className="text-[#8b949e]">// Encrypt patient record locally — Kyber-1024</span>
                                </div>
                                <div>
                                    <span className="text-[#ff7b72]">const</span>
                                    <span className="text-[#79c0ff]"> qz</span>
                                    <span className="text-[#ff7b72]"> = new</span>
                                    <span className="text-[#d2a8ff]"> QuantaCipher</span>
                                    <span className="text-[#c9d1d9]">{"({ "}</span>
                                </div>
                                <div className="pl-6">
                                    <span className="text-[#79c0ff]">apiKey</span>
                                    <span className="text-[#c9d1d9]">: process.env.</span>
                                    <span className="text-[#79c0ff]">QZ_KEY</span>
                                </div>
                                <div>
                                    <span className="text-[#c9d1d9]">{"});"}</span>
                                </div>
                                
                                <div className="mt-6">
                                    <span className="text-[#ff7b72]">await</span>
                                    <span className="text-[#79c0ff]"> qz</span>
                                    <span className="text-[#c9d1d9]">.</span>
                                    <span className="text-[#d2a8ff]">secureData</span>
                                    <span className="text-[#c9d1d9]">(</span>
                                    <span className="text-[#79c0ff]">patientRecord</span>
                                    <span className="text-[#c9d1d9]">, {"{ "}</span>
                                    <span className="text-[#79c0ff]">type</span>
                                    <span className="text-[#c9d1d9]">: </span>
                                    <span className="text-[#a5d6ff]">'ehr'</span>
                                    <span className="text-[#c9d1d9]"> {"});"}</span>
                                </div>

                                {/* Green receipt badge inside terminal */}
                                <div className="mt-8 pt-6 border-t border-[#30363d] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#2ea043] animate-pulse shadow-[0_0_8px_rgba(46,160,67,0.8)]" />
                                        <span className="text-[#2ea043] text-[13px] font-bold uppercase tracking-wider">Receipt Issued</span>
                                    </div>
                                    <span className="text-[#8b949e] text-[13px] font-medium">Kyber-1024</span>
                                </div>
                            </div>
                        </div>

                        {/* Subtle background glow effect behind IDE */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#1a73e8] to-[#34a853] rounded-[16px] blur-[30px] opacity-[0.15] -z-10 pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
}
