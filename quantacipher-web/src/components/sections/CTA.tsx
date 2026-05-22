"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#1a73e8] rounded-[24px] p-16 text-center relative overflow-hidden shadow-sm">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-[36px] sm:text-[44px] font-normal text-white mb-4 leading-tight">
                            Start securing data.<br />Before quantum hits.
                        </h2>
                        <p className="text-[16px] text-white/90 mb-8 max-w-lg mx-auto leading-relaxed">
                            NIST finalized the post-quantum standards in 2024. Enterprises that wait will face costly retrofits.
                            Get compliant now — free, in under 15 minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signin">
                                <Button
                                    size="lg"
                                    className="bg-white hover:bg-[#f8f9fa] text-[#1a73e8] rounded-[8px] px-8 h-[52px] text-[16px] font-medium shadow-none hover:shadow-lg transition-all"
                                >
                                    Get your API keys
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                        <p className="text-white/60 text-[13px] mt-6">
                            No credit card required. 100% free while in beta.
                        </p>
                    </div>

                    {/* Subtle background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a73e8] to-[#1557b0] opacity-50" />

                    {/* Decorative blobs */}
                    <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-20 -left-10 w-96 h-96 bg-white/5 rounded-full" />
                </div>
            </div>
        </section>
    );
}
