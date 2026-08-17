"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function CTA() {
    return (
        <section className="py-24 bg-[#FCFBF9] border-t border-[#E8E5DF]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded shadow-clean p-12 md:p-20 text-center relative overflow-hidden font-sans">

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <span className="text-[#8b7355] font-semibold tracking-widest uppercase text-xs mb-6 block bg-[#FCFBF9] border border-[#E8E5DF] px-3 py-1.5 rounded-sm inline-block">
                            Enterprise Security
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] mb-6 leading-tight tracking-tight mt-4 font-serif text-balance">
                            Start securing data.<br />Before quantum hits.
                        </h2>
                        <p className="text-lg text-[#6B6356] mb-10 max-w-lg mx-auto font-medium leading-relaxed">
                            NIST finalized the post-quantum standards. Enterprises that wait will face costly retrofits.
                            Get compliant now — free, in under 15 minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signin" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#111111] text-white rounded font-semibold hover:bg-[#2c2c2c] transition-all duration-200 text-sm shadow-clean">
                                Get your API keys <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <p className="text-[#6B6356] font-mono text-xs mt-8 font-medium">
                            No credit card required. 100% free while in beta.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
