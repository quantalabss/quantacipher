"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2, CreditCard, ShieldAlert } from "lucide-react";
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
            fetch('/api/analytics')
                .then(res => res.json())
                .then(data => {
                    if (data.overview) setAnalytics(data.overview);
                })
                .catch(console.error);
        }
    }, [status]);

    if (status === "loading") {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-transparent gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#C4ED5F]" />
                <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">Loading Billing...</p>
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

            const res = await fetch('/api/create-razorpay-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create subscription");
            }
            
            const subscription = await res.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                subscription_id: subscription.id,
                name: "QuantaCipher",
                description: `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_subscription_id: response.razorpay_subscription_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planId
                            })
                        });
                        
                        const verifyData = await verifyRes.json();
                        
                        if (verifyData.verified) {
                            alert(`Payment successful! Your plan is now ${planId.toUpperCase()}.`);
                            window.location.reload();
                        } else {
                            alert("Payment verification failed. Please contact support.");
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        alert("An error occurred during payment verification.");
                    }
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
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-[#222] pb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight">Billing & Plans</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your subscription and monitor usage limits.</p>
                </div>
            </div>

            {/* Current Plan */}
            <div className="bg-[#000] p-8 border border-[#222] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Current Plan</h3>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl font-semibold text-white capitalize">{analytics.plan}</span>
                        <span className="bg-[#C4ED5F]/10 text-[#C4ED5F] border border-[#C4ED5F]/30 text-[10px] px-2 py-1 font-bold uppercase tracking-widest">Active</span>
                    </div>
                    <p className="text-sm text-gray-400">
                        You are currently on the {analytics.plan} tier. Upgrade for higher limits and SLAs.
                    </p>
                </div>
                
                <div className="w-full md:w-[320px] space-y-5">
                    <div>
                        <div className="flex items-center justify-between mb-2 text-xs font-mono">
                            <span className="text-gray-500">API Calls</span>
                            <span className="text-white">{analytics.totalCalls.toLocaleString()} <span className="text-gray-600">/ 10,000</span></span>
                        </div>
                        <div className="w-full bg-[#111] border border-[#222] h-2 overflow-hidden">
                            <div className="bg-[#C4ED5F] h-full transition-all duration-500" style={{ width: `${Math.min(100, (analytics.totalCalls / 10000) * 100)}%` }}></div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between mb-2 text-xs font-mono">
                            <span className="text-gray-500">API Keys</span>
                            <span className="text-white">{analytics.activeKeys} <span className="text-gray-600">/ 1</span></span>
                        </div>
                        <div className="w-full bg-[#111] border border-[#222] h-2 overflow-hidden">
                            <div className="bg-[#C4ED5F] h-full transition-all duration-500" style={{ width: `${Math.min(100, (analytics.activeKeys / 1) * 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upgrade Options */}
            <div className="mb-12">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Available Upgrades</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`bg-[#000] p-8 flex flex-col h-full ${plan.id === 'professional' ? 'border border-[#C4ED5F] relative' : 'border border-[#222]'}`}>
                            {plan.id === 'professional' && (
                                <div className="absolute top-0 right-0 bg-[#C4ED5F] text-black text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                                    Recommended
                                </div>
                            )}
                            
                            <h3 className="text-2xl font-semibold text-white mb-2">{plan.name}</h3>
                            <p className="text-sm text-gray-400 mb-6 min-h-[40px]">{plan.description}</p>
                            
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-semibold text-white tracking-tight">{plan.price}</span>
                                <span className="text-gray-500 font-medium text-sm">{plan.period}</span>
                            </div>
                            
                            <Button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={loading !== null}
                                className={`w-full mb-8 h-12 rounded-none text-xs font-bold uppercase tracking-wider transition-colors ${plan.id === 'professional' ? 'bg-[#C4ED5F] hover:bg-white text-black' : 'bg-transparent border border-[#222] text-white hover:bg-[#111]'}`}
                            >
                                {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                                {loading === plan.id ? "Processing..." : `Upgrade to ${plan.name}`}
                            </Button>
                            
                            <div className="space-y-4 flex-grow pt-6 border-t border-[#222]">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.id === 'professional' ? 'text-[#C4ED5F]' : 'text-gray-500'}`} />
                                        <span className="text-gray-300 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enterprise Custom */}
            <div className="bg-[#0a0a0a] border border-[#222] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Need an Enterprise Plan?</h3>
                    <p className="text-sm text-gray-400 max-w-xl">Unlimited API calls, dedicated gateway instances, SOC2/HIPAA compliance, and 24/7 dedicated Slack channel.</p>
                </div>
                <Button className="bg-white text-black hover:bg-gray-200 rounded-none h-10 px-8 font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-colors">
                    Contact Sales
                </Button>
            </div>
            
            {/* Payment History Placeholder */}
            <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Payment History</h2>
                <div className="bg-[#000] border border-[#222] p-12 text-center text-gray-500 text-sm font-mono">
                    No payment history available.
                </div>
            </div>
        </div>
    );
}
