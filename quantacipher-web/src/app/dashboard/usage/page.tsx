"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Key,
    Activity,
    Shield,
    Database,
    Loader2
} from "lucide-react";

interface Analytics {
    totalCalls: number;
    totalBytes: number;
    activeKeys: number;
    plan: string;
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getPlanColor(plan: string) {
    switch (plan) {
        case 'startup': return 'text-[#C4ED5F]';
        case 'business': return 'text-[#C4ED5F]';
        case 'enterprise': return 'text-[#C4ED5F]';
        default: return 'text-gray-400';
    }
}

export default function UsagePage() {
    const { status } = useSession();
    const [analytics, setAnalytics] = useState<Analytics>({
        totalCalls: 0,
        totalBytes: 0,
        activeKeys: 0,
        plan: "free"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "authenticated") {
            fetch('/api/keys')
                .then(res => res.json())
                .then(data => {
                    if (data.analytics) setAnalytics(data.analytics);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [status]);

    if (status === "loading" || (status === "authenticated" && loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <Loader2 className="w-8 h-8 animate-spin text-[#C4ED5F]" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        if (typeof window !== "undefined") {
            window.location.href = "/signin";
        }
        return null;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-8">
                <h1 className="text-[28px] font-normal text-white">Usage & Analytics</h1>
                <p className="text-gray-400 mt-1">Monitor your cryptographic payload operations and API requests.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white/[0.02] p-6 rounded-[24px] border border-white/10 shadow-none backdrop-blur-sm">
                    <h3 className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-2">Active Keys</h3>
                    <div className="flex items-center justify-between">
                        <div className="text-[32px] font-normal text-white">{analytics.activeKeys}</div>
                        <Key className="w-6 h-6 text-[#C4ED5F] opacity-50" />
                    </div>
                </div>
                <div className="bg-white/[0.02] p-6 rounded-[24px] border border-white/10 shadow-none backdrop-blur-sm">
                    <h3 className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-2">API Calls (Total)</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-[32px] font-normal text-white">
                            {analytics.totalCalls.toLocaleString()}
                        </span>
                        <Activity className="w-6 h-6 text-[#C4ED5F] opacity-50" />
                    </div>
                </div>
                <div className="bg-white/[0.02] p-6 rounded-[24px] border border-white/10 shadow-none backdrop-blur-sm">
                    <h3 className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-2">Data Secured</h3>
                    <div className="flex items-center justify-between">
                        <div className="text-[32px] font-normal text-white">{formatBytes(analytics.totalBytes)}</div>
                        <Database className="w-6 h-6 text-[#C4ED5F] opacity-50" />
                    </div>
                </div>
                <div className="bg-white/[0.02] p-6 rounded-[24px] border border-white/10 shadow-none backdrop-blur-sm">
                    <h3 className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-2">Current Plan</h3>
                    <div className="flex items-center justify-between">
                        <span className={`text-[28px] font-normal capitalize ${getPlanColor(analytics.plan)}`}>
                            {analytics.plan}
                        </span>
                        <Shield className="w-6 h-6 text-[#C4ED5F] opacity-50" />
                    </div>
                </div>
            </div>

            {/* Placeholder for future charts */}
            <div className="bg-white/[0.02] border border-white/10 rounded-[24px] shadow-none overflow-hidden backdrop-blur-sm p-12 flex flex-col items-center justify-center text-center">
                <Activity className="w-12 h-12 text-[#C4ED5F] opacity-20 mb-4" />
                <h3 className="text-[18px] font-medium text-white mb-2">Time-Series Analytics</h3>
                <p className="text-gray-400 text-[14px] max-w-md">
                    Detailed time-series graphs of your encryption bandwidth and API requests will appear here once you exceed 100 requests.
                </p>
            </div>
        </div>
    );
}
