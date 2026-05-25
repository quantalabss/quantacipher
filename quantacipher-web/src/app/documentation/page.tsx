"use client";

import { Code2, Terminal, Globe, Key, FileText, ArrowUpRight, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 pb-32">
                {/* Page Header */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-12 gap-6">
                        <div>
                            <span className="text-gray-400 font-bold tracking-widest uppercase text-xs mb-5 block">
                                Technical Documentation
                            </span>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-black leading-[1.0]">
                                QuantaCipher API <br />
                                <span className="text-gray-300">Reference</span>
                            </h1>
                        </div>
                        <p className="text-gray-400 font-medium text-base max-w-sm leading-relaxed md:text-right">
                            Integrate post-quantum encryption into your infrastructure in minutes. Choose between our native Node.js SDK with bundled WebAssembly, or hit our REST API directly.
                        </p>
                    </div>
                </section>

                {/* Architecture Deep Dive */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="bg-gray-100 w-9 h-9 rounded-xl flex items-center justify-center">
                            <Code2 className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-sm font-extrabold text-black uppercase tracking-widest">How It Works: Architecture</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. WASM Engine */}
                        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] hover:border-black transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                            <h3 className="text-xl font-black text-black tracking-tight mb-4">1. WASM Crypto Engine</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                Written in high-performance Rust and compiled to WebAssembly, this engine executes <strong className="text-black">Kyber-1024</strong> locally on your machine.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-black text-black uppercase tracking-widest mb-1">Vault Mode (Zero-Trust)</h4>
                                    <p className="text-xs text-gray-500">Generates an ephemeral keypair, encapsulates data, and discards the private key instantly. The data is permanently sealed.</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-black uppercase tracking-widest mb-1">Secure Mode</h4>
                                    <p className="text-xs text-gray-500">Generates a keypair where YOU hold the private key. Encrypts via public key; decrypts locally via private key.</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. JS SDK */}
                        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] hover:border-black transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                            <h3 className="text-xl font-black text-black tracking-tight mb-4">2. TypeScript SDK</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                A frictionless wrapper around the WASM engine. It handles hybrid encryption (Kyber-1024 derived shared secrets applied to AES-256-GCM) seamlessly.
                            </p>
                            <div className="bg-[#111] p-4 rounded-xl shadow-inner font-mono text-[10px] text-gray-300 mb-4">
                                <span className="text-[#00E599]">const</span> keys = sdk.generateKeypair();<br/>
                                <span className="text-[#00E599]">await</span> sdk.secureData(data, keys.publicKey);
                            </div>
                            <p className="text-xs text-gray-500">Plaintext never leaves your server. The SDK only transmits impenetrable ciphertext over the network.</p>
                        </div>

                        {/* 3. Gateway */}
                        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] hover:border-black transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                            <h3 className="text-xl font-black text-black tracking-tight mb-4">3. API Gateway</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                The high-availability Node.js edge network that ingests your ciphertext, tracks usage, and issues cryptographic receipts.
                            </p>
                            <ul className="space-y-3 text-xs text-gray-500 font-medium">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#00E599] mt-0.5">✓</span> Validates <code className="text-black font-bold">QZ_VAULT_V1</code> format
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#00E599] mt-0.5">✓</span> Rejects plaintext submissions instantly
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#00E599] mt-0.5">✓</span> Issues verifiable cryptographic receipts
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#00E599] mt-0.5">✓</span> Anchors ciphertext to immutable ledger
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
                        
                        {/* Sidebar / Quick Links (Stylized like the Articles block) */}
                        <div className="flex flex-col gap-8 order-2 lg:order-1">
                            <div>
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="bg-gray-100 w-9 h-9 rounded-xl flex items-center justify-center">
                                        <Key className="w-4 h-4 text-black" />
                                    </div>
                                    <span className="text-sm font-extrabold text-black uppercase tracking-widest">Authentication</span>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-2xl p-7 hover:border-black transition-all duration-300">
                                    <p className="text-gray-500 mb-6 text-sm font-medium leading-relaxed">
                                        All requests to QuantaCipher require an API key. You can generate a free API key from your dashboard.
                                    </p>
                                    <div className="bg-white rounded-xl p-4">
                                        <p className="text-xs text-black font-bold mb-1">For Node.js SDK:</p>
                                        <p className="text-xs text-gray-500 mb-3">Pass the key in the constructor.</p>
                                        
                                        <p className="text-xs text-black font-bold mb-1 mt-4">For REST API:</p>
                                        <p className="text-xs text-gray-500">Send via <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-black">x-api-key</code> header.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content (Stylized like the Papers grid but for docs) */}
                        <div className="flex flex-col gap-16 order-1 lg:order-2">
                            
                            {/* Node.js SDK */}
                            <section id="nodejs">
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="bg-gray-100 w-9 h-9 rounded-xl flex items-center justify-center">
                                        <Terminal className="w-4 h-4 text-black" />
                                    </div>
                                    <span className="text-sm font-extrabold text-black uppercase tracking-widest">Node.js SDK</span>
                                </div>
                                <p className="text-gray-500 mb-8 font-medium leading-relaxed text-lg">
                                    The official SDK uses native WebAssembly bindings to execute Kyber-1024 encryption directly within your Node.js runtime. This guarantees zero-trust because plaintext never leaves your machine.
                                </p>

                                <div className="space-y-8">
                                    <div className="group block border border-gray-100 rounded-2xl p-7 bg-white hover:border-black hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
                                        <h3 className="text-sm font-black tracking-[0.15em] text-gray-400 uppercase mb-4">1. Installation</h3>
                                        <div className="bg-[#111] rounded-xl p-5 text-sm font-mono text-gray-300 overflow-x-auto shadow-inner">
                                            npm install quantacipher-sdk
                                        </div>
                                    </div>

                                    <div className="group block border border-gray-100 rounded-2xl p-7 bg-white hover:border-black hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
                                        <h3 className="text-sm font-black tracking-[0.15em] text-gray-400 uppercase mb-4">2. Usage</h3>
                                        <div className="bg-[#111] rounded-xl p-6 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                                            <div className="text-[#c586c0]">import <span className="text-[#9cdcfe]">{"{ QuantaCipher }"}</span> from <span className="text-[#ce9178]">'quantacipher-sdk'</span>;</div>
                                            <br/>
                                            <div className="text-gray-500">// Initialize the client</div>
                                            <div className="text-[#569cd6]">const <span className="text-[#9cdcfe]">qz</span> = new <span className="text-[#00E599]">QuantaCipher</span>{"({"}</div>
                                            <div>  <span className="text-[#9cdcfe]">apiKey</span>: <span className="text-[#ce9178]">'qz_live_...'</span></div>
                                            <div>{"});"}</div>
                                            <br/>
                                            <div className="text-gray-500">// Encrypt any arbitrary payload</div>
                                            <div className="text-[#569cd6]">const <span className="text-[#9cdcfe]">sensitiveData</span> = {"{ "}</div>
                                            <div>  <span className="text-[#9cdcfe]">email</span>: <span className="text-[#ce9178]">'user@enterprise.com'</span>,</div>
                                            <div>  <span className="text-[#9cdcfe]">ssn</span>: <span className="text-[#ce9178]">'***-**-****'</span></div>
                                            <div>{"};"}</div>
                                            <br/>
                                            <div className="text-gray-500">// Returns a verifiable cryptographic receipt</div>
                                            <div className="text-[#c586c0]">const <span className="text-[#9cdcfe]">receipt</span> = await <span className="text-[#9cdcfe]">qz</span>.<span className="text-[#dcdcaa]">secureData</span>(<span className="text-[#9cdcfe]">sensitiveData</span>);</div>
                                            <br/>
                                            <div><span className="text-[#9cdcfe]">console</span>.<span className="text-[#dcdcaa]">log</span>(<span className="text-[#9cdcfe]">receipt.ciphertext</span>); <span className="text-gray-500">// QZ_TRUE_PQC_KEM:...</span></div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* REST API */}
                            <section id="rest">
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="bg-gray-100 w-9 h-9 rounded-xl flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-black" />
                                    </div>
                                    <span className="text-sm font-extrabold text-black uppercase tracking-widest">REST API</span>
                                </div>
                                <p className="text-gray-500 mb-8 font-medium leading-relaxed text-lg">
                                    For environments where WebAssembly isn't supported, you can send pre-encrypted or plaintext data directly to our secure edge ingestion Gateway.
                                </p>

                                <div className="group block border border-gray-100 rounded-2xl p-7 bg-white hover:border-black hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 mb-8">
                                        <span className="bg-[#00E599] text-black px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">POST</span>
                                        <code className="text-sm font-mono text-black font-bold">https://api.quantacipher.com/v1/ingest</code>
                                    </div>
                                    
                                    <h3 className="text-xs font-black tracking-[0.15em] text-gray-400 uppercase mb-4">Request Example</h3>
                                    <div className="bg-[#111] rounded-xl p-5 font-mono text-xs leading-relaxed overflow-x-auto text-gray-300 mb-8 shadow-inner">
                                        <div><span className="text-[#00E599]">curl</span> -X POST https://api.quantacipher.com/v1/ingest \</div>
                                        <div>  -H <span className="text-[#ce9178]">'Content-Type: application/json'</span> \</div>
                                        <div>  -H <span className="text-[#ce9178]">'x-api-key: qz_live_xxxx'</span> \</div>
                                        <div>  -d <span className="text-[#ce9178]">'{"{ \"ciphertext\": \"QZ_TRUE_PQC_KEM:...\" }"}</span>'</div>
                                    </div>
                                    
                                    <h3 className="text-xs font-black tracking-[0.15em] text-gray-400 uppercase mb-4">Response Example</h3>
                                    <div className="bg-[#111] rounded-xl p-5 font-mono text-xs leading-relaxed overflow-x-auto text-gray-300 shadow-inner">
                                        <div>{"{"}</div>
                                        <div>  <span className="text-[#9cdcfe]">"success"</span>: <span className="text-[#569cd6]">true</span>,</div>
                                        <div>  <span className="text-[#9cdcfe]">"receiptId"</span>: <span className="text-[#ce9178]">"req_29x8f..."</span>,</div>
                                        <div>  <span className="text-[#9cdcfe]">"algorithm"</span>: <span className="text-[#ce9178]">"Kyber-1024"</span>,</div>
                                        <div>  <span className="text-[#9cdcfe]">"latencyMs"</span>: <span className="text-[#b5cea8]">1.2</span></div>
                                        <div>{"}"}</div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>

                {/* Dashboard CTA */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                    <a
                        href="/signin"
                        className="group block relative overflow-hidden rounded-[2.5rem] bg-black p-10 md:p-14 border border-gray-900 hover:border-gray-700 transition-all"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-80 pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <span className="text-[#00E599] font-bold tracking-widest uppercase text-xs mb-4 block">
                                    Developer Portal
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                                    Get your API Keys.
                                </h2>
                                <p className="text-gray-400 font-medium text-lg max-w-xl leading-relaxed">
                                    Sign in to the dashboard to generate your API keys and track your cryptographic usage limits.
                                </p>
                            </div>
                            <div className="shrink-0 flex items-center px-8 py-4 border border-gray-700 text-white font-bold rounded-xl group-hover:bg-[#00E599] group-hover:text-black group-hover:border-[#00E599] transition-all duration-300">
                                Go to Dashboard
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </a>
                </section>
            </main>
            
            <Footer />
        </div>
    );
}
