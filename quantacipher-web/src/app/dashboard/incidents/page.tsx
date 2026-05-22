"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface Incident {
    _id: string;
    monitorName: string;
    endpoint: string;
    status: string;
    timestamp: string;
    latency: number;
    errorMessage?: string;
}

export default function IncidentsPage() {
    const { status } = useSession();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchIncidents();
        }
    }, [status]);

    const fetchIncidents = async () => {
        try {
            const res = await fetch('/api/incidents');
            if (res.ok) {
                const data = await res.json();
                setIncidents(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-[#5f6368]" />
                </Link>
                <h1 className="text-[24px] font-normal text-[#202124]">Incident History</h1>
            </div>

            <div className="bg-white border border-[#dadce0] rounded-[8px] shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#dadce0] bg-[#f8f9fa] text-[12px] font-medium text-[#5f6368] uppercase tracking-wider">
                    <div className="col-span-4">Monitor</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-4">Error / Details</div>
                    <div className="col-span-2 text-right">Time</div>
                </div>
                <div className="divide-y divide-[#dadce0]">
                    {incidents.length === 0 && (
                        <div className="p-8 text-center text-[#5f6368]">
                            <CheckCircle2 className="w-12 h-12 text-[#34a853] mx-auto mb-3 opacity-20" />
                            <p>No incidents found. Your systems are 100% healthy!</p>
                        </div>
                    )}
                    {incidents.map((incident) => (
                        <div key={incident._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#f8f9fa] transition-colors">
                            <div className="col-span-4">
                                <div className="font-medium text-[#202124]">{incident.monitorName}</div>
                                <div className="text-[12px] text-[#5f6368] truncate font-mono">{incident.endpoint}</div>
                            </div>
                            <div className="col-span-2">
                                <span className="flex items-center gap-1.5 text-[#d93025] font-medium text-[13px] bg-[#fce8e6] px-2 py-1 rounded-full w-fit">
                                    <XCircle className="w-4 h-4" /> Down
                                </span>
                            </div>
                            <div className="col-span-4 text-[13px] text-[#d93025]">
                                {incident.errorMessage || "Connection timed out"}
                            </div>
                            <div className="col-span-2 text-right text-[12px] text-[#5f6368]">
                                {new Date(incident.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
