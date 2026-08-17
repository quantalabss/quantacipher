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
        <div className="min-h-screen bg-[#FCFBF9] flex flex-col relative overflow-hidden font-sans">
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full relative z-10">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h1 className="text-[40px] sm:text-[56px] font-bold text-[#111111] mb-6 tracking-tight leading-[1.1] font-serif">
                        Experience <span className="text-[#6B6356]">Post-Quantum</span>
                    </h1>
                    <p className="text-[18px] text-[#6B6356] font-medium mb-10 leading-relaxed max-w-2xl mx-auto">
                        The cryptography runs natively inside your browser using WebAssembly. Your data and private keys mathematically never touch our servers.
                    </p>
                    
                    {/* Stark Mode Toggle */}
                    <div className="inline-flex bg-[#FFFFFF] border border-[#E8E5DF] p-1 rounded relative shadow-sm">
                        <button 
                            onClick={() => { setMode("vault"); setResult(null); setDecryptedText(null); }}
                            className={`relative px-8 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition-all duration-300 z-10 ${mode === "vault" ? "text-white bg-[#111111] shadow-clean" : "text-[#6B6356] hover:text-[#111111]"}`}
                        >
                            Vault Mode
                        </button>
                        <button 
                            onClick={() => { setMode("secure"); setResult(null); setDecryptedText(null); }}
                            className={`relative px-8 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition-all duration-300 z-10 ${mode === "secure" ? "text-white bg-[#111111] shadow-clean" : "text-[#6B6356] hover:text-[#111111]"}`}
                        >
                            Secure Mode
                        </button>
                    </div>
                </div>

                {/* Secure Mode Key Generation Panel */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${mode === "secure" ? "max-h-[500px] opacity-100 mb-10" : "max-h-0 opacity-0 mb-0"}`}>
                    <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded p-6 relative overflow-hidden shadow-clean">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#8b7355]" />
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-2">
                            <h3 className="text-[#111111] font-bold flex items-center gap-3 text-lg font-serif"><Key className="w-5 h-5 text-[#8b7355]"/> Client-Side Key Generation</h3>
                            <Button 
                                onClick={handleGenerateKeys} 
                                disabled={isGenerating} 
                                className="bg-[#111111] hover:bg-[#2c2c2c] text-white transition-colors w-full sm:w-auto h-11 px-6 rounded text-sm font-bold uppercase tracking-wider shadow-clean"
                            >
                                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : "Generate Kyber-1024 Keys"}
                            </Button>
                        </div>
                        {keys ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E8E5DF] border border-[#E8E5DF] rounded overflow-hidden">
                                <div className="bg-[#FCFBF9] p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="w-4 h-4 text-[#8b7355]" />
                                        <span className="text-[10px] font-bold text-[#6B6356] uppercase tracking-widest">Public Key</span>
                                    </div>
                                    <div className="text-xs font-mono text-[#111111] truncate">{keys.publicKey}</div>
                                </div>
                                <div className="bg-[#FCFBF9] p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="w-4 h-4 text-[#6B6356]" />
                                        <span className="text-[10px] font-bold text-[#6B6356] uppercase tracking-widest">Private Key (Local Only)</span>
                                    </div>
                                    <div className="text-xs font-mono text-[#111111] truncate">{keys.privateKey}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[92px] flex items-center justify-center border border-dashed border-[#E8E5DF] bg-[#FCFBF9] text-[#6B6356] text-sm font-mono rounded">
                                No keys generated yet. Click above to create an ephemeral keypair.
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#E8E5DF] border border-[#E8E5DF] rounded overflow-hidden shadow-clean">
                    {/* Left Pane: Plaintext Input */}
                    <div className="flex flex-col bg-[#FCFBF9] relative">
                        <div className="bg-[#FFFFFF] border-b border-[#E8E5DF] px-6 py-4 flex items-center gap-3">
                            <div className="w-2 h-2 bg-[#6B6356] rounded-full" />
                            <h2 className="text-[12px] font-bold text-[#111111] uppercase tracking-widest">Plaintext Payload</h2>
                        </div>
                        <div className="flex-grow p-6 relative min-h-[300px]">
                            {decryptedText && (
                                <div className="absolute inset-0 bg-[#FCFBF9] flex items-center justify-center z-10">
                                    <div className="text-center p-6 border border-[#8b7355] bg-[#FFFFFF] w-full h-full flex flex-col">
                                        <div className="flex items-center justify-center gap-2 mb-6">
                                            <Unlock className="w-5 h-5 text-[#8b7355]" />
                                            <h3 className="text-[#111111] font-bold text-lg font-serif">Decrypted Successfully</h3>
                                        </div>
                                        <div className="flex-grow overflow-auto text-xs font-mono text-[#111111] text-left bg-[#FCFBF9] border border-[#E8E5DF] p-4 break-words">
                                            {decryptedText}
                                        </div>
                                        <Button onClick={() => setDecryptedText(null)} className="mt-4 w-full bg-[#111111] hover:bg-[#2c2c2c] text-white rounded uppercase tracking-wider text-xs font-bold shadow-clean">Clear Screen</Button>
                                    </div>
                                </div>
                            )}
                            <textarea
                                value={plaintext}
                                onChange={(e) => setPlaintext(e.target.value)}
                                className="w-full h-full resize-none outline-none font-mono text-[13px] leading-relaxed text-[#111111] bg-transparent"
                                placeholder="Enter JSON or text..."
                                spellCheck={false}
                            />
                        </div>
                        <div className="p-4 bg-[#FFFFFF] border-t border-[#E8E5DF]">
                            <Button
                                onClick={handleEncrypt}
                                disabled={isEncrypting || !plaintext || (mode === "secure" && !keys)}
                                className="w-full h-12 bg-[#111111] text-white hover:bg-[#2c2c2c] rounded font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50 shadow-clean"
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
                    <div className="flex flex-col bg-[#FCFBF9] relative">
                        <div className="bg-[#FFFFFF] border-b border-[#E8E5DF] px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-[#8b7355] rounded-full animate-pulse" />
                                <h2 className="text-[12px] font-bold text-[#111111] uppercase tracking-widest">Ciphertext</h2>
                            </div>
                            {result && (
                                <div className="flex items-center gap-2 border border-[#8b7355] px-2 py-0.5 rounded-sm">
                                    <Zap className="w-3 h-3 text-[#8b7355]" />
                                    <span className="text-[#8b7355] text-[10px] font-mono font-bold tracking-wide">{result.latencyMs}ms</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-grow p-6 overflow-y-auto font-mono text-[12px] text-[#6B6356] leading-relaxed break-all whitespace-pre-wrap relative min-h-[300px]">
                            {isEncrypting && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FCFBF9]/90 z-10 backdrop-blur-sm">
                                    <div className="w-16 h-[2px] bg-[#8b7355] mb-4 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                    <p className="text-[#8b7355] text-[10px] font-bold font-mono uppercase tracking-widest">Securing Payload...</p>
                                </div>
                            )}
                            
                            {result ? (
                                <div className="text-[#111111]">
                                    {result.ciphertext}
                                </div>
                            ) : !isEncrypting && (
                                <div className="h-full flex flex-col items-center justify-center text-[#6B6356]">
                                    <Lock className="w-6 h-6 mb-3" />
                                    <span className="text-xs font-mono font-bold uppercase tracking-widest">Awaiting Encryption</span>
                                </div>
                            )}
                        </div>

                        {/* Receipt Block */}
                        {result && (
                            <div className="bg-[#FFFFFF] border-t border-[#E8E5DF] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <span className="text-[#8b7355] text-[10px] font-bold uppercase tracking-widest block mb-1">Gateway Receipt</span>
                                    <div className="text-[#111111] text-[11px] font-mono font-semibold">{result.receiptId}</div>
                                </div>
                                {mode === "secure" && (
                                    <Button 
                                        onClick={handleDecrypt} 
                                        disabled={isDecrypting} 
                                        className="w-full sm:w-auto bg-[#FCFBF9] border border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355] hover:text-[#FCFBF9] h-9 text-[11px] font-bold uppercase tracking-wider rounded transition-colors shadow-sm"
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
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355] mb-4 font-sans">Architecture</p>
                        <h2 className="text-[32px] text-[#111111] font-bold font-serif">How True Zero-Trust Works</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E8E5DF] border border-[#E8E5DF] rounded overflow-hidden shadow-clean font-sans">
                        <div className="bg-[#FFFFFF] p-8 hover:bg-[#FCFBF9] transition-colors">
                            <div className="w-10 h-10 border border-[#E8E5DF] bg-[#FCFBF9] flex items-center justify-center mb-6 rounded">
                                <span className="text-[#111111] font-mono text-sm font-bold">01</span>
                            </div>
                            <h3 className="text-[#111111] text-lg font-bold mb-3 font-serif">Local WASM Engine</h3>
                            <p className="text-[#6B6356] text-sm leading-relaxed font-medium">
                                When you hit "Encrypt", your plaintext doesn't leave your device. QuantaCipher injects a Rust WebAssembly binary directly into your browser or app, executing Kyber-1024 locally in milliseconds.
                            </p>
                        </div>
                        <div className="bg-[#FFFFFF] p-8 hover:bg-[#FCFBF9] transition-colors">
                            <div className="w-10 h-10 border border-[#E8E5DF] bg-[#FCFBF9] flex items-center justify-center mb-6 rounded">
                                <span className="text-[#111111] font-mono text-sm font-bold">02</span>
                            </div>
                            <h3 className="text-[#111111] text-lg font-bold mb-3 font-serif">The Blind Network</h3>
                            <p className="text-[#6B6356] text-sm leading-relaxed font-medium">
                                Only the impenetrable ciphertext travels over the internet. The private key never touches the network. Even if your TLS is compromised by a quantum computer, the payload remains secure.
                            </p>
                        </div>
                        <div className="bg-[#FFFFFF] p-8 hover:bg-[#FCFBF9] transition-colors">
                            <div className="w-10 h-10 border border-[#E8E5DF] bg-[#FCFBF9] flex items-center justify-center mb-6 rounded">
                                <span className="text-[#111111] font-mono text-sm font-bold">03</span>
                            </div>
                            <h3 className="text-[#111111] text-lg font-bold mb-3 font-serif">Cryptographic Audit</h3>
                            <p className="text-[#6B6356] text-sm leading-relaxed font-medium">
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
