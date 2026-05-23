"use client";

import { Package, Cpu, Receipt, ShieldCheck } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Install the SDK",
        description:
            "Add quantacipher-sdk to your project with one npm command. Works with Node.js, browsers, and any JavaScript or TypeScript codebase.",
        code: "npm install quantacipher-sdk",
    },
    {
        number: "02",
        title: "Encrypt Locally via WASM",
        description:
            "Our Rust WASM engine runs NIST Kyber-1024 (ML-KEM) directly inside your JavaScript runtime. Your plaintext data never leaves your machine unencrypted.",
        code: "const encrypted = await qz.encryptLocal(sensitiveData);",
    },
    {
        number: "03",
        title: "Gateway Issues a Tamper-Proof Receipt",
        description:
            "The ciphertext is transmitted to our Gateway, which validates your API key, logs the event, and issues a cryptographic receipt with a timestamp.",
        code: "const receipt = await qz.sendToGateway(encrypted);",
    },
];

const stats = [
    { value: "3ms", label: "Avg. WASM Encrypt Time" },
    { value: "256-bit", label: "AES-GCM Symmetric Key" },
    { value: "1024", label: "Kyber Security Level" },
    { value: "0%", label: "Plaintext at Gateway" },
];

export function WhyChooseUs() {
    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest mb-4">
                        How It Works
                    </p>
                    <h2 className="text-[40px] sm:text-[48px] font-normal text-[#202124] mb-6 leading-tight">
                        Zero-trust encryption,{" "}
                        <span className="text-[#1a73e8]">zero complexity.</span>
                    </h2>
                    <p className="text-[18px] text-[#5f6368] max-w-2xl mx-auto leading-relaxed">
                        Quantum computers are coming. NIST issued the final standards in 2024.
                        QuantaCipher makes your app compliant today — in minutes, not months.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-6 mb-20">
                    {steps.map((step, i) => (
                        <div
                            key={step.number}
                            className="flex flex-col md:flex-row gap-6 p-8 bg-white border border-[#dadce0] rounded-[16px] hover:shadow-md transition-shadow duration-300"
                        >
                            {/* Step number */}
                            <div className="flex items-start gap-4 md:w-64 flex-shrink-0">
                                <div>
                                    <div className="text-[12px] font-bold text-[#9aa0a6] tracking-widest mb-1">
                                        STEP {step.number}
                                    </div>
                                    <h3 className="font-medium text-[18px] text-[#202124]">{step.title}</h3>
                                </div>
                            </div>

                            {/* Description + code */}
                            <div className="flex-1">
                                <p className="text-[15px] text-[#5f6368] leading-relaxed mb-4">
                                    {step.description}
                                </p>
                                <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-[8px] px-4 py-3 font-mono text-[13px] text-[#202124] flex items-center gap-2">
                                    <span className="text-[#9aa0a6] select-none">$</span>
                                    <span>{step.code}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="bg-white rounded-[16px] p-12 border border-[#dadce0]">
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <h3 className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">
                                Platform Specs
                            </h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-[48px] font-normal text-[#1a73e8] mb-1">{stat.value}</div>
                                <div className="text-[14px] text-[#5f6368]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Feature Badges */}
                <div className="mt-8 bg-white rounded-[16px] p-8 sm:p-12 border border-[#dadce0]">
                    <div className="text-center mb-10">
                        <h3 className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">
                            Built to Enterprise Standards
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Badge 1 */}
                        <div className="bg-white border border-[#dadce0] rounded-[8px] p-6 text-center">
                            <p className="text-[16px] font-medium text-[#202124] mb-1">NIST ML-KEM Ready</p>
                            <p className="text-[14px] text-[#5f6368]">FIPS 204 Standard</p>
                        </div>

                        {/* Badge 2 */}
                        <div className="bg-white border border-[#dadce0] rounded-[8px] p-6 text-center">
                            <p className="text-[16px] font-medium text-[#202124] mb-1">Zero-Trust Architecture</p>
                            <p className="text-[14px] text-[#5f6368]">No Private Key Escrow</p>
                        </div>

                        {/* Badge 3 */}
                        <div className="bg-white border border-[#dadce0] rounded-[8px] p-6 text-center">
                            <p className="text-[16px] font-medium text-[#202124] mb-1">End-to-End Encrypted</p>
                            <p className="text-[14px] text-[#5f6368]">AES-256-GCM Hybrid</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
