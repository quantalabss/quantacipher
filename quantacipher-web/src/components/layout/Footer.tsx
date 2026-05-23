"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white border-t border-[#dadce0] pt-16 pb-12">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-block mb-6">
                            <span className="text-[22px] font-bold text-[#202124] tracking-tighter">
                                QuantaCipher
                            </span>
                        </Link>
                        <p className="text-[14px] leading-6 text-[#5f6368] mb-6 max-w-[240px]">
                            Enterprise post-quantum encryption API. NIST ML-KEM (Kyber-1024). Zero-trust, zero complexity.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-[12px] font-bold text-[#202124] uppercase tracking-widest mb-6">Product</h3>
                        <ul className="space-y-4">
                            <li><Link href="/dashboard" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Dashboard</Link></li>
                            <li><Link href="/documentation" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Documentation</Link></li>
                            <li><Link href="#integrations" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Integrations</Link></li>
                            <li><Link href="#pricing" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[12px] font-bold text-[#202124] uppercase tracking-widest mb-6">Developers</h3>
                        <ul className="space-y-4">
                            <li><Link href="/documentation#nodejs" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Node.js SDK</Link></li>
                            <li><Link href="/documentation#rest" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">REST API</Link></li>
                            <li><Link href="https://github.com/xaexaex/quantacipher" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">GitHub</Link></li>
                            <li><Link href="/support" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[12px] font-bold text-[#202124] uppercase tracking-widest mb-6">Legal</h3>
                        <ul className="space-y-4">
                            <li><Link href="/privacy" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Terms of Service</Link></li>
                            <li><Link href="/security" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Security Overview</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-[#dadce0] flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-[13px] text-[#9aa0a6]">
                        © {new Date().getFullYear()} QuantaCipher Inc. All rights reserved.
                    </p>
                    <div className="flex items-center justify-center border border-[#dadce0] px-4 py-1.5 rounded-full">
                        <span className="text-[12px] font-medium text-[#5f6368]">NIST Approved</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
