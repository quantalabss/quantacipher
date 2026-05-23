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
        <section id="how-it-works" className="py-16 sm:py-24 bg-white">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-[14px] font-bold text-[#5f6368] uppercase tracking-widest mb-4">
                        How It Works
                    </p>
                    <h2 className="text-[32px] sm:text-[48px] font-normal text-[#202124] mb-6 leading-tight">
                        Zero-trust encryption,{" "}
                        <span className="text-[#1a73e8]">zero complexity.</span>
                    </h2>
                    <p className="text-[20px] text-[#5f6368] max-w-2xl mx-auto leading-relaxed">
                        Quantum computers are coming. NIST issued the final standards in 2024.
                        QuantaCipher makes your app compliant today — in minutes, not months.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
                    {steps.map((step, i) => (
                        <div
                            key={step.number}
                            className="flex flex-col p-8 bg-white border border-[#dadce0] rounded-[16px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Step Header */}
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] font-bold text-[14px] mb-4">
                                    {step.number}
                                </div>
                                <h3 className="font-medium text-[20px] text-[#202124]">{step.title}</h3>
                            </div>

                            {/* Description */}
                            <p className="text-[16px] text-[#5f6368] leading-relaxed mb-8 flex-grow">
                                {step.description}
                            </p>

                            {/* Code snippet */}
                            <div className="bg-[#1e2433] rounded-[8px] p-4 font-mono text-[13px] text-[#e8eaed] mt-auto relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <span className="text-[#5c6b8a] select-none mr-2">❯</span>
                                <span className="text-[#d4d4d4]">{step.code}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="bg-white rounded-[16px] p-12 border border-[#dadce0]">
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <h3 className="text-[14px] font-bold text-[#5f6368] uppercase tracking-widest">
                                Platform Specs
                            </h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-[48px] font-normal text-[#1a73e8] mb-1">{stat.value}</div>
                                <div className="text-[16px] text-[#5f6368]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </section>
    );
}
