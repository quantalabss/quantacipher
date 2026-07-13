"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function CTA() {
    return (
        <section className="py-24 bg-transparent border-t border-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#000000] border border-[#222] rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <span className="text-gray-500 font-semibold tracking-widest uppercase text-xs mb-6 block">
                            Enterprise Security
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight tracking-tighter">
                            Start securing data.<br />Before quantum hits.
                        </h2>
                        <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto font-medium leading-relaxed">
                            NIST finalized the post-quantum standards in 2024. Enterprises that wait will face costly retrofits.
                            Get compliant now — free, in under 15 minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signin" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded font-semibold hover:bg-gray-200 transition-colors text-sm">
                                Get your API keys <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <p className="text-gray-500 font-mono text-xs mt-8">
                            No credit card required. 100% free while in beta.
                        </p>
                    </div>

                    {/* Subtle grid lines inside CTA */}
                    <div 
                      className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
                      style={{
                        backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                      }}
                    />
                </div>
            </div>
        </section>
    );
}
