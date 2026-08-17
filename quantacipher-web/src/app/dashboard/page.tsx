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
                <Loader2 className="w-8 h-8 animate-spin text-[#8b7355]" />
                <p className="text-[#6B6356] text-sm font-mono uppercase tracking-widest font-bold">Loading Telemetry...</p>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-[#E8E5DF] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#111111] tracking-tight font-serif">Overview</h1>
                    <p className="text-[#6B6356] mt-2 font-medium">Monitor cryptographic usage and manage your API access.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link href="/dashboard/billing" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto gap-2 bg-[#FCFBF9] border-[#E8E5DF] text-[#111111] hover:bg-[#FFFFFF] rounded h-10 font-bold text-xs uppercase tracking-wider shadow-sm">
                            <Settings className="w-4 h-4" /> Manage Plan
                        </Button>
                    </Link>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto bg-[#111111] text-white hover:bg-[#2c2c2c] rounded px-6 h-10 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors shadow-clean"
                    >
                        <Plus className="w-4 h-4" /> Generate Key
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-8 flex items-center gap-3 bg-[#FCFBF9] border border-red-500/20 rounded px-4 py-3 text-red-500">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-[#6B6356] hover:text-[#111111]">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded p-6 shadow-clean group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-bold text-[#6B6356] uppercase tracking-widest">Total API Calls</p>
                        <Activity className="w-4 h-4 text-[#8b7355]" />
                    </div>
                    <p className="text-3xl font-bold text-[#111111] font-serif">
                        {analytics?.overview.totalCalls.toLocaleString()}
                    </p>
                </div>
                
                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded p-6 shadow-clean">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-bold text-[#6B6356] uppercase tracking-widest">Data Secured</p>
                        <Database className="w-4 h-4 text-[#8b7355]" />
                    </div>
                    <p className="text-3xl font-bold text-[#111111] font-serif">
                        {formatBytes(analytics?.overview.totalBytes || 0)}
                    </p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded p-6 shadow-clean">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-bold text-[#6B6356] uppercase tracking-widest">Active Keys</p>
                        <Key className="w-4 h-4 text-[#8b7355]" />
                    </div>
                    <p className="text-3xl font-bold text-[#111111] font-serif">
                        {analytics?.overview.activeKeys}
                    </p>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded p-6 shadow-clean">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-xs font-bold text-[#6B6356] uppercase tracking-widest">Error Rate</p>
                        <Server className="w-4 h-4 text-[#8b7355]" />
                    </div>
                    <p className="text-3xl font-bold text-[#111111] font-serif">
                        {analytics?.overview.errorRate}%
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column (Chart & Table) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Usage Chart */}
                    <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded p-6 shadow-clean">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-widest font-serif">Usage Analytics (30d)</h2>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics?.chartData || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b7355" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#8b7355" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DF" vertical={false} />
                                    <XAxis dataKey="date" stroke="#6B6356" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6B6356" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#8b7355', fontSize: '12px', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#6B6356', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="calls" stroke="#8b7355" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* API Keys Table */}
                    <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded overflow-hidden shadow-clean">
                        <div className="p-6 border-b border-[#E8E5DF] flex justify-between items-center bg-[#FCFBF9]">
                            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-widest font-serif">API Keys</h2>
                        </div>
                        
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-[#E8E5DF] bg-[#FFFFFF] text-[10px] font-bold text-[#6B6356] uppercase tracking-widest font-sans">
                            <div className="col-span-5">Name &amp; Token</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2 text-center">Calls</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-[#E8E5DF]">
                            {apiKeys.length === 0 && (
                                <div className="p-12 text-center text-[#6B6356] bg-[#FFFFFF]">
                                    <Key className="w-8 h-8 mx-auto mb-4 opacity-50 text-[#8b7355]" />
                                    <p className="text-sm font-medium">No API keys generated yet.</p>
                                </div>
                            )}
                            {apiKeys.map((apiKey) => (
                                <motion.div
                                    key={apiKey._id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 md:items-center bg-[#FFFFFF] hover:bg-[#FCFBF9] transition-colors"
                                >
                                    <div className="flex flex-col md:col-span-5 min-w-0">
                                        <div className="font-bold text-[#111111] text-sm truncate font-serif">{apiKey.name}</div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="text-[#6B6356] text-xs font-mono truncate bg-[#FCFBF9] px-2 py-1 border border-[#E8E5DF] rounded">
                                                {apiKey.key.substring(0, 12)}...{apiKey.key.substring(apiKey.key.length - 4)}
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(apiKey.key)}
                                                className="text-[#6B6356] hover:text-[#111111] p-1 bg-[#FCFBF9] hover:bg-[#E8E5DF] border border-[#E8E5DF] rounded transition-colors"
                                                title="Copy full API Key"
                                            >
                                                {copiedKey === apiKey.key ? <CheckCircle2 className="w-3.5 h-3.5 text-[#8b7355]" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="hidden md:flex md:col-span-2 justify-center">
                                        {apiKey.status === "active" ? (
                                            <div className="flex items-center gap-1.5 text-[#8b7355] text-xs font-bold uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 bg-[#8b7355] rounded-full"></div> Active
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[#6B6356] text-xs font-bold uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 bg-[#6B6356] rounded-full"></div> Revoked
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="hidden md:block col-span-2 text-center text-sm font-bold text-[#111111] font-mono">
                                        {apiKey.calls.toLocaleString()}
                                    </div>
                                    
                                    <div className="flex justify-end gap-2 md:col-span-3">
                                        {apiKey.status === 'active' && (
                                            <button onClick={() => confirmDelete(apiKey._id)} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#6B6356] hover:text-red-600 hover:bg-[#FCFBF9] border border-transparent hover:border-red-600/20 rounded transition-colors">
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
                    <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded h-full flex flex-col shadow-clean">
                        <div className="p-6 border-b border-[#E8E5DF] bg-[#FCFBF9]">
                            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-widest flex items-center gap-2 font-serif">
                                <Terminal className="w-4 h-4 text-[#8b7355]" /> Event Stream
                            </h2>
                        </div>
                        <div className="p-0 flex-1 overflow-y-auto min-h-[400px]">
                            {analytics?.recentActivity?.length === 0 ? (
                                <div className="p-8 text-center text-[#6B6356] text-xs font-mono font-medium">
                                    Awaiting cryptographic events...
                                </div>
                            ) : (
                                <div className="divide-y divide-[#E8E5DF]">
                                    {analytics?.recentActivity.map((log, i) => (
                                        <div key={i} className="p-4 hover:bg-[#FCFBF9] transition-colors group">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className={`font-mono text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 border rounded ${log.status === 200 ? 'text-[#8b7355] border-[#8b7355]/30 bg-[#FCFBF9]' : 'text-red-600 border-red-600/30 bg-red-50'}`}>
                                                    {log.status === 200 ? 'SUCCESS' : 'FAILED'}
                                                </span>
                                                <span className="text-[10px] text-[#6B6356] font-medium">
                                                    {log.time}
                                                </span>
                                            </div>
                                            <p className="text-sm font-mono font-bold text-[#111111]">
                                                {log.endpoint}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-[#6B6356] font-medium">
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
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            className="bg-[#FFFFFF] border border-[#E8E5DF] w-full max-w-[480px] shadow-2xl rounded"
                        >
                            <div className="p-6 border-b border-[#E8E5DF] flex justify-between items-start bg-[#FCFBF9]">
                                <div>
                                    <h2 className="text-lg font-bold text-[#111111] uppercase tracking-wider font-serif">Generate API Key</h2>
                                    <p className="text-[#6B6356] text-xs mt-1 font-medium">Create a new token for environment access.</p>
                                </div>
                                <button onClick={() => { setIsAddModalOpen(false); setSubmitError(null); }} className="text-[#6B6356] hover:text-[#111111] transition-colors">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleGenerateKey} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#6B6356] uppercase tracking-widest">Key Identifier</label>
                                        <input
                                            type="text"
                                            required
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            placeholder="e.g. production-us-east-1"
                                            className="w-full h-12 px-4 bg-[#FFFFFF] border border-[#E8E5DF] rounded focus:border-[#8b7355] focus:ring-1 focus:ring-[#8b7355] text-[#111111] text-sm outline-none transition-colors placeholder:text-[#6B6356] font-mono shadow-sm"
                                        />
                                    </div>

                                    {submitError && (
                                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded p-3 text-red-600">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs font-medium">{submitError}</p>
                                        </div>
                                    )}

                                    <div className="bg-[#FCFBF9] p-4 flex items-start gap-3 border border-[#E8E5DF] rounded">
                                        <ShieldAlert className="w-4 h-4 text-[#8b7355] shrink-0 mt-0.5" />
                                        <p className="text-xs text-[#6B6356] leading-relaxed font-medium">
                                            This token allows the SDK to communicate with the Gateway using Kyber-1024 encryption. Keep it completely secret.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-[#E8E5DF] mt-6">
                                    <Button type="button" variant="ghost" onClick={() => { setIsAddModalOpen(false); setSubmitError(null); }} className="text-[#6B6356] hover:text-[#111111] hover:bg-[#E8E5DF] font-bold rounded px-6 text-xs uppercase tracking-wider">Cancel</Button>
                                    <Button type="submit" disabled={submitting} className="bg-[#111111] hover:bg-[#2c2c2c] text-white rounded px-6 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-clean">
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
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            className="bg-[#FFFFFF] border border-[#E8E5DF] w-full max-w-[400px] shadow-2xl rounded"
                        >
                            <div className="p-6">
                                <h2 className="text-lg font-bold uppercase tracking-wider mb-2 text-red-600 font-serif">Revoke Token?</h2>
                                <p className="text-[#6B6356] text-sm mb-8 font-medium">
                                    Traffic using this token will be immediately rejected by the Gateway. This is a destructive action.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} className="text-[#6B6356] hover:text-[#111111] hover:bg-[#E8E5DF] font-bold rounded px-6 text-xs uppercase tracking-wider">Cancel</Button>
                                    <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white rounded px-6 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
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
