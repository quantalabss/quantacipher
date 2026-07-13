"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Key,
    Plus,
    CheckCircle2,
    XCircle,
    Trash2,
    Copy,
    Activity,
    Database,
    Settings,
    Loader2,
    AlertCircle,
    Terminal,
    ArrowUpRight,
    Server,
    ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ApiKey {
    _id: string;
    name: string;
    key: string;
    status: 'active' | 'revoked';
    calls: number;
    bytesSecured: number;
    createdAt: string;
}

interface Analytics {
    overview: {
        totalCalls: number;
        totalBytes: number;
        activeKeys: number;
        errorRate: string;
        plan: string;
    };
    chartData: { date: string; calls: number }[];
    recentActivity: {
        id: string;
        endpoint: string;
        status: number;
        bytesProcessed: number;
        time: string;
        keyName: string;
    }[];
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date: string | undefined) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [keysRes, analyticsRes] = await Promise.all([
                fetch('/api/keys'),
                fetch('/api/analytics')
            ]);

            if (!keysRes.ok || !analyticsRes.ok) {
                throw new Error('Failed to load dashboard data');
            }

            const keysData = await keysRes.json();
            const analyticsData = await analyticsRes.json();

            setApiKeys(keysData.keys || []);
            setAnalytics(analyticsData);
        } catch (err: any) {
            setError(err.message || 'Failed to load API keys.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            fetchData();
        }
    }, [status, fetchData]);

    const handleGenerateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);
        try {
            const res = await fetch('/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate key.');
            }
            setApiKeys(prev => [data, ...prev]);
            if (analytics) {
                setAnalytics(prev => prev ? ({
                    ...prev,
                    overview: { ...prev.overview, activeKeys: prev.overview.activeKeys + 1 }
                }) : prev);
            }
            setIsAddModalOpen(false);
            setNewKeyName("");
        } catch (err: any) {
            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (id: string) => {
        setKeyToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!keyToDelete) return;
        setDeleting(true);
        try {
            const res = await fetch('/api/keys', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyId: keyToDelete }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to revoke key.');
            }
            setApiKeys(prev => prev.filter(k => k._id !== keyToDelete));
            if (analytics) {
                setAnalytics(prev => prev ? ({
                    ...prev,
                    overview: { ...prev.overview, activeKeys: Math.max(0, prev.overview.activeKeys - 1) }
                }) : prev);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeleting(false);
            setDeleteModalOpen(false);
            setKeyToDelete(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(text);
        setTimeout(() => setCopiedKey(null), 2000);
    };

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

    return (
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-[#222] pb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight">Overview</h1>
                    <p className="text-gray-500 mt-2 font-medium">Monitor cryptographic usage and manage your API access.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link href="/dashboard/billing" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto gap-2 bg-transparent border-[#222] text-gray-300 hover:bg-[#111] hover:text-white rounded-none h-10 font-semibold text-xs uppercase tracking-wider">
                            <Settings className="w-4 h-4" /> Manage Plan
                        </Button>
                    </Link>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto bg-white text-black hover:bg-[#C4ED5F] rounded-none px-6 h-10 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Generate Key
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-8 flex items-center gap-3 bg-[#111] border border-red-500/20 rounded-none px-4 py-3 text-red-400">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-gray-500 hover:text-white">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#000] border border-[#222] p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total API Calls</p>
                        <Activity className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-3xl font-semibold text-white">
                        {analytics?.overview.totalCalls.toLocaleString()}
                    </p>
                </div>
                
                <div className="bg-[#000] border border-[#222] p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Data Secured</p>
                        <Database className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-3xl font-semibold text-white">
                        {formatBytes(analytics?.overview.totalBytes || 0)}
                    </p>
                </div>

                <div className="bg-[#000] border border-[#222] p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Active Keys</p>
                        <Key className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-3xl font-semibold text-white">
                        {analytics?.overview.activeKeys}
                    </p>
                </div>

                <div className="bg-[#000] border border-[#222] p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Error Rate</p>
                        <Server className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-3xl font-semibold text-white">
                        {analytics?.overview.errorRate}%
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column (Chart & Table) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Usage Chart */}
                    <div className="bg-[#000] border border-[#222] p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Usage Analytics (30d)</h2>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics?.chartData || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C4ED5F" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#C4ED5F" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '0px' }}
                                        itemStyle={{ color: '#C4ED5F', fontSize: '12px', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="calls" stroke="#C4ED5F" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* API Keys Table */}
                    <div className="bg-[#000] border border-[#222]">
                        <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#0a0a0a]">
                            <h2 className="text-sm font-bold text-white uppercase tracking-widest">API Keys</h2>
                        </div>
                        
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-[#222] bg-[#000] text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <div className="col-span-5">Name &amp; Token</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2 text-center">Calls</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-[#222]">
                            {apiKeys.length === 0 && (
                                <div className="p-12 text-center text-gray-500 bg-[#000]">
                                    <Key className="w-8 h-8 mx-auto mb-4 opacity-50" />
                                    <p className="text-sm font-medium">No API keys generated yet.</p>
                                </div>
                            )}
                            {apiKeys.map((apiKey) => (
                                <motion.div
                                    key={apiKey._id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 md:items-center bg-[#000] hover:bg-[#050505] transition-colors"
                                >
                                    <div className="flex flex-col md:col-span-5 min-w-0">
                                        <div className="font-semibold text-white text-sm truncate">{apiKey.name}</div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="text-gray-400 text-xs font-mono truncate bg-[#111] px-2 py-1 border border-[#222]">
                                                {apiKey.key.substring(0, 12)}...{apiKey.key.substring(apiKey.key.length - 4)}
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(apiKey.key)}
                                                className="text-gray-500 hover:text-white p-1 bg-[#111] hover:bg-[#222] border border-[#222] transition-colors"
                                                title="Copy full API Key"
                                            >
                                                {copiedKey === apiKey.key ? <CheckCircle2 className="w-3.5 h-3.5 text-[#C4ED5F]" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="hidden md:flex md:col-span-2 justify-center">
                                        {apiKey.status === "active" ? (
                                            <div className="flex items-center gap-1.5 text-[#C4ED5F] text-xs font-bold uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 bg-[#C4ED5F] rounded-full"></div> Active
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div> Revoked
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="hidden md:block col-span-2 text-center text-sm font-medium text-gray-300 font-mono">
                                        {apiKey.calls.toLocaleString()}
                                    </div>
                                    
                                    <div className="flex justify-end gap-2 md:col-span-3">
                                        {apiKey.status === 'active' && (
                                            <button onClick={() => confirmDelete(apiKey._id)} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-red-500 hover:bg-[#111] border border-transparent hover:border-red-500/20 transition-colors">
                                                Revoke
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Audit Log) */}
                <div className="lg:col-span-1">
                    <div className="bg-[#000] border border-[#222] h-full flex flex-col">
                        <div className="p-6 border-b border-[#222] bg-[#0a0a0a]">
                            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-gray-500" /> Event Stream
                            </h2>
                        </div>
                        <div className="p-0 flex-1 overflow-y-auto min-h-[400px]">
                            {analytics?.recentActivity?.length === 0 ? (
                                <div className="p-8 text-center text-gray-600 text-xs font-mono">
                                    Awaiting cryptographic events...
                                </div>
                            ) : (
                                <div className="divide-y divide-[#111]">
                                    {analytics?.recentActivity.map((log, i) => (
                                        <div key={i} className="p-4 hover:bg-[#050505] transition-colors group">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className={`font-mono text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${log.status === 200 ? 'text-[#C4ED5F] border-[#C4ED5F]/30 bg-[#C4ED5F]/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>
                                                    {log.status === 200 ? 'SUCCESS' : 'FAILED'}
                                                </span>
                                                <span className="text-[10px] text-gray-600 font-medium">
                                                    {log.time}
                                                </span>
                                            </div>
                                            <p className="text-sm font-mono text-gray-300">
                                                {log.endpoint}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                <span className="truncate max-w-[120px]">{log.keyName}</span>
                                                <span>•</span>
                                                <span className="font-mono">{formatBytes(log.bytesProcessed)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            className="bg-[#000] border border-[#222] w-full max-w-[480px] shadow-2xl rounded-none"
                        >
                            <div className="p-6 border-b border-[#222] flex justify-between items-start bg-[#0a0a0a]">
                                <div>
                                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Generate API Key</h2>
                                    <p className="text-gray-500 text-xs mt-1">Create a new token for environment access.</p>
                                </div>
                                <button onClick={() => { setIsAddModalOpen(false); setSubmitError(null); }} className="text-gray-500 hover:text-white transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleGenerateKey} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Key Identifier</label>
                                        <input
                                            type="text"
                                            required
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            placeholder="e.g. production-us-east-1"
                                            className="w-full h-12 px-4 bg-[#0a0a0a] border border-[#222] focus:border-[#C4ED5F] text-white text-sm outline-none transition-colors placeholder:text-gray-700 font-mono"
                                        />
                                    </div>

                                    {submitError && (
                                        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-3 text-red-400">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs font-medium">{submitError}</p>
                                        </div>
                                    )}

                                    <div className="bg-[#111] p-4 flex items-start gap-3 border border-[#222]">
                                        <ShieldAlert className="w-4 h-4 text-[#C4ED5F] shrink-0 mt-0.5" />
                                        <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                            This token allows the SDK to communicate with the Gateway using Kyber-1024 encryption. Keep it completely secret.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-[#222] mt-6">
                                    <Button type="button" variant="ghost" onClick={() => { setIsAddModalOpen(false); setSubmitError(null); }} className="text-gray-400 hover:text-white hover:bg-[#111] font-bold rounded-none px-6 text-xs uppercase tracking-wider">Cancel</Button>
                                    <Button type="submit" disabled={submitting} className="bg-white hover:bg-[#C4ED5F] text-black rounded-none px-6 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {deleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            className="bg-[#000] border border-[#222] w-full max-w-[400px] shadow-2xl rounded-none"
                        >
                            <div className="p-6">
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-2 text-red-500">Revoke Token?</h2>
                                <p className="text-gray-400 text-sm mb-8 font-medium">
                                    Traffic using this token will be immediately rejected by the Gateway. This is a destructive action.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} className="text-gray-400 hover:text-white hover:bg-[#111] font-bold rounded-none px-6 text-xs uppercase tracking-wider">Cancel</Button>
                                    <Button onClick={handleDelete} disabled={deleting} className="bg-red-500 hover:bg-red-600 text-white rounded-none px-6 font-bold text-xs uppercase tracking-wider transition-colors">
                                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Revoke"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
