"use client";

import { motion } from "framer-motion";
import { Package, Cpu, Receipt, ShieldCheck } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Package,
        title: "Install the SDK",
        description:
            "Add quantacipher-sdk to your project with one npm command. Works with Node.js, browsers, and any JavaScript or TypeScript codebase.",
        code: "npm install quantacipher-sdk",
        color: "#1a73e8",
        bg: "#e8f0fe",
    },
    {
        number: "02",
        icon: Cpu,
        title: "Encrypt Locally via WASM",
        description:
            "Our Rust WASM engine runs NIST Kyber-1024 (ML-KEM) directly inside your JavaScript runtime. Your plaintext data never leaves your machine unencrypted.",
        code: "const encrypted = await qz.encryptLocal(sensitiveData);",
        color: "#34a853",
        bg: "#e6f4ea",
    },
    {
        number: "03",
        icon: Receipt,
        title: "Gateway Issues a Tamper-Proof Receipt",
        description:
            "The ciphertext is transmitted to our Gateway, which validates your API key, logs the event, and issues a cryptographic receipt with a timestamp.",
        code: "const receipt = await qz.sendToGateway(encrypted);",
        color: "#fbbc04",
        bg: "#fef9e0",
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
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="flex flex-col md:flex-row gap-6 p-8 bg-white border border-[#dadce0] rounded-[16px] hover:shadow-md transition-shadow duration-300"
                        >
                            {/* Step number + icon */}
                            <div className="flex items-start gap-4 md:w-64 flex-shrink-0">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: step.bg }}
                                >
                                    <step.icon className="w-6 h-6" style={{ color: step.color }} />
                                </div>
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
                        </motion.div>
                    ))}
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-[16px] p-12 border border-[#dadce0]"
                >
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <ShieldCheck className="w-5 h-5 text-[#1a73e8]" />
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
                </motion.div>
            </div>
        </section>
    );
}
