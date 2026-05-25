import { Check, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

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
        <section id="pricing" className="py-24 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 animate-fade-in">
                    <p className="text-xs font-black uppercase tracking-widest text-[#00E599] mb-4">
                        Pricing
                    </p>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-black tracking-tighter mb-4 leading-tight">
                        Predictable pricing for <br />every stage
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
                        Whether you're building a weekend project or an enterprise healthcare app, we have a plan that fits.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`
                                relative p-8 rounded-[2rem] flex flex-col h-full transition-all duration-300 hover:-translate-y-1 
                                ${plan.popular ? 'bg-black text-white shadow-2xl' : 'bg-white border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl'}
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00E599] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                                    <Star className="w-3 h-3 fill-black" />
                                    Most Popular
                                </div>
                            )}

                            <h3 className={`text-xl font-extrabold tracking-tight mb-3 ${plan.popular ? 'text-white' : 'text-black'}`}>{plan.name}</h3>
                            <p className={`text-sm mb-8 min-h-[42px] leading-relaxed font-medium ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                                {plan.description}
                            </p>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className={`text-5xl font-extrabold tracking-tighter ${plan.popular ? 'text-white' : 'text-black'}`}>{plan.price}</span>
                                <span className={`font-medium text-sm ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>
                            </div>

                            <Link
                                href="/dashboard/billing"
                                className={`w-full mb-8 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold transition-all uppercase tracking-wider ${
                                    plan.popular
                                        ? 'bg-[#00E599] text-black hover:bg-white hover:text-black'
                                        : 'bg-black text-white hover:bg-[#00E599] hover:text-black'
                                }`}
                            >
                                {plan.buttonText} <ArrowRight className="w-4 h-4" />
                            </Link>

                            <div className={`space-y-4 flex-grow w-full pt-6 border-t ${plan.popular ? 'border-gray-800' : 'border-gray-100'}`}>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-[#00E599]' : 'text-gray-400'}`} />
                                        <span className={`text-sm font-medium ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
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
