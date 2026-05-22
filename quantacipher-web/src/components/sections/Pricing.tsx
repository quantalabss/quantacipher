"use client";

import { Check, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const plans = [
    {
        name: "QuantaCipher Free",
        price: "$0",
        description: "100% free for early-stage startups and developers exploring post-quantum security.",
        features: [
            "Unlimited API keys",
            "Unlimited API calls",
            "Kyber-1024 WASM encryption",
            "Cryptographic receipt per call",
            "Community support",
            "No credit card required",
        ],
        buttonText: "Start for free",
        buttonVariant: "primary",
        popular: true,
        callsLimit: "Unlimited calls",
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-[#f8f9fa]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest mb-4">
                        Pricing
                    </p>
                    <h2 className="text-[32px] sm:text-[40px] leading-[48px] font-normal text-[#202124] mb-4">
                        100% Free while in Beta
                    </h2>
                    <p className="text-[18px] text-[#5f6368] max-w-2xl mx-auto">
                        We believe post-quantum security should be accessible to everyone. Get unlimited access during our beta period.
                    </p>
                </div>

                <div className="max-w-md mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`
                                relative p-8 rounded-[12px] bg-white flex flex-col items-start h-full transition-all duration-200
                                border-2 border-[#1a73e8] shadow-lg ring-4 ring-[#1a73e8]/10
                            `}
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a73e8] text-white text-[11px] font-semibold px-4 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                <Star className="w-3 h-3 fill-white" />
                                Beta Launch
                            </div>

                            <h3 className="text-[16px] font-semibold text-[#5f6368] mb-3">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-[48px] font-normal text-[#202124]">{plan.price}</span>
                            </div>
                            {/* Calls badge */}
                            <div className="bg-[#f1f3f4] text-[#3c4043] text-[12px] font-medium px-3 py-1 rounded-full mb-4">
                                {plan.callsLimit}
                            </div>
                            <p className="text-[14px] text-[#5f6368] mb-6 min-h-[56px] leading-relaxed">
                                {plan.description}
                            </p>

                            <Link
                                href="/signin"
                                className="w-full mb-8"
                            >
                                <Button
                                    className={`w-full h-[44px] rounded-[6px] text-[14px] font-medium transition-all bg-[#1a73e8] hover:bg-[#1967d2] text-white shadow-sm`}
                                >
                                    {plan.buttonText}
                                </Button>
                            </Link>

                            <div className="space-y-3 flex-grow w-full">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check className="w-4 h-4 text-[#34a853] flex-shrink-0 mt-0.5" />
                                        <span className="text-[13px] text-[#3c4043]">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
