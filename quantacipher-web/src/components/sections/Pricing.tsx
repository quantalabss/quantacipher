import { Check, Star, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const plans = [
    {
        name: "Developer",
        price: "$0",
        period: "/mo",
        description: "Perfect for exploring post-quantum security in development environments.",
        features: [
            "10,000 API calls / month",
            "Kyber-1024 WASM encryption",
            "Node.js & Browser SDKs",
            "Community Discord support",
            "1 API Key",
        ],
        buttonText: "Start for free",
        buttonVariant: "outline",
        popular: false,
    },
    {
        name: "Startup",
        price: "$239",
        period: "/mo",
        description: "For small teams needing more capacity and basic SLAs.",
        features: [
            "100,000 API calls / month",
            "Everything in Developer, plus:",
            "99.9% Uptime SLA",
            "Email support (48h SLA)",
            "Basic usage analytics",
            "Up to 5 API Keys",
        ],
        buttonText: "Start Free Trial",
        buttonVariant: "outline",
        popular: false,
    },
    {
        name: "Professional",
        price: "$499",
        period: "/mo",
        description: "For startups and production applications handling sensitive data.",
        features: [
            "1,000,000 API calls / month",
            "Everything in Startup, plus:",
            "99.9% Uptime SLA",
            "Priority email support (24h SLA)",
            "Advanced analytics dashboard",
            "Up to 10 API Keys",
        ],
        buttonText: "Start Free Trial",
        buttonVariant: "primary",
        popular: true,
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
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-16 sm:py-24 bg-white border-b border-[#dadce0]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-[14px] font-bold text-[#5f6368] uppercase tracking-widest mb-4 flex justify-center items-center gap-2">
                        Pricing
                    </p>
                    <h2 className="text-[32px] sm:text-[48px] leading-[1.2] font-normal text-[#202124] mb-4">
                        Predictable pricing for every stage
                    </h2>
                    <p className="text-[20px] sm:text-[22px] text-[#5f6368] max-w-2xl mx-auto">
                        Whether you're building a weekend project or an enterprise healthcare app, we have a plan that fits.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`
                                relative p-8 rounded-[16px] bg-white flex flex-col items-start h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                                ${plan.popular ? 'border-2 border-[#1a73e8] shadow-lg ring-4 ring-[#1a73e8]/10' : 'border border-[#dadce0]'}
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a73e8] text-white text-[12px] font-bold px-4 py-1 rounded-full flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                                    <Star className="w-3.5 h-3.5 fill-white" />
                                    Most Popular
                                </div>
                            )}

                            <h3 className="text-[20px] font-medium text-[#202124] mb-3">{plan.name}</h3>
                            <p className="text-[16px] text-[#5f6368] mb-6 min-h-[42px] leading-relaxed">
                                {plan.description}
                            </p>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-[48px] font-normal text-[#202124] tracking-tight">{plan.price}</span>
                                <span className="text-[#5f6368] font-medium text-[18px]">{plan.period}</span>
                            </div>

                            <Link
                                href="/signin"
                                className="w-full mb-8"
                            >
                                <Button
                                    variant={plan.buttonVariant as "default" | "outline"}
                                    className={`w-full h-[48px] rounded-[8px] text-[16px] font-medium transition-all ${
                                        plan.buttonVariant === 'primary' 
                                            ? 'bg-[#1a73e8] hover:bg-[#1967d2] text-white shadow-sm hover:shadow-md' 
                                            : 'bg-white border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa] hover:border-[#bdc1c6]'
                                    }`}
                                >
                                    {plan.buttonText}
                                </Button>
                            </Link>

                            <div className="space-y-4 flex-grow w-full pt-6 border-t border-[#f1f3f4]">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check className="w-4 h-4 text-[#5f6368] mt-0.5 flex-shrink-0" />
                                        <span className={`text-[16px] ${i === 0 ? 'font-bold text-[#202124]' : 'text-[#5f6368]'}`}>{feature}</span>
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
