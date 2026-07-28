"use client";

import { motion } from "framer-motion";
import { Shield, Key, Database, ArrowRight } from "lucide-react";

const services = [
    {
        icon: Shield,
        title: "Post-Quantum Security",
        description: "Secure your endpoints with Kyber-1024 cryptography. Future-proof your infrastructure against quantum threats.",
    },
    {
        icon: Key,
        title: "Zero-Trust API Keys",
        description: "Manage dynamic, auto-rotating API keys with granular access controls and usage limits.",
    },
    {
        icon: Database,
        title: "Secure Analytics",
        description: "Monitor your cryptographic usage and secured bytes in real-time through our intuitive dashboard.",
    },
];

export function Services() {
    return (
        <section id="features" className="py-24 bg-transparent">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-[40px] sm:text-[48px] font-normal text-[#202124] mb-4">
                        Everything you need for API security
                    </h2>
                    <p className="text-[18px] text-[#5f6368] max-w-2xl mx-auto">
                        Comprehensive Zero-Trust tools built for modern engineering teams.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group bg-white border border-[#dadce0] rounded-[12px] p-8 hover:shadow-lg hover:border-[#d2e3fc] transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-[#e8f0fe] rounded-[8px] flex items-center justify-center mb-6 group-hover:bg-[#1a73e8] transition-colors">
                                <service.icon className="w-6 h-6 text-[#1a73e8] group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-[20px] font-medium text-[#202124] mb-3">
                                {service.title}
                            </h3>
                            <p className="text-[15px] text-[#5f6368] leading-relaxed mb-4">
                                {service.description}
                            </p>
                            <button className="inline-flex items-center text-[#1a73e8] text-[14px] font-medium hover:gap-2 transition-all">
                                Learn more <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
