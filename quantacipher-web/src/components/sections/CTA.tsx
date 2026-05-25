"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function CTA() {
    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-black rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <span className="text-[#00E599] font-black tracking-widest uppercase text-xs mb-6 block">
                            Enterprise Security
                        </span>
                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tighter">
                            Start securing data.<br />Before quantum hits.
                        </h2>
                        <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto font-medium leading-relaxed">
                            NIST finalized the post-quantum standards in 2024. Enterprises that wait will face costly retrofits.
                            Get compliant now — free, in under 15 minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signin" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#00E599] text-black rounded-full font-bold hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-wider">
                                Get your API keys <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <p className="text-gray-500 font-mono text-xs mt-8">
                            No credit card required. 100% free while in beta.
                        </p>
                    </div>

                    {/* Subtle background effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00E599]/10 to-transparent opacity-50" />
                    
                    {/* Decorative abstract elements */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00E599]/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#00E599]/5 rounded-full blur-3xl pointer-events-none" />
                </div>
            </div>
        </section>
    );
}
