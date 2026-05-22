"use client";

const integrations = [
    {
        lang: "Node.js",
        badge: "npm install quantacipher-sdk",
        code: [
            { type: "import", text: "import { QuantaCipher } from 'quantacipher-sdk';" },
            { type: "blank" },
            { type: "comment", text: "// Encrypt patient record locally — Kyber-1024" },
            { type: "code", text: "const qz = new QuantaCipher({ apiKey: process.env.QZ_KEY });" },
            { type: "code", text: "await qz.secureData(patientRecord, { type: 'ehr' });" },
        ],
    },
    {
        lang: "REST API",
        badge: "POST /api/v1/ingest",
        code: [
            { type: "comment", text: "// Send pre-encrypted ciphertext" },
            { type: "code", text: 'curl -X POST https://api.quantacipher.com/v1/ingest \\' },
            { type: "code", text: "  -H 'x-api-key: qz_live_xxxx' \\" },
            { type: "code", text: "  -d '{ \"ciphertext\": \"QZ_TRUE_PQC_KEM:...\" }'" },
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
        <section className="py-24 bg-white border-b border-[#dadce0]">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-[12px] font-bold text-[#5f6368] mb-4 uppercase tracking-widest">
                        Integrations
                    </p>
                    <h2 className="text-[32px] font-normal text-[#202124] mb-4">
                        Integrate in minutes, not months
                    </h2>
                    <p className="text-[16px] text-[#5f6368] max-w-[600px] mx-auto">
                        Two lines of TypeScript or a single REST call. QuantaCipher plugs into any existing stack without a refactor.
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
                                    <h3 className="text-[18px] font-medium text-[#202124]">{int.lang}</h3>
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
                            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-[#1a73e8]" />
                            <div>
                                <h4 className="text-[15px] font-medium text-[#202124] mb-1">{f.title}</h4>
                                <p className="text-[14px] text-[#5f6368] leading-relaxed">{f.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
