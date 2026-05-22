import { Check, Star, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const plans = [
    {
        name: "Hobby",
        price: "$0",
        period: "/mo",
        description: "Perfect for exploring post-quantum security and small side projects.",
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
        name: "Dev",
        price: "$49",
        period: "/mo",
        description: "For solo developers and small teams launching secure apps.",
        features: [
            "100,000 API calls / month",
            "Everything in Hobby, plus:",
            "REST API Access",
            "Basic usage analytics",
            "Email support (48h SLA)",
            "Up to 5 API Keys",
        ],
        buttonText: "Get Started",
        buttonVariant: "outline",
        popular: false,
    },
    {
        name: "Business",
        price: "$99",
        period: "/mo",
        description: "For growing companies that need higher volume and reliability.",
        features: [
            "1,000,000 API calls / month",
            "Everything in Dev, plus:",
            "99.9% Uptime SLA",
            "Priority email support (24h)",
            "Advanced analytics dashboard",
            "Unlimited API Keys",
        ],
        buttonText: "Start Free Trial",
        buttonVariant: "primary",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "$199",
        period: "/mo",
        description: "Maximum limits, compliance reports, and white-glove onboarding.",
        features: [
            "10,000,000 API calls / month",
            "Everything in Business, plus:",
            "SOC2 / HIPAA compliance reports",
            "Dedicated Slack channel",
            "24/7 Phone support",
            "Custom rate limits",
        ],
        buttonText: "Contact Sales",
        buttonVariant: "outline",
        popular: false,
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-[#f8f9fa] border-b border-[#dadce0]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-[12px] font-bold text-[#1a73e8] uppercase tracking-widest mb-4 flex justify-center items-center gap-2">
                        <Zap className="w-4 h-4" /> Pricing
                    </p>
                    <h2 className="text-[32px] sm:text-[48px] leading-[1.2] font-normal text-[#202124] mb-4">
                        Predictable pricing for every stage
                    </h2>
                    <p className="text-[18px] sm:text-[20px] text-[#5f6368] max-w-2xl mx-auto">
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
                            <p className="text-[14px] text-[#5f6368] mb-6 min-h-[42px] leading-relaxed">
                                {plan.description}
                            </p>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-[48px] font-normal text-[#202124] tracking-tight">{plan.price}</span>
                                <span className="text-[#5f6368] font-medium text-[16px]">{plan.period}</span>
                            </div>

                            <Link
                                href="/signin"
                                className="w-full mb-8"
                            >
                                <Button
                                    variant={plan.buttonVariant as "default" | "outline"}
                                    className={`w-full h-[48px] rounded-[8px] text-[15px] font-medium transition-all ${
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
                                        <div className="w-5 h-5 rounded-full bg-[#e6f4ea] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 text-[#137333]" />
                                        </div>
                                        <span className={`text-[14px] ${i === 0 ? 'font-bold text-[#202124]' : 'text-[#5f6368]'}`}>{feature}</span>
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
