"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Activity, Loader2, Key } from "lucide-react";

export default function DemoPage() {
    const [plaintext, setPlaintext] = useState("{\n  \"patientId\": \"987-654-321\",\n  \"diagnosis\": \"Type 2 Diabetes\",\n  \"medication\": \"Metformin 500mg\"\n}");
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [result, setResult] = useState<{
        ciphertext: string;
        receiptId: string;
        algorithm: string;
        latencyMs: number;
    } | null>(null);

    const handleEncrypt = async () => {
        setIsEncrypting(true);
        setResult(null);

        try {
            const res = await fetch("/api/demo/encrypt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plaintext }),
            });
            const data = await res.json();
            
            if (data.success) {
                setResult(data);
            }
        } catch (error) {
            console.error("Encryption failed", error);
        } finally {
            setIsEncrypting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-[#f3f4f6] text-[#C4ED5F] px-3 py-1 rounded-full text-[13px] font-medium mb-6">
                        <Activity className="w-4 h-4" />
                        Live Demo
                    </div>
                    <h1 className="text-[32px] sm:text-[48px] font-normal text-[black] mb-4">
                        Experience Post-Quantum Encryption
                    </h1>
                    <p className="text-[18px] text-[#6b7280]">
                        Type any JSON or text below. The QuantaCipher engine will encrypt it instantly using NIST Kyber-1024, demonstrating the speed of our WASM execution.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    {/* Left Pane: Plaintext Input */}
                    <div className="flex flex-col bg-white border border-[#e5e7eb] rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden h-[400px]">
                        <div className="bg-[#f1f3f4] border-b border-[#e5e7eb] px-6 py-4 flex items-center gap-3">
                            <Key className="w-5 h-5 text-[#6b7280]" />
                            <h2 className="text-[16px] font-medium text-[black]">Plaintext Payload</h2>
                        </div>
                        <div className="flex-grow p-6">
                            <textarea
                                value={plaintext}
                                onChange={(e) => setPlaintext(e.target.value)}
                                className="w-full h-full resize-none outline-none font-mono text-[14px] leading-relaxed text-[black] bg-transparent"
                                placeholder="Enter JSON or text..."
                                spellCheck={false}
                            />
                        </div>
                        <div className="bg-white border-t border-[#e5e7eb] p-4 flex justify-end">
                            <Button
                                onClick={handleEncrypt}
                                disabled={isEncrypting || !plaintext}
                                className="bg-[#C4ED5F] hover:bg-[black] text-white px-8 h-[44px] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] font-medium transition-all w-full sm:w-auto"
                            >
                                {isEncrypting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Encrypting...</>
                                ) : (
                                    <><Shield className="w-4 h-4 mr-2" /> Encrypt with Kyber-1024</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right Pane: Ciphertext Output */}
                    <div className="flex flex-col bg-[black] rounded-[2rem] shadow-xl overflow-hidden h-[400px] border border-[#1f2937]">
                        <div className="bg-[#303134] border-b border-[#1f2937] px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-[#34a853]" />
                                <h2 className="text-[16px] font-medium text-white">Quantum-Safe Ciphertext</h2>
                            </div>
                            {result && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
                                    <span className="text-[#34a853] text-[12px] font-medium">{result.latencyMs}ms execution</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-grow p-6 overflow-y-auto font-mono text-[13px] text-[#d4d4d4] leading-relaxed break-all whitespace-pre-wrap">
                            {isEncrypting ? (
                                <div className="h-full flex flex-col items-center justify-center text-[#9aa0a6]">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#C4ED5F]" />
                                    <p>Generating lattice-based keys...</p>
                                </div>
                            ) : result ? (
                                <div className="animate-in fade-in duration-500">
                                    {result.ciphertext}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[#6b7280]">
                                    Waiting for encryption request...
                                </div>
                            )}
                        </div>

                        {/* Receipt Block */}
                        {result && (
                            <div className="bg-[#137333]/10 border-t border-[#137333]/30 p-6 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[#34a853] text-[12px] font-bold uppercase tracking-wider">Cryptographic Receipt</span>
                                    <span className="text-[#9aa0a6] text-[12px] font-mono">{result.receiptId}</span>
                                </div>
                                <div className="text-[#e8eaed] text-[14px]">
                                    Successfully secured using <span className="font-bold text-white">{result.algorithm}</span>. Ready for zero-trust transmission.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
