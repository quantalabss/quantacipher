"use client";

import { CheckCircle2 } from "lucide-react";

const integrations = [
    {
        lang: "Vault Mode",
        badge: "Permanent Seal",
        code: [
            { type: "comment", text: "// Permanent sealed record for audit logs" },
            { type: "code", text: "const vaultCiphertext = sdk.encryptVault(patientRecord);" },
            { type: "blank" },
            { type: "comment", text: "// Send to gateway for tamper-proof receipt" },
            { type: "code", text: "const receipt = await sdk.vaultData(patientRecord, { type: 'hipaa_audit' });" },
        ],
    },
    {
        lang: "Secure Mode",
        badge: "User Holds Keys",
        code: [
            { type: "comment", text: "// Encrypt + Decrypt with user keypair" },
            { type: "code", text: "const keypair = sdk.generateKeypair();" },
            { type: "blank" },
            { type: "comment", text: "// Encrypt with public key" },
            { type: "code", text: "const ciphertext = sdk.encryptSecure(doc, keypair.publicKey);" },
            { type: "blank" },
            { type: "comment", text: "// Decrypt locally with private key" },
            { type: "code", text: "const plaintext = sdk.decryptSecure(ciphertext, keypair.privateKey);" },
        ],
    },
];

const features = [
    {
        title: "WASM runs in your environment",
        description: "The Kyber-1024 encryption runs as compiled Rust WebAssembly inside your Node.js process or browser. Your data never travels as plaintext.",
    },
    {
        title: "Works anywhere JavaScript runs",
        description: "Browser, Node.js, Deno, Bun, Cloudflare Workers. If it runs JavaScript, it runs QuantaCipher.",
    },
    {
        title: "Drop-in HTTPS integration",
        description: "No special infrastructure required. The Gateway is a standard HTTPS endpoint. Integrate in under 15 minutes.",
    },
];

export function TechStack() {
    return (
        <section id="integrations" className="py-24 bg-white border-b border-[#dadce0]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-[14px] font-bold text-[#5f6368] mb-4 uppercase tracking-widest">
                        Architecture
                    </p>
                    <h2 className="text-[32px] font-normal text-[#202124] mb-4">
                        Two distinct modes of operation
                    </h2>
                    <p className="text-[20px] text-[#5f6368] max-w-[600px] mx-auto">
                        Whether you need permanently sealed audit logs or secure end-to-end encryption with user-held keys, QuantaCipher has you covered.
                    </p>
                </div>

                {/* Code cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                    {integrations.map((int) => (
                        <div
                            key={int.lang}
                            className="bg-white border border-[#dadce0] rounded-[16px] p-6 md:p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-[#f8f9fa] border border-[#dadce0] text-[#202124] font-bold text-[12px]">
                                        {int.lang.slice(0, 2).toUpperCase()}
                                    </div>
                                    <h3 className="text-[20px] font-medium text-[#202124]">{int.lang}</h3>
                                </div>
                                <div className="text-[11px] font-mono px-3 py-1 rounded-full border border-[#dadce0] text-[#5f6368] bg-[#f8f9fa] font-medium">
                                    {int.badge}
                                </div>
                            </div>

                            {/* Code block */}
                            <div className="bg-[#202124] rounded-[12px] p-4 font-mono text-[12px] leading-relaxed">
                                <div className="flex gap-2 mb-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ea4335]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#fbbc04]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#34a853]" />
                                </div>
                                {int.code.map((line, li) => (
                                    <div key={li} className={line.type === "blank" ? "h-3" : ""}>
                                        {line.type === "import" && (
                                            <span className="text-[#c586c0]">{line.text}</span>
                                        )}
                                        {line.type === "comment" && (
                                            <span className="text-[#6a9955]">{line.text}</span>
                                        )}
                                        {line.type === "code" && (
                                            <span className="text-[#d4d4d4]">{line.text}</span>
                                        )}
                                    </div>
                                ))}
                                {/* Receipt indicator */}
                                <div className="mt-3 flex items-center gap-2 border-t border-[#3c4043] pt-3">
                                    <div className="w-2 h-2 rounded-full bg-[#34a853]" />
                                    <span className="text-[#34a853] text-[11px]">Receipt issued • Kyber-1024</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Feature bullets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {features.map((f) => (
                        <div key={f.title} className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#80868b]" />
                            <div>
                                <h4 className="text-[18px] font-medium text-[#202124] mb-1">{f.title}</h4>
                                <p className="text-[16px] text-[#5f6368] leading-relaxed">{f.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
