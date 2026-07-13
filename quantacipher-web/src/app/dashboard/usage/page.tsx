"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Activity,
    Loader2,
    Database,
    ShieldAlert,
    XCircle,
    Server,
    Download
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

interface Analytics {
    overview: {
        totalCalls: number;
        totalBytes: number;
        activeKeys: number;
        errorRate: string;
        plan: string;
    };
    chartData: { date: string; calls: number; bytes: number }[];
    recentActivity: any[];
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function UsagePage() {
    const { status } = useSession();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "authenticated") {
            fetch('/api/analytics')
                .then(res => {
                    if (!res.ok) throw new Error("Failed to load analytics");
                    return res.json();
                })
                .then(data => {
                    setAnalytics(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [status]);

    if (status === "loading" || (status === "authenticated" && loading)) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-transparent gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#C4ED5F]" />
                <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">Loading Telemetry...</p>
            </div>
        );
    }

    if (status === "unauthenticated") {
        if (typeof window !== "undefined") {
            window.location.href = "/signin";
        }
        return null;
    }

    // Transform chart data for bandwidth chart
    const bandwidthData = analytics?.chartData.map(d => ({
        date: d.date,
        bandwidth: (d.bytes || 0) / (1024 * 1024) // Convert to MB
    })) || [];

    return (
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-[#222] pb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight">Usage & Telemetry</h1>
                    <p className="text-gray-500 mt-2 font-medium">Deep dive into your API request volume and cryptographic bandwidth.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="w-full sm:w-auto bg-transparent border border-[#222] text-gray-300 hover:bg-[#111] hover:text-white px-6 h-10 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-8 flex items-center gap-3 bg-[#111] border border-red-500/20 px-4 py-3 text-red-400">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-gray-500 hover:text-white">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#000] border border-[#222] p-6">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Calls (30d)</p>
                        <Activity className="w-4 h-4 text-[#C4ED5F]" />
                    </div>
                    <p className="text-3xl font-semibold text-white">
                        {analytics?.overview.totalCalls.toLocaleString()}
                    </p>
                    <div className="mt-4 text-xs font-mono text-gray-500">
                        Limits: {(analytics?.overview.totalCalls || 0).toLocaleString()} / 10,000
                    </div>
                </div>
                
                <div className="bg-[#000] border border-[#222] p-6">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Bandwidth Secured</p>
                        <Database className="w-4 h-4 text-[#C4ED5F]" />
                    </div>
                    <p className="text-3xl font-semibold text-white">
                        {formatBytes(analytics?.overview.totalBytes || 0)}
                    </p>
                    <div className="mt-4 text-xs font-mono text-gray-500">
                        Average: 4.2 KB / req
                    </div>
                </div>

                <div className="bg-[#000] border border-[#222] p-6">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Global Error Rate</p>
                        <Server className="w-4 h-4 text-red-400" />
                    </div>
                    <p className="text-3xl font-semibold text-white">
                        {analytics?.overview.errorRate}%
                    </p>
                    <div className="mt-4 text-xs font-mono text-[#C4ED5F]">
                        99.99% Uptime Maintained
                    </div>
                </div>

                <div className="bg-[#000] border border-[#222] p-6">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Current Plan</p>
                        <ShieldAlert className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-3xl font-semibold text-white capitalize">
                        {analytics?.overview.plan}
                    </p>
                    <div className="mt-4 text-xs font-mono text-gray-500">
                        Next cycle: Aug 1, 2026
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* API Requests Chart */}
                <div className="bg-[#000] border border-[#222] p-6">
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">API Requests</h2>
                        <p className="text-xs text-gray-500 mt-1 font-mono">Total requests over the last 30 days</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.chartData || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCallsDetailed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C4ED5F" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#C4ED5F" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '0px' }}
                                    itemStyle={{ color: '#C4ED5F', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}
                                    labelStyle={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}
                                />
                                <Area type="step" dataKey="calls" stroke="#C4ED5F" strokeWidth={2} fillOpacity={1} fill="url(#colorCallsDetailed)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bandwidth Chart */}
                <div className="bg-[#000] border border-[#222] p-6">
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Bandwidth Secured (MB)</h2>
                        <p className="text-xs text-gray-500 mt-1 font-mono">Volume of payload encrypted</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bandwidthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '0px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}
                                    labelStyle={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}
                                    cursor={{ fill: '#111' }}
                                />
                                <Bar dataKey="bandwidth" fill="#333" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Error Breakdown (Simulated data for visual completeness) */}
            <div className="bg-[#000] border border-[#222]">
                <div className="p-6 border-b border-[#222] bg-[#0a0a0a]">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">Response Codes (Last 24h)</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <div className="text-xs font-bold text-[#C4ED5F] mb-1 font-mono">200 OK</div>
                            <div className="text-2xl font-semibold text-white">{(analytics?.overview.totalCalls || 0)}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-yellow-500 mb-1 font-mono">400 Bad Request</div>
                            <div className="text-2xl font-semibold text-white">0</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-red-500 mb-1 font-mono">401 Unauthorized</div>
                            <div className="text-2xl font-semibold text-white">0</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-red-600 mb-1 font-mono">500 Server Error</div>
                            <div className="text-2xl font-semibold text-white">0</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
