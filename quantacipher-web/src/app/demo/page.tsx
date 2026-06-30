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
        <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">
            {/* Ambient Glowing Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#C4ED5F]/10 blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] rounded-full bg-[#2E3C1A]/30 blur-[150px] pointer-events-none mix-blend-screen" />

            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full relative z-10">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h1 className="text-[40px] sm:text-[56px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-6 tracking-tight">
                        Experience Post-Quantum
                    </h1>
                    <p className="text-[18px] text-[#888] font-light mb-10 leading-relaxed max-w-2xl mx-auto">
                        The cryptography runs natively inside your browser using WebAssembly. Your data and private keys mathematically never touch our servers.
                    </p>
                    
                    {/* Sleek Mode Toggle */}
                    <div className="inline-flex bg-white/5 border border-white/10 p-1.5 rounded-full backdrop-blur-md relative">
                        <button 
                            onClick={() => { setMode("vault"); setResult(null); setDecryptedText(null); }}
                            className={`relative px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 z-10 ${mode === "vault" ? "text-black" : "text-[#888] hover:text-white"}`}
                        >
                            Vault Mode
                        </button>
                        <button 
                            onClick={() => { setMode("secure"); setResult(null); setDecryptedText(null); }}
                            className={`relative px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 z-10 ${mode === "secure" ? "text-black" : "text-[#888] hover:text-white"}`}
                        >
                            Secure Mode
                        </button>
                        {/* Animated Slider */}
                        <div 
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-[#C4ED5F] to-[#a8db34] rounded-full transition-transform duration-500 ease-out shadow-[0_0_15px_rgba(196,237,95,0.4)] z-0`}
                            style={{ transform: mode === "secure" ? "translateX(100%)" : "translateX(0)" }}
                        />
                    </div>
                </div>

                {/* Secure Mode Key Generation Panel */}
                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${mode === "secure" ? "max-h-[500px] opacity-100 mb-10" : "max-h-0 opacity-0 mb-0"}`}>
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4ED5F]/50 to-transparent" />
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h3 className="text-white font-medium flex items-center gap-3 text-lg"><Key className="w-5 h-5 text-[#C4ED5F]"/> Client-Side Key Generation</h3>
                            <Button 
                                onClick={handleGenerateKeys} 
                                disabled={isGenerating} 
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] w-full sm:w-auto h-11 px-6 rounded-xl"
                            >
                                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating Lattice...</> : "Generate Kyber-1024 Keys"}
                            </Button>
                        </div>
                        {keys ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                                <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="w-4 h-4 text-[#C4ED5F]" />
                                        <span className="text-xs font-semibold text-[#888] uppercase tracking-wider">Public Key</span>
                                    </div>
                                    <div className="text-xs font-mono text-[#C4ED5F] truncate opacity-90">{keys.publicKey}</div>
                                </div>
                                <div className="bg-[#ff4a4a]/5 border border-[#ff4a4a]/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="w-4 h-4 text-[#ff4a4a]" />
                                        <span className="text-xs font-semibold text-[#ff4a4a] uppercase tracking-wider">Private Key (Local Only)</span>
                                    </div>
                                    <div className="text-xs font-mono text-[#ff4a4a] truncate opacity-90">{keys.privateKey}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[92px] flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-black/20 text-[#555] text-sm">
                                No keys generated yet. Click above to create an ephemeral keypair.
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Left Pane: Plaintext Input */}
                    <div className="flex flex-col bg-white/[0.02] border border-white/10 rounded-[1.5rem] backdrop-blur-xl shadow-2xl overflow-hidden h-[420px] relative transition-transform hover:-translate-y-1 duration-300">
                        <div className="bg-black/20 border-b border-white/5 px-6 py-4 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#888]" />
                            <h2 className="text-[14px] font-semibold text-white/90 uppercase tracking-widest">Plaintext Payload</h2>
                        </div>
                        <div className="flex-grow p-6 relative">
                            {decryptedText && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-md z-10 animate-in zoom-in-95 duration-300">
                                    <div className="text-center p-6 border border-[#C4ED5F]/20 bg-[#111] rounded-2xl max-w-[85%] shadow-[0_0_30px_rgba(196,237,95,0.15)]">
                                        <Unlock className="w-8 h-8 text-[#C4ED5F] mx-auto mb-4" />
                                        <h3 className="text-white font-medium mb-3">Decrypted Successfully</h3>
                                        <div className="text-xs font-mono text-[#C4ED5F] text-left bg-black p-4 rounded-xl shadow-inner break-words">{decryptedText}</div>
                                        <Button onClick={() => setDecryptedText(null)} className="mt-5 w-full bg-white/10 hover:bg-white/20 text-white rounded-xl">Clear Screen</Button>
                                    </div>
                                </div>
                            )}
                            <textarea
                                value={plaintext}
                                onChange={(e) => setPlaintext(e.target.value)}
                                className="w-full h-full resize-none outline-none font-mono text-[14px] leading-relaxed text-[#d4d4d4] bg-transparent"
                                placeholder="Enter JSON or text..."
                                spellCheck={false}
                            />
                        </div>
                        <div className="p-4 bg-black/20 border-t border-white/5">
                            <Button
                                onClick={handleEncrypt}
                                disabled={isEncrypting || !plaintext || (mode === "secure" && !keys)}
                                className="w-full h-12 bg-gradient-to-r from-[#C4ED5F] to-[#a8db34] hover:opacity-90 text-black rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(196,237,95,0.3)] hover:shadow-[0_4px_25px_rgba(196,237,95,0.5)] disabled:opacity-50 disabled:shadow-none"
                            >
                                {isEncrypting ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Engaged...</>
                                ) : (
                                    <><Shield className="w-5 h-5 mr-2" /> Encrypt (Kyber-1024)</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Right Pane: Ciphertext Output */}
                    <div className="flex flex-col bg-black/40 border border-white/10 rounded-[1.5rem] backdrop-blur-xl shadow-2xl overflow-hidden h-[420px] relative transition-transform hover:-translate-y-1 duration-300">
                        <div className="bg-black/60 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#C4ED5F] animate-pulse shadow-[0_0_8px_rgba(196,237,95,0.8)]" />
                                <h2 className="text-[14px] font-semibold text-white/90 uppercase tracking-widest">Ciphertext</h2>
                            </div>
                            {result && (
                                <div className="flex items-center gap-2 bg-[#C4ED5F]/10 px-3 py-1 rounded-full border border-[#C4ED5F]/20">
                                    <Zap className="w-3 h-3 text-[#C4ED5F]" />
                                    <span className="text-[#C4ED5F] text-[11px] font-bold tracking-wide">{result.latencyMs}ms</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-grow p-6 overflow-y-auto font-mono text-[13px] text-[#6b7280] leading-relaxed break-all whitespace-pre-wrap relative">
                            {isEncrypting && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 animate-in fade-in">
                                    <div className="w-16 h-[2px] bg-[#C4ED5F] mb-4 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                    <p className="text-[#C4ED5F] text-xs font-mono uppercase tracking-widest">Securing Payload...</p>
                                </div>
                            )}
                            
                            {result ? (
                                <div className="animate-in fade-in duration-700 text-[#a0a0a0]">
                                    {result.ciphertext}
                                </div>
                            ) : !isEncrypting && (
                                <div className="h-full flex flex-col items-center justify-center text-[#444]">
                                    <Lock className="w-8 h-8 mb-3 opacity-20" />
                                    <span className="text-sm">Awaiting Encryption</span>
                                </div>
                            )}
                        </div>

                        {/* Receipt Block */}
                        {result && (
                            <div className="bg-black/80 border-t border-white/5 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in slide-in-from-bottom-2 duration-300">
                                <div>
                                    <span className="text-[#C4ED5F] text-[10px] font-bold uppercase tracking-widest block mb-1">Gateway Receipt</span>
                                    <div className="text-[#888] text-[12px] font-mono">{result.receiptId}</div>
                                </div>
                                {mode === "secure" && (
                                    <Button 
                                        onClick={handleDecrypt} 
                                        disabled={isDecrypting} 
                                        className="w-full sm:w-auto bg-transparent border border-[#C4ED5F]/50 text-[#C4ED5F] hover:bg-[#C4ED5F] hover:text-black h-9 text-xs rounded-lg transition-all"
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
                    <div className="text-center mb-12">
                        <h2 className="text-[28px] text-white font-bold mb-4">How True Zero-Trust Works</h2>
                        <div className="w-16 h-1 bg-gradient-to-r from-[#C4ED5F] to-transparent mx-auto rounded-full" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] transition-colors duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4ED5F]/20 to-transparent flex items-center justify-center mb-6 border border-[#C4ED5F]/20">
                                <span className="text-[#C4ED5F] font-bold text-xl">1</span>
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-3">Local WASM Engine</h3>
                            <p className="text-[#888] text-sm leading-relaxed">
                                When you hit "Encrypt", your plaintext doesn't leave your device. QuantaCipher injects a Rust WebAssembly binary directly into your browser or app, executing Kyber-1024 locally in milliseconds.
                            </p>
                        </div>
                        <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] transition-colors duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4ED5F]/20 to-transparent flex items-center justify-center mb-6 border border-[#C4ED5F]/20">
                                <span className="text-[#C4ED5F] font-bold text-xl">2</span>
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-3">The Blind Network</h3>
                            <p className="text-[#888] text-sm leading-relaxed">
                                Only the impenetrable ciphertext travels over the internet. The private key never touches the network. Even if your TLS is compromised by a quantum computer, the payload remains secure.
                            </p>
                        </div>
                        <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] transition-colors duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4ED5F]/20 to-transparent flex items-center justify-center mb-6 border border-[#C4ED5F]/20">
                                <span className="text-[#C4ED5F] font-bold text-xl">3</span>
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-3">Cryptographic Audit</h3>
                            <p className="text-[#888] text-sm leading-relaxed">
                                The QuantaCipher Cloud Gateway receives the ciphertext, validates your API key, logs the bandwidth, and issues an immutable cryptographic receipt—without ever seeing your data.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        
            {/* Global Noise Overlay */}
            <div 
              className="fixed inset-0 z-[100] pointer-events-none opacity-[0.15] mix-blend-screen"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '120px 120px'
              }} 
            />
        </div>
    );
}


