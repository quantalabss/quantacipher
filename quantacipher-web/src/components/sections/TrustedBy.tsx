"use client";

import { motion } from "framer-motion";
const industries = [
    { name: "Healthcare" },
    { name: "FinTech" },
    { name: "Legal & Compliance" },
    { name: "Government" },
    { name: "Insurance" },
    { name: "Enterprise SaaS" },
];

// Duplicate for continuous scroll effect
const allIndustries = [...industries, ...industries, ...industries];

export function TrustedBy() {
    return (
        <section className="py-16 bg-white border-b border-[#dadce0] overflow-hidden">
            <div className="max-w-[1440px] mx-auto text-center mb-10 px-4">
                <h2 className="text-[14px] font-bold text-[#5f6368] tracking-[0.2em] uppercase">
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
                        <div key={index}>
                            <span className="text-[22px] font-medium text-[#5f6368] group-hover:text-[#202124] transition-colors tracking-tight whitespace-nowrap px-4 py-2 border border-transparent group-hover:border-[#dadce0] rounded-full">
                                {industry.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
