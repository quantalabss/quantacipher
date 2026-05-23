"use client";

import { Code2, Terminal, Globe, Key, FileText } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-24">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-16 border-b border-[#dadce0] pb-12">
                        <div className="inline-flex items-center gap-2 bg-[#e8f0fe] text-[#1a73e8] px-3 py-1 rounded-full text-[13px] font-medium mb-6">
                            <FileText className="w-4 h-4" />
                            Documentation
                        </div>
                        <h1 className="text-[40px] sm:text-[48px] font-normal text-[#202124] mb-4">QuantaCipher API Reference</h1>
                        <p className="text-[18px] text-[#5f6368] leading-relaxed max-w-2xl">
                            Integrate post-quantum encryption into your infrastructure in minutes. Choose between our native Node.js SDK with bundled WebAssembly, or hit our REST API directly.
                        </p>
                    </div>

                    {/* Authentication */}
                    <section className="mb-20">
                        <div className="flex items-center gap-3 mb-6">
                            <Key className="w-6 h-6 text-[#202124]" />
                            <h2 className="text-[28px] font-normal text-[#202124]">Authentication</h2>
                        </div>
                        <p className="text-[#5f6368] mb-6">
                            All requests to QuantaCipher require an API key. You can generate a free API key from your dashboard.
                        </p>
                        <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-[8px] p-6">
                            <p className="text-[14px] text-[#202124] font-medium mb-2">For the Node.js SDK:</p>
                            <p className="text-[14px] text-[#5f6368] mb-4">Pass the key in the constructor.</p>
                            
                            <p className="text-[14px] text-[#202124] font-medium mb-2 mt-6">For the REST API:</p>
                            <p className="text-[14px] text-[#5f6368] mb-2">Send the key in the <code className="bg-[#e8eaed] px-1.5 py-0.5 rounded text-[13px] font-mono">x-api-key</code> header.</p>
                        </div>
                    </section>

                    {/* Node.js SDK */}
                    <section id="nodejs" className="mb-20">
                        <div className="flex items-center gap-3 mb-6">
                            <Terminal className="w-6 h-6 text-[#202124]" />
                            <h2 className="text-[28px] font-normal text-[#202124]">Node.js SDK</h2>
                        </div>
                        <p className="text-[#5f6368] mb-8 leading-relaxed">
                            The official SDK uses native WebAssembly bindings to execute Kyber-1024 encryption directly within your Node.js runtime. This guarantees zero-trust because plaintext never leaves your machine.
                        </p>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[18px] font-medium text-[#202124] mb-4">1. Installation</h3>
                                <div className="bg-[#202124] rounded-[8px] p-4 text-[14px] font-mono text-[#e8eaed] overflow-x-auto">
                                    npm install quantacipher-sdk
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[18px] font-medium text-[#202124] mb-4">2. Usage</h3>
                                <div className="bg-[#202124] rounded-[8px] p-6 font-mono text-[13px] leading-relaxed overflow-x-auto">
                                    <div className="text-[#c586c0]">import <span className="text-[#9cdcfe]">{"{ QuantaCipher }"}</span> from <span className="text-[#ce9178]">'quantacipher-sdk'</span>;</div>
                                    <br/>
                                    <div className="text-[#9aa0a6]">// Initialize the client</div>
                                    <div className="text-[#569cd6]">const <span className="text-[#9cdcfe]">qz</span> = new <span className="text-[#4ec9b0]">QuantaCipher</span>{"({"}</div>
                                    <div>  <span className="text-[#9cdcfe]">apiKey</span>: <span className="text-[#ce9178]">'qz_live_...'</span></div>
                                    <div>{"});"}</div>
                                    <br/>
                                    <div className="text-[#9aa0a6]">// Encrypt any arbitrary payload</div>
                                    <div className="text-[#569cd6]">const <span className="text-[#9cdcfe]">sensitiveData</span> = {"{ "}</div>
                                    <div>  <span className="text-[#9cdcfe]">email</span>: <span className="text-[#ce9178]">'user@enterprise.com'</span>,</div>
                                    <div>  <span className="text-[#9cdcfe]">ssn</span>: <span className="text-[#ce9178]">'***-**-****'</span></div>
                                    <div>{"};"}</div>
                                    <br/>
                                    <div className="text-[#9aa0a6]">// Returns a verifiable cryptographic receipt</div>
                                    <div className="text-[#c586c0]">const <span className="text-[#9cdcfe]">receipt</span> = await <span className="text-[#9cdcfe]">qz</span>.<span className="text-[#dcdcaa]">secureData</span>(<span className="text-[#9cdcfe]">sensitiveData</span>);</div>
                                    <br/>
                                    <div><span className="text-[#9cdcfe]">console</span>.<span className="text-[#dcdcaa]">log</span>(<span className="text-[#9cdcfe]">receipt.ciphertext</span>); <span className="text-[#9aa0a6]">// QZ_TRUE_PQC_KEM:...</span></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* REST API */}
                    <section id="rest">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="w-6 h-6 text-[#202124]" />
                            <h2 className="text-[28px] font-normal text-[#202124]">REST API</h2>
                        </div>
                        <p className="text-[#5f6368] mb-8 leading-relaxed">
                            For environments where WebAssembly isn't supported, you can send pre-encrypted or plaintext data directly to our secure edge ingestion Gateway.
                        </p>

                        <div className="border border-[#dadce0] rounded-[8px] overflow-hidden">
                            <div className="bg-[#f8f9fa] border-b border-[#dadce0] p-4 flex items-center gap-3">
                                <span className="bg-[#137333] text-white px-2 py-1 rounded text-[12px] font-bold">POST</span>
                                <code className="text-[14px] font-mono text-[#202124]">https://api.quantacipher.com/v1/ingest</code>
                            </div>
                            <div className="p-6">
                                <h3 className="text-[14px] font-bold text-[#202124] uppercase tracking-wider mb-4">Request Example</h3>
                                <div className="bg-[#202124] rounded-[8px] p-5 font-mono text-[13px] leading-relaxed overflow-x-auto text-[#d4d4d4]">
                                    <div><span className="text-[#dcdcaa]">curl</span> -X POST https://api.quantacipher.com/v1/ingest \</div>
                                    <div>  -H <span className="text-[#ce9178]">'Content-Type: application/json'</span> \</div>
                                    <div>  -H <span className="text-[#ce9178]">'x-api-key: qz_live_xxxx'</span> \</div>
                                    <div>  -d <span className="text-[#ce9178]">'{"{ \"ciphertext\": \"QZ_TRUE_PQC_KEM:...\" }"}</span>'</div>
                                </div>
                                
                                <h3 className="text-[14px] font-bold text-[#202124] uppercase tracking-wider mt-8 mb-4">Response Example</h3>
                                <div className="bg-[#202124] rounded-[8px] p-5 font-mono text-[13px] leading-relaxed overflow-x-auto text-[#d4d4d4]">
                                    <div>{"{"}</div>
                                    <div>  <span className="text-[#9cdcfe]">"success"</span>: <span className="text-[#569cd6]">true</span>,</div>
                                    <div>  <span className="text-[#9cdcfe]">"receiptId"</span>: <span className="text-[#ce9178]">"req_29x8f..."</span>,</div>
                                    <div>  <span className="text-[#9cdcfe]">"algorithm"</span>: <span className="text-[#ce9178]">"Kyber-1024"</span>,</div>
                                    <div>  <span className="text-[#9cdcfe]">"latencyMs"</span>: <span className="text-[#b5cea8]">1.2</span></div>
                                    <div>{"}"}</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
