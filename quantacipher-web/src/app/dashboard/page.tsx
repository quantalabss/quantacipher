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
    Shield,
    Database,
    Settings,
    Loader2,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

function formatDate(date: string | undefined) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
}

function getPlanColor(plan: string) {
    switch (plan) {
        case 'startup': return 'text-[#1a73e8]';
        case 'business': return 'text-[#34a853]';
        case 'enterprise': return 'text-[#9334e6]';
        default: return 'text-[#5f6368]';
    }
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({
        totalCalls: 0,
        totalBytes: 0,
        activeKeys: 0,
        plan: "free"
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form States
    const [newKeyName, setNewKeyName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch keys from real API
    const fetchKeys = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/keys');
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to load keys');
            }
            const data = await res.json();
            setApiKeys(data.keys || []);
            setAnalytics(data.analytics || { totalCalls: 0, totalBytes: 0, activeKeys: 0, plan: 'free' });
        } catch (err: any) {
            setError(err.message || 'Failed to load API keys.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") {
            fetchKeys();
        }
    }, [status, fetchKeys]);

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
            setAnalytics(prev => ({ ...prev, activeKeys: prev.activeKeys + 1 }));
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
            setAnalytics(prev => ({ ...prev, activeKeys: Math.max(0, prev.activeKeys - 1) }));
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
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" />
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
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[28px] font-normal text-[#202124]">QuantaCipher Dashboard</h1>
                <p className="text-[#5f6368] mt-1">Manage your Zero-Trust API keys and monitor your cryptographic usage.</p>
            </div>

            {/* Global error */}
            {error && (
                <div className="mb-6 flex items-center gap-3 bg-[#fce8e6] border border-[#f5c6c4] rounded-[8px] px-4 py-3 text-[#c5221f]">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[14px]">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-[#c5221f] hover:text-[#a50e0e]">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[8px] border border-[#dadce0] shadow-sm">
                    <h3 className="text-[12px] font-medium text-[#5f6368] uppercase tracking-wider mb-2">Active Keys</h3>
                    <div className="flex items-center gap-3">
                        <div className="text-[32px] font-normal text-[#202124]">{analytics.activeKeys}</div>
                        <Key className="w-6 h-6 text-[#1a73e8] opacity-50" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[8px] border border-[#dadce0] shadow-sm">
                    <h3 className="text-[12px] font-medium text-[#5f6368] uppercase tracking-wider mb-2">API Calls (Total)</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-[32px] font-normal text-[#202124]">
                            {analytics.totalCalls.toLocaleString()}
                        </span>
                        <Activity className="w-6 h-6 text-[#34a853] opacity-50" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[8px] border border-[#dadce0] shadow-sm">
                    <h3 className="text-[12px] font-medium text-[#5f6368] uppercase tracking-wider mb-2">Data Secured</h3>
                    <div className="flex items-center gap-3">
                        <div className="text-[32px] font-normal text-[#202124]">{formatBytes(analytics.totalBytes)}</div>
                        <Database className="w-6 h-6 text-[#fbbc04] opacity-50" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[8px] border border-[#dadce0] shadow-sm">
                    <h3 className="text-[12px] font-medium text-[#5f6368] uppercase tracking-wider mb-2">Current Plan</h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-[28px] font-normal capitalize ${getPlanColor(analytics.plan)}`}>
                            {analytics.plan}
                        </span>
                        <Shield className="w-5 h-5 text-[#5f6368]" />
                    </div>
                </div>
            </div>

            {/* API Keys List Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-[20px] font-normal text-[#202124]">API Keys</h2>
                <div className="flex gap-3">
                    <Link href="/dashboard/billing">
                        <Button variant="outline" className="gap-2 bg-white border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] h-[40px]">
                            <Settings className="w-4 h-4" /> Upgrade Plan
                        </Button>
                    </Link>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#1a73e8] hover:bg-[#1967d2] text-white rounded-[4px] px-6 h-[40px] text-[14px] font-medium shadow-sm flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Generate Key
                    </Button>
                </div>
            </div>

            {/* API Keys Table */}
            <div className="bg-white border border-[#dadce0] rounded-[8px] shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#dadce0] bg-[#f8f9fa] text-[12px] font-medium text-[#5f6368] uppercase tracking-wider">
                    <div className="col-span-5 md:col-span-4">Name &amp; Key</div>
                    <div className="col-span-3 md:col-span-2 text-center">Status</div>
                    <div className="hidden md:block col-span-2 text-center">API Calls</div>
                    <div className="hidden md:block col-span-2 text-center">Secured</div>
                    <div className="col-span-4 md:col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-[#dadce0]">
                    {apiKeys.length === 0 && (
                        <div className="p-12 text-center text-[#5f6368]">
                            <Key className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No API keys yet. Generate one to start securing data with Kyber-1024.</p>
                        </div>
                    )}
                    {apiKeys.map((apiKey) => (
                        <motion.div
                            key={apiKey._id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#f8f9fa] transition-colors"
                        >
                            <div className="col-span-5 md:col-span-4 overflow-hidden">
                                <div className="font-medium text-[#202124] text-[16px] truncate">{apiKey.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="text-[#5f6368] text-[13px] font-mono truncate max-w-[200px] bg-[#f1f3f4] px-2 py-1 rounded-[4px] border border-[#dadce0]">
                                        {apiKey.key.substring(0, 12)}...{apiKey.key.substring(apiKey.key.length - 4)}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(apiKey.key)}
                                        className="text-[#1a73e8] hover:text-[#1967d2] p-1 rounded transition-colors"
                                        title="Copy full API Key"
                                    >
                                        {copiedKey === apiKey.key ? <CheckCircle2 className="w-4 h-4 text-[#137333]" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="text-[11px] text-[#9aa0a6] mt-1">Created {formatDate(apiKey.createdAt)}</div>
                            </div>
                            <div className="col-span-3 md:col-span-2 flex justify-center">
                                {apiKey.status === "active" ? (
                                    <div className="flex items-center gap-2 bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full text-[12px] font-medium">
                                        <CheckCircle2 className="w-4 h-4" /> <span className="hidden sm:inline">Active</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-[#fce8e6] text-[#c5221f] px-3 py-1 rounded-full text-[12px] font-medium">
                                        <XCircle className="w-4 h-4" /> <span className="hidden sm:inline">Revoked</span>
                                    </div>
                                )}
                            </div>
                            <div className="hidden md:block col-span-2 text-center">
                                <div className="text-[14px] font-medium text-[#202124]">
                                    {apiKey.calls.toLocaleString()}
                                </div>
                            </div>
                            <div className="hidden md:block col-span-2 text-center">
                                <div className="text-[14px] font-medium text-[#202124]">
                                    {formatBytes(apiKey.bytesSecured)}
                                </div>
                            </div>
                            <div className="col-span-4 md:col-span-2 flex justify-end gap-2">
                                {apiKey.status === 'active' && (
                                    <button onClick={() => confirmDelete(apiKey._id)} className="p-2 text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] rounded-full transition-colors" title="Revoke Key">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Generate Key Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-[480px] rounded-[24px] shadow-xl overflow-hidden"
                        >
                            <div className="px-6 py-6 pb-0 flex justify-between items-start">
                                <div>
                                    <h2 className="text-[24px] font-normal text-[#1f1f1f]">Generate API Key</h2>
                                    <p className="text-[#444746] text-[14px] mt-1">Create a new key for your application.</p>
                                </div>
                                <button onClick={() => { setIsAddModalOpen(false); setSubmitError(null); }} className="text-[#5f6368] hover:bg-[#f1f3f4] p-2 rounded-full transition-colors"><XCircle className="w-6 h-6" /></button>
                            </div>

                            <form onSubmit={handleGenerateKey} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            required
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            placeholder=" "
                                            className="peer w-full h-[56px] px-4 pt-4 rounded-[4px] bg-[#f1f3f4] border-b-[1px] border-[#5f6368] focus:border-[#1a73e8] focus:border-b-[2px] outline-none transition-all placeholder-transparent"
                                        />
                                        <label className="absolute left-4 top-4 text-[#5f6368] text-[16px] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-focus:top-2 peer-focus:text-[12px] peer-focus:text-[#1a73e8] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[12px] pointer-events-none">
                                            Key Name (e.g. Production App)
                                        </label>
                                    </div>

                                    {submitError && (
                                        <div className="flex items-start gap-2 bg-[#fce8e6] border border-[#f5c6c4] rounded-[8px] px-4 py-3 text-[#c5221f]">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <p className="text-[13px]">{submitError}</p>
                                        </div>
                                    )}

                                    <div className="bg-[#e8f0fe] p-4 rounded-[8px] flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
                                        <p className="text-[13px] text-[#1a73e8] font-medium leading-relaxed">
                                            This key allows the QuantaCipher SDK to send Kyber-1024 encrypted payloads to the Gateway. Keep it secret — treat it like a password.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => { setIsAddModalOpen(false); setSubmitError(null); }} className="text-[#1a73e8] hover:bg-[#f1f3f4] font-medium rounded-full px-6">Cancel</Button>
                                    <Button type="submit" disabled={submitting} className="bg-[#1a73e8] hover:bg-[#1967d2] text-white rounded-full px-6 font-medium shadow-none hover:shadow-md transition-all disabled:opacity-50">
                                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</> : "Generate Key"}
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-[400px] rounded-[24px] shadow-xl overflow-hidden p-6"
                        >
                            <h2 className="text-[24px] font-normal text-[#1f1f1f] mb-2">Revoke this API Key?</h2>
                            <p className="text-[#444746] text-[14px] mb-6">
                                Any applications using this key will immediately lose access to the QuantaCipher Gateway. This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} className="text-[#1a73e8] hover:bg-[#f1f3f4] font-medium rounded-full px-6">Cancel</Button>
                                <Button onClick={handleDelete} disabled={deleting} className="bg-[#d93025] hover:bg-[#c5221f] text-white rounded-full px-6 font-medium shadow-none hover:shadow-md transition-all">
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Revoke Key"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
