"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
    {
        id: "startup",
        name: "Startup",
        price: "$239",
        period: "/mo",
        description: "For small teams needing more capacity and basic SLAs.",
        features: [
            "100,000 API calls / month",
            "99.9% Uptime SLA",
            "Email support (48h SLA)",
            "Up to 5 API Keys",
        ]
    },
    {
        id: "professional",
        name: "Professional",
        price: "$499",
        period: "/mo",
        description: "For startups and production applications handling sensitive data.",
        features: [
            "1,000,000 API calls / month",
            "99.9% Uptime SLA",
            "Priority email support (24h SLA)",
            "Advanced analytics dashboard",
            "Up to 10 API Keys",
        ]
    }
];

export default function BillingPage() {
    const { status } = useSession();
    const [loading, setLoading] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState({ totalCalls: 0, activeKeys: 0, plan: 'free' });

    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/signin";
        } else if (status === "authenticated") {
            fetch('/api/keys')
                .then(res => res.json())
                .then(data => {
                    if (data.analytics) setAnalytics(data.analytics);
                })
                .catch(console.error);
        }
    }, [status]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#00E599]" />
            </div>
        );
    }

    if (status === "unauthenticated") return null;

    const handleUpgrade = (planId: string) => {
        setLoading(planId);
        setTimeout(() => {
            alert("Stripe Checkout Integration Coming Soon!");
            setLoading(null);
        }, 1000);
    };

    return (
        <div className="space-y-8 max-w-5xl pb-12 p-4 sm:p-6 md:p-8 mx-auto">
            <h1 className="text-[28px] font-normal text-[black]">Billing & Plans</h1>

            {/* Current Plan */}
            <div className="bg-white p-6 rounded-xl border border-[#e5e7eb] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h3 className="text-[12px] font-medium text-[#6b7280] uppercase tracking-wider mb-2">Current Plan</h3>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[28px] font-normal text-[black]">Developer</span>
                        <span className="bg-[#f3f4f6] text-[#00E599] text-[12px] px-2 py-1 rounded-[4px] font-medium uppercase tracking-wide">Free</span>
                    </div>
                    <p className="text-[14px] text-[#6b7280]">
                        You are currently on the free Developer tier. Upgrade for higher limits and SLAs.
                    </p>
                </div>
                <div className="space-y-3 text-[14px] text-[#1f2937] bg-white p-5 rounded-xl border border-[#e5e7eb] min-w-[260px] w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex items-center justify-between">
                        <span className="text-[#6b7280]">API Calls:</span>
                        <span className="font-medium text-[black]">{analytics.totalCalls.toLocaleString()} / 10,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[#6b7280]">API Keys:</span>
                        <span className="font-medium text-[black]">{analytics.activeKeys} / 1</span>
                    </div>
                    <div className="w-full bg-[#e5e7eb] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-[#00E599] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (analytics.totalCalls / 10000) * 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Upgrade Options */}
            <div>
                <h2 className="text-[20px] font-normal text-[black] mb-4">Upgrade Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`bg-white p-6 rounded-xl border flex flex-col h-full ${plan.id === 'professional' ? 'border-2 border-[#00E599] shadow-md relative' : 'border-[#e5e7eb] shadow-[0_4px_20px_rgba(0,0,0,0.03)]'}`}>
                            {plan.id === 'professional' && (
                                <div className="absolute top-0 right-0 bg-[#00E599] text-white text-[11px] font-bold tracking-wide uppercase px-4 py-1 rounded-bl-[8px]">
                                    Recommended
                                </div>
                            )}
                            
                            <h3 className="text-[20px] font-medium text-[black] mb-2">{plan.name}</h3>
                            <p className="text-[14px] text-[#6b7280] mb-6 min-h-[40px] leading-relaxed">{plan.description}</p>
                            
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-[40px] font-normal text-[black] tracking-tight">{plan.price}</span>
                                <span className="text-[#6b7280] font-medium text-[16px]">{plan.period}</span>
                            </div>
                            
                            <Button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={loading !== null}
                                className={`w-full mb-8 h-[48px] rounded-xl text-[15px] font-medium transition-all ${plan.id === 'professional' ? 'bg-[#00E599] hover:bg-[black] text-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md' : 'bg-white border border-[#e5e7eb] text-[#1f2937] hover:bg-white'}`}
                                variant={plan.id === 'professional' ? 'default' : 'outline'}
                            >
                                {loading === plan.id ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                                {loading === plan.id ? "Processing..." : `Upgrade to ${plan.name}`}
                            </Button>
                            
                            <div className="space-y-4 flex-grow pt-6 border-t border-[#f1f3f4]">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-[14px]">
                                        <CheckCircle2 className="w-4 h-4 text-[#00E599] flex-shrink-0 mt-0.5" />
                                        <span className="text-[#1f2937] font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enterprise Custom */}
            <div className="bg-gradient-to-r from-[#f9fafb] to-white border border-[#e5e7eb] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-xl p-6 sm:p-8 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-[18px] font-medium text-[black] mb-2">Need an Enterprise Plan?</h3>
                    <p className="text-[14px] text-[#6b7280] max-w-lg leading-relaxed">Unlimited calls, SOC2/HIPAA compliance, dedicated gateway instances, and 24/7 dedicated support.</p>
                </div>
                <Button variant="outline" className="bg-white border-[#e5e7eb] text-[#1f2937] hover:bg-white h-[40px] px-6 whitespace-nowrap">
                    Contact Sales
                </Button>
            </div>
            
            {/* Payment History Placeholder */}
            <div className="mt-12">
                <h2 className="text-[20px] font-normal text-[black] mb-4">Payment History</h2>
                <div className="bg-white border border-[#e5e7eb] rounded-xl p-12 text-center text-[#6b7280] text-[14px]">
                    No payment history available. You are currently on the Free tier.
                </div>
            </div>
        </div>
    );
}
