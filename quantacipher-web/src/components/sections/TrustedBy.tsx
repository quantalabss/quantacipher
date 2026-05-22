"use client";

import { motion } from "framer-motion";
import {
    Building2,
    HeartPulse,
    Scale,
    Shield,
    BadgeCheck,
    Lock,
} from "lucide-react";

const industries = [
    { name: "Healthcare", icon: HeartPulse, color: "text-[#ea4335]", bg: "bg-[#fce8e6]" },
    { name: "FinTech", icon: Building2, color: "text-[#1a73e8]", bg: "bg-[#e8f0fe]" },
    { name: "Legal & Compliance", icon: Scale, color: "text-[#fbbc04]", bg: "bg-[#fef9e0]" },
    { name: "Government", icon: Shield, color: "text-[#34a853]", bg: "bg-[#e6f4ea]" },
    { name: "Insurance", icon: BadgeCheck, color: "text-[#9334e6]", bg: "bg-[#f3e8fd]" },
    { name: "Enterprise SaaS", icon: Lock, color: "text-[#1a73e8]", bg: "bg-[#e8f0fe]" },
];

// Duplicate for continuous scroll effect
const allIndustries = [...industries, ...industries, ...industries];

export function TrustedBy() {
    return (
        <section className="py-16 bg-white border-b border-[#dadce0] overflow-hidden">
            <div className="max-w-[1440px] mx-auto text-center mb-10 px-4">
                <h2 className="text-[12px] font-bold text-[#5f6368] tracking-[0.2em] uppercase">
                    Built for compliance-critical industries
                </h2>
            </div>

            <div className="relative flex overflow-hidden">
                {/* Gradient Masks for smooth fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>

                <motion.div
                    className="flex gap-16 items-center flex-nowrap pl-4"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 40
                    }}
                >
                    {allIndustries.map((industry, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 group cursor-default"
                        >
                            <div className={`p-3 rounded-full ${industry.bg} group-hover:opacity-80 transition-opacity ${industry.color}`}>
                                <industry.icon className="w-6 h-6 stroke-[2]" />
                            </div>
                            <span className="text-[18px] font-medium text-[#3c4043] group-hover:text-[#202124] transition-colors tracking-tight whitespace-nowrap">
                                {industry.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
