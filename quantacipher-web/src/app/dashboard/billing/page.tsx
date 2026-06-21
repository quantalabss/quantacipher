"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if ((window as any).Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

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
            window.location.href = "/signin?callbackUrl=/dashboard/billing";
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
                <Loader2 className="w-8 h-8 animate-spin text-[#C4ED5F]" />
            </div>
        );
    }

    if (status === "unauthenticated") return null;

    const handleUpgrade = async (planId: string) => {
        setLoading(planId);
        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                alert("Razorpay SDK failed to load. Are you online?");
                setLoading(null);
                return;
            }

            const res = await fetch('/api/create-razorpay-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            
            if (!res.ok) throw new Error("Failed to create order");
            
            const order = await res.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "QuantaCipher",
                description: `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
                order_id: order.id,
                handler: function (response: any) {
                    alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
                    // In a production app, verify the signature on the backend here
                },
                prefill: {
                    name: "QuantaCipher User",
                },
                theme: {
                    color: "#C4ED5F",
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error(error);
            alert("Error initiating checkout. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl pb-12 p-4 sm:p-6 md:p-8 mx-auto">
            <h1 className="text-[28px] font-normal text-white">Billing & Plans</h1>

            {/* Current Plan */}
            <div className="bg-white/[0.02] p-6 rounded-[24px] border border-white/10 backdrop-blur-sm shadow-none flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h3 className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-2">Current Plan</h3>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[28px] font-normal text-white">Developer</span>
                        <span className="bg-white/5 text-[#C4ED5F] text-[12px] px-2 py-1 rounded-[4px] font-medium uppercase tracking-wide">Free</span>
                    </div>
                    <p className="text-[14px] text-gray-400">
                        You are currently on the free Developer tier. Upgrade for higher limits and SLAs.
                    </p>
                </div>
                <div className="space-y-3 text-[14px] text-white bg-transparent p-5 rounded-xl border border-white/10 min-w-[260px] w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">API Calls:</span>
                        <span className="font-medium text-white">{analytics.totalCalls.toLocaleString()} / 10,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">API Keys:</span>
                        <span className="font-medium text-white">{analytics.activeKeys} / 1</span>
                    </div>
                    <div className="w-full bg-[#e5e7eb] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-[#C4ED5F] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (analytics.totalCalls / 10000) * 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Upgrade Options */}
            <div>
                <h2 className="text-[20px] font-normal text-white mb-4">Upgrade Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`bg-white/[0.02] p-6 rounded-[24px] border backdrop-blur-sm flex flex-col h-full ${plan.id === 'professional' ? 'border-2 border-[#C4ED5F] shadow-md relative' : 'border-white/10 shadow-none'}`}>
                            {plan.id === 'professional' && (
                                <div className="absolute top-0 right-0 bg-[#C4ED5F] text-black text-[11px] font-bold tracking-wide uppercase px-4 py-1 rounded-bl-[8px]">
                                    Recommended
                                </div>
                            )}
                            
                            <h3 className="text-[20px] font-medium text-white mb-2">{plan.name}</h3>
                            <p className="text-[14px] text-gray-400 mb-6 min-h-[40px] leading-relaxed">{plan.description}</p>
                            
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-[40px] font-normal text-white tracking-tight">{plan.price}</span>
                                <span className="text-gray-400 font-medium text-[16px]">{plan.period}</span>
                            </div>
                            
                            <Button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={loading !== null}
                                className={`w-full mb-8 h-[48px] rounded-xl text-[15px] font-medium transition-all ${plan.id === 'professional' ? 'bg-[#C4ED5F] hover:bg-white text-black shadow-none hover:shadow-md' : 'bg-transparent border border-white/10 text-white hover:bg-transparent'}`}
                                variant={plan.id === 'professional' ? 'default' : 'outline'}
                            >
                                {loading === plan.id ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                                {loading === plan.id ? "Processing..." : `Upgrade to ${plan.name}`}
                            </Button>
                            
                            <div className="space-y-4 flex-grow pt-6 border-t border-white/10">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-[14px]">
                                        <CheckCircle2 className="w-4 h-4 text-[#C4ED5F] flex-shrink-0 mt-0.5" />
                                        <span className="text-white font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enterprise Custom */}
            <div className="bg-gradient-to-r bg-white/[0.02] border border-white/10 shadow-none rounded-[24px] backdrop-blur-sm p-6 sm:p-8 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-[18px] font-medium text-white mb-2">Need an Enterprise Plan?</h3>
                    <p className="text-[14px] text-gray-400 max-w-lg leading-relaxed">Unlimited calls, SOC2/HIPAA compliance, dedicated gateway instances, and 24/7 dedicated support.</p>
                </div>
                <Button variant="outline" className="bg-transparent border-white/10 text-white hover:bg-transparent h-[40px] px-6 whitespace-nowrap">
                    Contact Sales
                </Button>
            </div>
            
            {/* Payment History Placeholder */}
            <div className="mt-12">
                <h2 className="text-[20px] font-normal text-white mb-4">Payment History</h2>
                <div className="bg-white/[0.02] border border-white/10 rounded-[24px] p-12 backdrop-blur-sm text-center text-gray-400 text-[14px]">
                    No payment history available. You are currently on the Free tier.
                </div>
            </div>
        </div>
    );
}
