import { Check, Star, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Developer",
        price: "$0",
        period: "/mo",
        description: "Perfect for exploring post-quantum security in development and production environments.",
        features: [
            "10,000 API calls / month",
            "Kyber-1024 WASM encryption",
            "Node.js & Browser SDKs",
            "Python SDK",
            "Community Discord support",
            "1 API Key",
        ],
        buttonText: "Start for free",
        buttonVariant: "primary",
        popular: false,
        available: true,
        cta: "/signin",
    },
    {
        name: "Startup",
        price: "$239",
        period: "/mo",
        description: "For small teams needing more capacity and basic SLAs.",
        features: [
            "100,000 API calls / month",
            "Everything in Developer",
            "99.9% Uptime SLA",
            "Email support (48h SLA)",
            "Basic usage analytics",
            "Up to 5 API Keys",
        ],
        buttonText: "Get Started",
        buttonVariant: "primary",
        popular: false,
        available: true,
        cta: "/signin?callbackUrl=/dashboard/billing",
    },
    {
        name: "Professional",
        price: "$499",
        period: "/mo",
        description: "For production applications handling sensitive enterprise data.",
        features: [
            "1,000,000 API calls / month",
            "Everything in Startup",
            "Priority email support (24h SLA)",
            "Advanced analytics dashboard",
            "Up to 10 API Keys",
            "Audit log export",
        ],
        buttonText: "Get Started",
        buttonVariant: "primary",
        popular: true,
        available: true,
        cta: "/signin?callbackUrl=/dashboard/billing",
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "Maximum limits, dedicated infrastructure, and white-glove onboarding.",
        features: [
            "Unlimited API calls",
            "Dedicated gateway instances",
            "Dedicated Slack channel",
            "24/7 Phone support",
            "Custom integrations",
        ],
        buttonText: "Contact Sales",
        buttonVariant: "outline",
        popular: false,
        available: true,
        cta: "mailto:contact@quantalabs.cc",
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-[#FCFBF9] border-t border-[#E8E5DF]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#8b7355] mb-4 font-sans">
                        Pricing
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight mb-4 leading-tight font-serif text-balance">
                        Simple, predictable pricing.
                    </h2>
                    <p className="text-base text-[#6B6356] max-w-xl mx-auto font-medium font-sans">
                        Whether you're building a weekend project or an enterprise healthcare app, we have a plan that fits.
                    </p>
                </div>

                {/* Beta banner */}
                <div className="flex justify-center mb-12 font-sans">
                    <div className="flex items-center gap-3 px-5 py-3 rounded bg-[#FFFFFF] shadow-clean border border-[#E8E5DF]">
                        <p className="text-[13px] font-medium text-[#6B6356]">
                            <span className="font-semibold text-[#111111]">Beta period:</span> Early access pricing is now available for all plans.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`
                                relative p-7 flex flex-col h-full transition-all duration-300 bg-[#FFFFFF] rounded border 
                                ${!plan.available ? "opacity-70" : ""}
                                ${plan.popular
                                    ? "border-[#8b7355] shadow-clean -translate-y-1"
                                    : "border-[#E8E5DF] hover:border-[#8b7355] hover:shadow-clean hover:-translate-y-1"
                                }
                            `}
                        >
                            {/* Coming Soon overlay badge */}
                            {!plan.available && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FCFBF9] border border-[#E8E5DF]">
                                    <Lock className="w-3 h-3 text-[#6B6356]" />
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6356]">Soon</span>
                                </div>
                            )}

                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111111] text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded flex items-center gap-1.5 shadow-clean whitespace-nowrap">
                                    <Star className="w-3 h-3 fill-white text-white" />
                                    Recommended
                                </div>
                            )}

                            <h3 className={`text-lg font-bold tracking-tight mb-2 text-[#111111] font-serif`}>
                                {plan.name}
                            </h3>
                            <p className={`text-sm mb-6 min-h-[72px] leading-relaxed font-medium text-[#6B6356]`}>
                                {plan.description}
                            </p>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className={`text-4xl font-bold tracking-tighter text-[#111111] font-serif`}>
                                    {plan.price}
                                </span>
                                <span className={`font-medium text-sm text-[#6B6356]`}>
                                    {plan.period}
                                </span>
                            </div>

                            {/* CTA Button */}
                            {plan.available ? (
                                <Link
                                    href={plan.cta}
                                    className={`w-full mb-6 flex items-center justify-center gap-2 px-5 py-3 rounded text-sm font-semibold transition-all ${
                                        plan.popular
                                            ? "bg-[#111111] text-white hover:bg-[#2c2c2c] shadow-clean"
                                            : "bg-[#FFFFFF] border border-[#E8E5DF] text-[#111111] hover:bg-[#EAE6DF]"
                                    }`}
                                >
                                    {plan.buttonText}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <div className={`w-full mb-6 flex items-center justify-center gap-2 px-5 py-3 rounded text-sm font-semibold cursor-not-allowed border bg-[#FCFBF9] text-[#6B6356] border-[#E8E5DF]`}>
                                    <Lock className="w-3.5 h-3.5" />
                                    {plan.buttonText}
                                </div>
                            )}

                            <div className={`space-y-3 flex-grow w-full pt-5 border-t border-[#E8E5DF]`}>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-[#111111]" : "text-[#8b7355]"}`} />
                                        <span className={`text-sm font-medium ${plan.popular ? "text-[#111111]" : "text-[#6B6356]"}`}>
                                            {feature}
                                        </span>
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

