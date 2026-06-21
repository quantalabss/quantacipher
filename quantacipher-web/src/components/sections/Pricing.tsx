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
        buttonText: "Coming Soon",
        buttonVariant: "outline",
        popular: false,
        available: false,
        cta: "#",
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
        buttonText: "Coming Soon",
        buttonVariant: "outline",
        popular: true,
        available: false,
        cta: "#",
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "Maximum limits, SOC2/HIPAA compliance, and white-glove onboarding.",
        features: [
            "Unlimited API calls",
            "Dedicated gateway instances",
            "SOC2 / HIPAA compliance reports",
            "Dedicated Slack channel",
            "24/7 Phone support",
            "Custom integrations",
        ],
        buttonText: "Contact Sales",
        buttonVariant: "outline",
        popular: false,
        available: true,
        cta: "mailto:enterprise@quantacipher.com",
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-transparent border-b border-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-6">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8db53a] mb-4">
                        Pricing
                    </p>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter mb-4 leading-tight">
                        Simple, predictable pricing
                    </h2>
                    <p className="text-base text-gray-400 max-w-xl mx-auto font-medium">
                        Whether you're building a weekend project or an enterprise healthcare app, we have a plan that fits.
                    </p>
                </div>

                {/* Beta banner */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#C4ED5F]/10 border border-[#C4ED5F]/30">
                        <div className="w-2 h-2 rounded-full bg-[#C4ED5F] animate-pulse" />
                        <p className="text-[13px] font-semibold text-gray-400">
                            <span className="font-black text-[#8db53a]">Beta period:</span> All features are currently free. Paid plans launch later in 2026.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`
                                relative p-7 rounded-2xl flex flex-col h-full transition-all duration-300
                                ${!plan.available ? "opacity-70" : ""}
                                ${plan.popular
                                    ? "bg-[#1f1f1f] text-white shadow-2xl ring-1 ring-[#C4ED5F]/20"
                                    : "bg-[#111] border border-[#222] shadow-[0_2px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:-translate-y-0.5"
                                }
                            `}
                        >
                            {/* Coming Soon overlay badge */}
                            {!plan.available && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0a0a] border border-[#222]">
                                    <Lock className="w-3 h-3 text-gray-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Soon</span>
                                </div>
                            )}

                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C4ED5F] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                                    <Star className="w-3 h-3 fill-black" />
                                    Most Popular
                                </div>
                            )}

                            <h3 className={`text-lg font-extrabold tracking-tight mb-2 ${plan.popular ? "text-white" : "text-white"}`}>
                                {plan.name}
                            </h3>
                            <p className={`text-sm mb-6 min-h-[48px] leading-relaxed font-medium ${plan.popular ? "text-gray-400" : "text-gray-400"}`}>
                                {plan.description}
                            </p>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className={`text-4xl font-extrabold tracking-tighter ${plan.popular ? "text-white" : "text-white"}`}>
                                    {plan.price}
                                </span>
                                <span className={`font-medium text-sm ${plan.popular ? "text-gray-400" : "text-gray-500"}`}>
                                    {plan.period}
                                </span>
                            </div>

                            {/* CTA Button */}
                            {plan.available ? (
                                <Link
                                    href={plan.cta}
                                    className={`w-full mb-6 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all uppercase tracking-wider ${
                                        plan.popular
                                            ? "bg-[#C4ED5F] text-black hover:bg-white hover:text-black"
                                            : "bg-white text-black hover:bg-[#C4ED5F] hover:text-black"
                                    }`}
                                >
                                    {plan.buttonText}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <div className={`w-full mb-6 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold cursor-not-allowed opacity-50 uppercase tracking-wider border ${
                                    plan.popular ? "border-gray-700 text-gray-500" : "border-[#222] text-gray-500"
                                }`}>
                                    <Lock className="w-3.5 h-3.5" />
                                    {plan.buttonText}
                                </div>
                            )}

                            <div className={`space-y-3 flex-grow w-full pt-5 border-t ${plan.popular ? "border-gray-800" : "border-[#222]"}`}>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-[#C4ED5F]" : "text-gray-500"}`} />
                                        <span className={`text-sm font-medium ${plan.popular ? "text-gray-300" : "text-gray-400"}`}>
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
