"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Loader2, Key, Unlock, ShieldCheck, Zap } from "lucide-react";
import { QuantaCipher } from "quantacipher-sdk";

export default function DemoPage() {
    const [mode, setMode] = useState<"vault" | "secure">("vault");
    const [plaintext, setPlaintext] = useState("{\n  \"patientId\": \"987-654-321\",\n  \"diagnosis\": \"Type 2 Diabetes\",\n  \"medication\": \"Metformin 500mg\"\n}");
    
    const [keys, setKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);
    
    const [result, setResult] = useState<{
        ciphertext: string;
        receiptId: string;
        algorithm: string;
        latencyMs: number;
    } | null>(null);
    
    const [decryptedText, setDecryptedText] = useState<string | null>(null);

    const sdk = new QuantaCipher({ apiKey: "demo_client" });

    const handleGenerateKeys = () => {
        setIsGenerating(true);
        setTimeout(() => {
            try {
                const newKeys = sdk.generateKeypair();
                setKeys(newKeys);
            } catch (err) {
                console.error("Failed to generate keys:", err);
                alert("Please ensure you have built the dual-mode WASM.");
            }
            setIsGenerating(false);
        }, 600);
    };

    const handleEncrypt = async () => {
        setIsEncrypting(true);
        setResult(null);
        setDecryptedText(null);

        try {
            const start = Date.now();
            let ciphertext = "";
            
            if (mode === "vault") {
                ciphertext = sdk.encryptVault(plaintext);
            } else {
                if (!keys) throw new Error("Generate keys first");
                ciphertext = sdk.encryptSecure(plaintext, keys.publicKey);
            }
            const latencyMs = Date.now() - start;

            const res = await fetch("/api/demo/proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ciphertext }),
            });
            const data = await res.json();
            
            if (data.success) {
                setResult({
                    ciphertext,
                    receiptId: data.receiptId,
                    algorithm: data.algorithm,
                    latencyMs,
                });
            } else {
                setResult({
                    ciphertext,
                    receiptId: "qz_rcpt_ratelimited_local",
                    algorithm: "Kyber-1024 + AES-256-GCM",
                    latencyMs,
                });
            }
        } catch (error) {
            console.error("Encryption failed", error);
        } finally {
            setIsEncrypting(false);
        }
    };

    const handleDecrypt = () => {
        if (!result || !keys) return;
        setIsDecrypting(true);
        setTimeout(() => {
            try {
                const recovered = sdk.decryptSecure(result.ciphertext, keys.privateKey);
                setDecryptedText(recovered);
            } catch (err) {
                console.error("Decryption failed", err);
                alert("Decryption failed. Invalid key or corrupted ciphertext.");
            }
            setIsDecrypting(false);
        }, 400);
    };

    return (
        <div className="min-h-screen bg-[#000000] flex flex-col relative overflow-hidden">
            {/* Subtle grid background */}
            <div 
              className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
              style={{
                backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />

            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full relative z-10">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h1 className="text-[40px] sm:text-[56px] font-semibold text-white mb-6 tracking-tight leading-[1.1]">
                        Experience <span className="text-[#C4ED5F]">Post-Quantum</span>
                    </h1>
                    <p className="text-[18px] text-gray-400 font-normal mb-10 leading-relaxed max-w-2xl mx-auto">
                        The cryptography runs natively inside your browser using WebAssembly. Your data and private keys mathematically never touch our servers.
                    </p>
                    
                    {/* Stark Mode Toggle */}
                    <div className="inline-flex bg-[#0A0A0A] border border-[#222] p-1 rounded-none relative">
                        <button 
                            onClick={() => { setMode("vault"); setResult(null); setDecryptedText(null); }}
                            className={`relative px-8 py-2.5 rounded-none text-sm font-bold uppercase tracking-wider transition-all duration-300 z-10 ${mode === "vault" ? "text-black bg-[#C4ED5F]" : "text-gray-500 hover:text-white"}`}
                        >
                            Vault Mode
                        </button>
                        <button 
                            onClick={() => { setMode("secure"); setResult(null); setDecryptedText(null); }}
                            className={`relative px-8 py-2.5 rounded-none text-sm font-bold uppercase tracking-wider transition-all duration-300 z-10 ${mode === "secure" ? "text-black bg-[#C4ED5F]" : "text-gray-500 hover:text-white"}`}
                        >
                            Secure Mode
                        </button>
                    </div>
                </div>

                {/* Secure Mode Key Generation Panel */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${mode === "secure" ? "max-h-[500px] opacity-100 mb-10" : "max-h-0 opacity-0 mb-0"}`}>
                    <div className="bg-[#0A0A0A] border border-[#222] rounded-none p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#C4ED5F]" />
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h3 className="text-white font-semibold flex items-center gap-3 text-lg"><Key className="w-5 h-5 text-[#C4ED5F]"/> Client-Side Key Generation</h3>
                            <Button 
                                onClick={handleGenerateKeys} 
                                disabled={isGenerating} 
                                className="bg-[#111] hover:bg-[#222] text-white border border-[#333] transition-colors w-full sm:w-auto h-11 px-6 rounded-none text-sm font-semibold uppercase tracking-wider"
                            >
                                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : "Generate Kyber-1024 Keys"}
                            </Button>
                        </div>
                        {keys ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#222] border border-[#222]">
                                <div className="bg-[#0A0A0A] p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="w-4 h-4 text-[#C4ED5F]" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Public Key</span>
                                    </div>
                                    <div className="text-xs font-mono text-[#C4ED5F] truncate">{keys.publicKey}</div>
                                </div>
                                <div className="bg-[#0A0A0A] p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="w-4 h-4 text-red-500" />
                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Private Key (Local Only)</span>
                                    </div>
                                    <div className="text-xs font-mono text-red-500 truncate">{keys.privateKey}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[92px] flex items-center justify-center border border-dashed border-[#333] bg-[#000] text-gray-500 text-sm font-mono">
                                No keys generated yet. Click above to create an ephemeral keypair.
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#222] border border-[#222]">
                    {/* Left Pane: Plaintext Input */}
                    <div className="flex flex-col bg-[#000] relative">
                        <div className="bg-[#0A0A0A] border-b border-[#222] px-6 py-4 flex items-center gap-3">
                            <div className="w-2 h-2 bg-gray-500" />
                            <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">Plaintext Payload</h2>
                        </div>
                        <div className="flex-grow p-6 relative min-h-[300px]">
                            {decryptedText && (
                                <div className="absolute inset-0 bg-[#000] flex items-center justify-center z-10">
                                    <div className="text-center p-6 border border-[#C4ED5F] bg-[#0A0A0A] w-full h-full flex flex-col">
                                        <div className="flex items-center justify-center gap-2 mb-6">
                                            <Unlock className="w-5 h-5 text-[#C4ED5F]" />
                                            <h3 className="text-white font-semibold text-lg">Decrypted Successfully</h3>
                                        </div>
                                        <div className="flex-grow overflow-auto text-xs font-mono text-[#C4ED5F] text-left bg-black border border-[#222] p-4 break-words">
                                            {decryptedText}
                                        </div>
                                        <Button onClick={() => setDecryptedText(null)} className="mt-4 w-full bg-[#111] hover:bg-[#222] border border-[#333] text-white rounded-none uppercase tracking-wider text-xs font-bold">Clear Screen</Button>
                                    </div>
                                </div>
                            )}
                            <textarea
                                value={plaintext}
                                onChange={(e) => setPlaintext(e.target.value)}
                                className="w-full h-full resize-none outline-none font-mono text-[13px] leading-relaxed text-gray-300 bg-transparent"
                                placeholder="Enter JSON or text..."
                                spellCheck={false}
                            />
                        </div>
                        <div className="p-4 bg-[#0A0A0A] border-t border-[#222]">
                            <Button
                                onClick={handleEncrypt}
                                disabled={isEncrypting || !plaintext || (mode === "secure" && !keys)}
                                className="w-full h-12 bg-white text-black hover:bg-gray-200 rounded-none font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
                            >
                                {isEncrypting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Engaged...</>
                                ) : (
                                    <><Shield className="w-4 h-4 mr-2" /> Encrypt (Kyber-1024)</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right Pane: Ciphertext Output */}
                    <div className="flex flex-col bg-[#000] relative">
                        <div className="bg-[#0A0A0A] border-b border-[#222] px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-[#C4ED5F] animate-pulse" />
                                <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">Ciphertext</h2>
                            </div>
                            {result && (
                                <div className="flex items-center gap-2 border border-[#C4ED5F] px-2 py-0.5">
                                    <Zap className="w-3 h-3 text-[#C4ED5F]" />
                                    <span className="text-[#C4ED5F] text-[10px] font-mono tracking-wide">{result.latencyMs}ms</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-grow p-6 overflow-y-auto font-mono text-[12px] text-gray-500 leading-relaxed break-all whitespace-pre-wrap relative min-h-[300px]">
                            {isEncrypting && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                                    <div className="w-16 h-[2px] bg-[#C4ED5F] mb-4 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                    <p className="text-[#C4ED5F] text-[10px] font-mono uppercase tracking-widest">Securing Payload...</p>
                                </div>
                            )}
                            
                            {result ? (
                                <div className="text-gray-400">
                                    {result.ciphertext}
                                </div>
                            ) : !isEncrypting && (
                                <div className="h-full flex flex-col items-center justify-center text-[#333]">
                                    <Lock className="w-6 h-6 mb-3" />
                                    <span className="text-xs font-mono uppercase tracking-widest">Awaiting Encryption</span>
                                </div>
                            )}
                        </div>

                        {/* Receipt Block */}
                        {result && (
                            <div className="bg-[#0A0A0A] border-t border-[#222] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <span className="text-[#C4ED5F] text-[10px] font-bold uppercase tracking-widest block mb-1">Gateway Receipt</span>
                                    <div className="text-gray-400 text-[11px] font-mono">{result.receiptId}</div>
                                </div>
                                {mode === "secure" && (
                                    <Button 
                                        onClick={handleDecrypt} 
                                        disabled={isDecrypting} 
                                        className="w-full sm:w-auto bg-transparent border border-[#C4ED5F] text-[#C4ED5F] hover:bg-[#C4ED5F] hover:text-black h-9 text-[11px] font-bold uppercase tracking-wider rounded-none transition-colors"
                                    >
                                        {isDecrypting ? "Decrypting..." : "Decrypt Locally"}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Zero-Trust Explainer */}
                <div className="mt-32 max-w-5xl mx-auto">
                    <div className="mb-12">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C4ED5F] mb-4">Architecture</p>
                        <h2 className="text-[32px] text-white font-semibold">How True Zero-Trust Works</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#222] border border-[#222]">
                        <div className="bg-[#0A0A0A] p-8 hover:bg-[#111] transition-colors">
                            <div className="w-10 h-10 border border-[#222] bg-[#111] flex items-center justify-center mb-6">
                                <span className="text-white font-mono text-sm">01</span>
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-3">Local WASM Engine</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                When you hit "Encrypt", your plaintext doesn't leave your device. QuantaCipher injects a Rust WebAssembly binary directly into your browser or app, executing Kyber-1024 locally in milliseconds.
                            </p>
                        </div>
                        <div className="bg-[#0A0A0A] p-8 hover:bg-[#111] transition-colors">
                            <div className="w-10 h-10 border border-[#222] bg-[#111] flex items-center justify-center mb-6">
                                <span className="text-white font-mono text-sm">02</span>
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-3">The Blind Network</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Only the impenetrable ciphertext travels over the internet. The private key never touches the network. Even if your TLS is compromised by a quantum computer, the payload remains secure.
                            </p>
                        </div>
                        <div className="bg-[#0A0A0A] p-8 hover:bg-[#111] transition-colors">
                            <div className="w-10 h-10 border border-[#222] bg-[#111] flex items-center justify-center mb-6">
                                <span className="text-white font-mono text-sm">03</span>
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-3">Cryptographic Audit</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                The QuantaCipher Cloud Gateway receives the ciphertext, validates your API key, logs the bandwidth, and issues an immutable cryptographic receipt—without ever seeing your data.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
