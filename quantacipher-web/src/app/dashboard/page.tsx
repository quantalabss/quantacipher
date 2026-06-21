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
        case 'startup': return 'text-[#C4ED5F]';
        case 'business': return 'text-[#C4ED5F]';
        case 'enterprise': return 'text-[#C4ED5F]';
        default: return 'text-gray-400';
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
            <div className="mb-8">
                <h1 className="text-[28px] font-normal text-white">QuantaCipher Dashboard</h1>
                <p className="text-gray-400 mt-1">Manage your Zero-Trust API keys and monitor your cryptographic usage.</p>
            </div>

            {/* Global error */}
            {error && (
                <div className="mb-6 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[14px]">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-gray-400 hover:text-white">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}



            {/* API Keys List Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-[20px] font-normal text-white">API Keys</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Link href="/dashboard/billing" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto gap-2 bg-transparent border-white/10 text-gray-400 hover:bg-transparent h-[40px]">
                            <Settings className="w-4 h-4" /> Upgrade Plan
                        </Button>
                    </Link>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto bg-white text-black hover:bg-[#C4ED5F] hover:text-black rounded-full px-6 h-[40px] uppercase tracking-wider text-[12px] text-[14px] font-medium shadow-none flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Generate Key
                    </Button>
                </div>
            </div>

            {/* API Keys Table */}
            <div className="bg-white/[0.02] border border-white/10 rounded-[24px] shadow-none overflow-hidden backdrop-blur-sm">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-transparent text-[12px] font-medium text-gray-400 uppercase tracking-wider">
                    <div className="col-span-4">Name &amp; Key</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-center">API Calls</div>
                    <div className="col-span-2 text-center">Secured</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-[#e5e7eb]">
                    {apiKeys.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
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
                            className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 md:items-center hover:bg-transparent transition-colors"
                        >
                            {/* Mobile Top Row / Desktop Col 1 */}
                            <div className="flex justify-between items-start md:col-span-4 overflow-hidden gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white text-[16px] truncate">{apiKey.name}</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="text-gray-400 text-[13px] font-mono truncate max-w-[180px] sm:max-w-[200px] bg-white/5 px-2 py-1 rounded-[4px] border border-white/10">
                                            {apiKey.key.substring(0, 12)}...{apiKey.key.substring(apiKey.key.length - 4)}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(apiKey.key)}
                                            className="text-[#C4ED5F] hover:text-white p-1.5 bg-white/5 hover:bg-white/5 rounded-[4px] transition-colors"
                                            title="Copy full API Key"
                                        >
                                            {copiedKey === apiKey.key ? <CheckCircle2 className="w-4 h-4 text-[#C4ED5F]" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="text-[11px] text-[#9aa0a6] mt-2">Created {formatDate(apiKey.createdAt)}</div>
                                    
                                    {/* Mobile Only: Extra Stats inline */}
                                    <div className="flex md:hidden items-center gap-4 mt-3 text-[12px] text-gray-400">
                                        <div className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> {apiKey.calls.toLocaleString()}</div>
                                        <div className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> {formatBytes(apiKey.bytesSecured)}</div>
                                    </div>
                                </div>
                                
                                {/* Mobile Status & Actions */}
                                <div className="flex flex-col items-end gap-3 md:hidden shrink-0">
                                    {apiKey.status === "active" ? (
                                        <div className="flex items-center gap-1 bg-[#C4ED5F]/10 text-[#C4ED5F] px-2 py-1 rounded-[4px] text-[11px] font-bold tracking-wide uppercase">
                                            Active
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 bg-white/5 text-gray-400 px-2 py-1 rounded-[4px] text-[11px] font-bold tracking-wide uppercase">
                                            Revoked
                                        </div>
                                    )}
                                    {apiKey.status === 'active' && (
                                        <button onClick={() => confirmDelete(apiKey._id)} className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/5 rounded-[4px] transition-colors mt-auto">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Desktop Columns */}
                            <div className="hidden md:flex md:col-span-2 justify-center">
                                {apiKey.status === "active" ? (
                                    <div className="flex items-center gap-2 bg-[#C4ED5F]/10 text-[#C4ED5F] px-3 py-1 rounded-full text-[12px] font-medium">
                                        <CheckCircle2 className="w-4 h-4" /> <span>Active</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-white/5 text-gray-400 px-3 py-1 rounded-full text-[12px] font-medium">
                                        <XCircle className="w-4 h-4" /> <span>Revoked</span>
                                    </div>
                                )}
                            </div>
                            <div className="hidden md:block col-span-2 text-center">
                                <div className="text-[14px] font-medium text-white">
                                    {apiKey.calls.toLocaleString()}
                                </div>
                            </div>
                            <div className="hidden md:block col-span-2 text-center">
                                <div className="text-[14px] font-medium text-white">
                                    {formatBytes(apiKey.bytesSecured)}
                                </div>
                            </div>
                            <div className="hidden md:flex col-span-2 justify-end gap-2">
                                {apiKey.status === 'active' && (
                                    <button onClick={() => confirmDelete(apiKey._id)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors" title="Revoke Key">
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0a0a0a] border border-white/10 w-full max-w-[480px] rounded-[24px] shadow-xl overflow-hidden"
                        >
                            <div className="px-6 py-6 pb-0 flex justify-between items-start">
                                <div>
                                    <h2 className="text-[24px] font-normal text-white">Generate API Key</h2>
                                    <p className="text-gray-400 text-[14px] mt-1">Create a new key for your application.</p>
                                </div>
                                <button onClick={() => { setIsAddModalOpen(false); setSubmitError(null); }} className="text-gray-400 hover:bg-white/5 p-2 rounded-full transition-colors"><XCircle className="w-6 h-6" /></button>
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
                                            className="peer w-full h-[56px] px-4 pt-4 rounded-[4px] bg-white/5 border-b-[1px] border-[#6b7280] focus:border-[#C4ED5F] focus:border-b-[2px] outline-none transition-all placeholder-transparent"
                                        />
                                        <label className="absolute left-4 top-4 text-gray-400 text-[16px] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-focus:top-2 peer-focus:text-[12px] peer-focus:text-[#C4ED5F] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[12px] pointer-events-none">
                                            Key Name (e.g. Production App)
                                        </label>
                                    </div>

                                    {submitError && (
                                        <div className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <p className="text-[13px]">{submitError}</p>
                                        </div>
                                    )}

                                    <div className="bg-white/5 p-4 rounded-xl flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-[#C4ED5F] shrink-0 mt-0.5" />
                                        <p className="text-[13px] text-[#C4ED5F] font-medium leading-relaxed">
                                            This key allows the QuantaCipher SDK to send Kyber-1024 encrypted payloads to the Gateway. Keep it secret — treat it like a password.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => { setIsAddModalOpen(false); setSubmitError(null); }} className="text-white hover:bg-white/10 font-medium rounded-full px-6">Cancel</Button>
                                    <Button type="submit" disabled={submitting} className="bg-[#C4ED5F] hover:bg-white hover:text-black text-black rounded-full px-6 font-medium shadow-none hover:shadow-md transition-all disabled:opacity-50">
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0a0a0a] border border-white/10 w-full max-w-[400px] rounded-[24px] shadow-xl overflow-hidden p-6"
                        >
                            <h2 className="text-[24px] font-normal text-white mb-2">Revoke this API Key?</h2>
                            <p className="text-gray-400 text-[14px] mb-6">
                                Any applications using this key will immediately lose access to the QuantaCipher Gateway. This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} className="text-[#C4ED5F] hover:bg-white/5 font-medium rounded-full px-6">Cancel</Button>
                                <Button onClick={handleDelete} disabled={deleting} className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium shadow-none hover:shadow-md transition-all">
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
