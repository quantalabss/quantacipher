"use client";

import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-[#f8f9fa] border-t border-[#dadce0] pt-16 pb-12">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-block mb-6">
                            <span className="text-[22px] font-normal text-[#5f6368] tracking-tight">
                                QuantaCipher
                            </span>
                        </Link>
                        <p className="text-[14px] leading-6 text-[#5f6368] mb-6 max-w-[240px]">
                             Post-quantum encryption API. NIST ML-KEM (Kyber-1024). Zero-trust, zero complexity.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-[14px] font-semibold text-[#202124] uppercase tracking-wider mb-6">Product</h3>
                        <ul className="space-y-4">
                            <li><Link href="/dashboard" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Dashboard</Link></li>
                            <li><Link href="#how-it-works" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">How it works</Link></li>
                            <li><Link href="#pricing" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Pricing</Link></li>
                            <li><Link href="#integrations" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Integrations</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[14px] font-semibold text-[#202124] uppercase tracking-wider mb-6">Support</h3>
                        <ul className="space-y-4">
                            <li><Link href="/documentation" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Documentation</Link></li>
                            <li><Link href="/support" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[14px] font-semibold text-[#202124] uppercase tracking-wider mb-6">Legal</h3>
                        <ul className="space-y-4">
                            <li><Link href="/privacy" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Terms of Service</Link></li>
                            <li><Link href="/security" className="text-[14px] text-[#5f6368] hover:text-[#1a73e8] transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-[#dadce0] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[14px] text-[#9aa0a6]">
                        © {new Date().getFullYear()} QuantaCipher Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-[14px] text-[#5f6368]">All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
