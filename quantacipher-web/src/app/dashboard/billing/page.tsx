"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, AlertTriangle, Loader2, Wallet, Shield, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrowserProvider, parseEther } from "ethers";

// Pricing Constants
const PRO_PRICE_ETH = "0.01";
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

export default function BillingPage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasProvider, setHasProvider] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<string>('hobbyist');
    const [planExpiry, setPlanExpiry] = useState<Date | null>(null);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/signin";
            return;
        }
        setHasProvider(!!window.ethereum);
        if (status === "authenticated") {
            fetchCurrentPlan();
        }
    }, [status]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" />
            </div>
        );
    }

    if (status === "unauthenticated") return null;

    const fetchCurrentPlan = async () => {
        try {
            const res = await fetch('/api/user/plan');
            const data = await res.json();
            setCurrentPlan(data.plan || 'hobbyist');
            setPlanExpiry(data.expiresAt ? new Date(data.expiresAt) : null);
        } catch (err) {
            console.error('Failed to fetch plan:', err);
        }
    };

    const handlePayWithWallet = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!window.ethereum) {
                throw new Error("No crypto wallet found. Please install MetaMask.");
            }

            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Send Transaction
            const tx = await signer.sendTransaction({
                to: TREASURY_ADDRESS,
                value: parseEther(PRO_PRICE_ETH)
            });

            setTxHash(tx.hash);
            setLoading(false);
            setVerifying(true);

            // Wait for transaction to be mined
            await tx.wait(1);

            // Verify payment on backend
            const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txHash: tx.hash })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
                await fetchCurrentPlan();
                setError(null);
            } else {
                throw new Error(verifyData.error || 'Payment verification failed');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Payment failed");
            setTxHash(null);
        } finally {
            setLoading(false);
            setVerifying(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-[24px] font-normal text-[#202124]">Billing & Plans</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Plan */}
                <div className="bg-white p-6 rounded-[8px] border border-[#dadce0] shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-[14px] font-medium text-[#5f6368] uppercase tracking-wider">Current Plan</h3>
                            <div className="text-[32px] font-normal text-[#202124] mt-1 capitalize flex items-center gap-3">
                                {currentPlan}
                                {currentPlan === 'validator' && <span className="bg-[#e6f4ea] text-[#137333] text-[12px] px-2 py-1 rounded font-medium align-middle">Active</span>}
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[12px] font-medium ${currentPlan === 'validator' ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-[#f1f3f4] text-[#5f6368]'}`}>
                            {currentPlan === 'validator' ? 'Pro' : 'Free'}
                        </div>
                    </div>
                    <div className="space-y-3 mb-8 flex-grow">
                        <div className="flex items-center gap-2 text-[14px] text-[#3c4043]">
                            <CheckCircle2 className="w-4 h-4 text-[#34a853]" />
                            {currentPlan === 'validator' ? '20 Enterprise APIs' : '3 Enterprise APIs'}
                        </div>
                        <div className="flex items-center gap-2 text-[14px] text-[#3c4043]">
                            <CheckCircle2 className="w-4 h-4 text-[#34a853]" />
                            {currentPlan === 'validator' ? '10 Second Checks' : 'Daily Checks'}
                        </div>
                        <div className="flex items-center gap-2 text-[14px] text-[#3c4043]">
                            <CheckCircle2 className="w-4 h-4 text-[#34a853]" />
                            {currentPlan === 'validator' ? 'Discord & Slack Webhooks' : 'Email Alerts'}
                        </div>
                    </div>
                    {planExpiry && (
                        <div className="text-[12px] text-[#5f6368] pt-4 border-t border-[#dadce0] flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Renews on {new Date(planExpiry).toLocaleDateString()}
                        </div>
                    )}
                </div>

                {/* Pro Plan */}
                <div className="bg-white p-6 rounded-[8px] border-2 border-[#1a73e8] shadow-md relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 right-0 bg-[#1a73e8] text-white text-[12px] font-medium px-4 py-1 rounded-bl-[8px]">
                        Recommended
                    </div>

                    <div className="mb-4">
                        <h3 className="text-[14px] font-medium text-[#1a73e8] uppercase tracking-wider">Upgrade to Validator</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-[32px] font-normal text-[#202124]">{PRO_PRICE_ETH} ETH</span>
                            <span className="text-[#5f6368] text-[16px]">/mo</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-8 flex-grow">
                        <div className="flex items-center gap-2 text-[14px] text-[#3c4043]">
                            <Zap className="w-4 h-4 text-[#1a73e8]" />
                            20 Enterprise APIs
                        </div>
                        <div className="flex items-center gap-2 text-[14px] text-[#3c4043]">
                            <Zap className="w-4 h-4 text-[#1a73e8]" />
                            10s Check Interval
                        </div>
                        <div className="flex items-center gap-2 text-[14px] text-[#3c4043]">
                            <Zap className="w-4 h-4 text-[#1a73e8]" />
                            Discord & Slack Webhooks
                        </div>
                    </div>

                    {!txHash ? (
                        <div className="space-y-4">
                            {currentPlan === 'validator' ? (
                                <div className="p-4 bg-[#e8f0fe] rounded-[4px] border border-[#d2e3fc]">
                                    <p className="text-[14px] text-[#1967d2] text-center font-medium">
                                        You're already on the Validator plan
                                    </p>
                                </div>
                            ) : hasProvider ? (
                                <Button
                                    onClick={handlePayWithWallet}
                                    disabled={loading || verifying}
                                    className="w-full bg-[#1a73e8] hover:bg-[#1967d2] text-white rounded-[4px] h-[48px] font-medium shadow-sm flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                                    {loading ? "Confirm in Wallet..." : "Pay with Metamask"}
                                </Button>
                            ) : (
                                <div className="p-4 bg-[#fce8e6] rounded-[4px] border border-[#faddd9]">
                                    <div className="flex gap-2">
                                        <AlertTriangle className="w-5 h-5 text-[#c5221f] flex-shrink-0" />
                                        <p className="text-[13px] text-[#c5221f] leading-tight">
                                            No Web3 wallet detected. Please install MetaMask.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <p className="text-[13px] text-[#d93025] text-center">{error}</p>
                            )}
                        </div>
                    ) : verifying ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#e8f0fe] p-4 rounded-[4px] border border-[#d2e3fc] text-center"
                        >
                            <Loader2 className="w-10 h-10 text-[#1a73e8] mx-auto mb-2 animate-spin" />
                            <h4 className="text-[#1967d2] font-medium mb-1">Verifying Payment...</h4>
                            <p className="text-[12px] text-[#5f6368]">Please wait for blockchain confirmation.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#e6f4ea] p-4 rounded-[4px] border border-[#ceead6] text-center"
                        >
                            <CheckCircle2 className="w-8 h-8 text-[#34a853] mx-auto mb-2" />
                            <h4 className="text-[#137333] font-medium mb-1">Payment Verified!</h4>
                            <Button onClick={() => window.location.reload()} className="mt-2 bg-[#34a853] text-white h-[32px] text-[12px]">Refresh</Button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Invoices / Payment History Area (Mock for UI Trust) */}
            <div className="mt-12">
                <h2 className="text-[20px] font-normal text-[#202124] mb-4">Payment History</h2>
                <div className="bg-white border border-[#dadce0] rounded-[8px] overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#dadce0] bg-[#f8f9fa] text-[12px] font-medium text-[#5f6368] uppercase tracking-wider">
                        <div className="col-span-4">Date</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-2 text-right">Status</div>
                    </div>
                    <div className="divide-y divide-[#dadce0]">
                        {planExpiry ? (
                            <div className="grid grid-cols-12 gap-4 p-4 items-center">
                                <div className="col-span-4 text-[14px] text-[#202124]">{new Date().toLocaleDateString()}</div>
                                <div className="col-span-4 text-[14px] text-[#5f6368]">Validator Plan (1 Month)</div>
                                <div className="col-span-2 text-right text-[14px] text-[#202124] font-mono">0.01 ETH</div>
                                <div className="col-span-2 text-right">
                                    <span className="bg-[#e6f4ea] text-[#137333] px-2 py-1 rounded-full text-[11px] font-medium">Paid</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-[#5f6368] text-[14px]">
                                No payment history available. Use the Free tier or upgrade above.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Trust Footer */}
            <div className="mt-12 border-t border-[#dadce0] pt-6 flex flex-col md:flex-row gap-6 justify-between items-center text-[#5f6368] text-[13px]">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure Blockchain Transactions</span>
                </div>
                <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>Non-custodial Payments via Metamask</span>
                </div>
                <div>
                    Need help? <a href="/support" className="text-[#1a73e8] hover:underline">Contact Support</a>
                </div>
            </div>
        </div>
    );
}

// Add types for window.ethereum
declare global {
    interface Window {
        ethereum: any;
    }
}
