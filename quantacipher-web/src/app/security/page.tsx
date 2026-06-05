"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Shield, Lock, Server, Key, FileWarning, Search } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-[48px] font-normal text-[black] mb-4">Security Overview</h1>
                        <p className="text-[14px] text-[#6b7280] mb-12">Transparency in our post-quantum cryptographic infrastructure.</p>

                        <div className="prose prose-lg max-w-none">
                            <p className="text-[18px] text-[#6b7280] leading-relaxed mb-12">
                                At QuantaCipher, security is not just a feature—it is our entire product. We are building the future of post-quantum infrastructure to protect the world's most sensitive data against "Store Now, Decrypt Later" (SNDL) attacks by cryptanalytically relevant quantum computers (CRQCs).
                            </p>

                            <div className="grid gap-8 mb-16">
                                {/* Card 1 */}
                                <div className="bg-white p-6 rounded-[12px] border border-[#e5e7eb]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-[#f3f4f6] p-2 rounded-full">
                                            <Shield className="w-6 h-6 text-[#C4ED5F]" />
                                        </div>
                                        <h3 className="text-[20px] font-medium text-[black] m-0">NIST Kyber-1024 Implementation</h3>
                                    </div>
                                    <p className="text-[15px] text-[#6b7280] leading-relaxed m-0">
                                        Our core cryptography relies on ML-KEM (Kyber-1024), the final standard approved by the National Institute of Standards and Technology (NIST) for post-quantum key encapsulation. We utilize security category 5 parameter sets, equivalent to AES-256 in classical computing, providing the highest possible margin of security against known quantum attacks.
                                    </p>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-white p-6 rounded-[12px] border border-[#e5e7eb]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-[#f3f4f6] p-2 rounded-full">
                                            <Server className="w-6 h-6 text-[#C4ED5F]" />
                                        </div>
                                        <h3 className="text-[20px] font-medium text-[black] m-0">Zero-Trust WASM Engine</h3>
                                    </div>
                                    <p className="text-[15px] text-[#6b7280] leading-relaxed m-0">
                                        Encryption and decryption occur entirely within your local environment (Node.js or Browser) via our Rust-compiled WebAssembly (WASM) engine. QuantaCipher Gateway servers never see your plaintext data, nor do we possess the private keys required to decrypt your ciphertexts. We operate on a mathematically provable Zero-Trust architecture.
                                    </p>
                                </div>

                                {/* Card 3 */}
                                <div className="bg-white p-6 rounded-[12px] border border-[#e5e7eb]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-[#f3f4f6] p-2 rounded-full">
                                            <Lock className="w-6 h-6 text-[#C4ED5F]" />
                                        </div>
                                        <h3 className="text-[20px] font-medium text-[black] m-0">Hybrid Cryptography Fallback</h3>
                                    </div>
                                    <p className="text-[15px] text-[#6b7280] leading-relaxed m-0">
                                        While we employ cutting-edge post-quantum algorithms, we follow NSA and CISA recommendations by using a hybrid cryptographic approach. All payloads are wrapped in standard ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) and AES-GCM before the Kyber layer is applied, ensuring that our systems remain secure even if future mathematical vulnerabilities are found in lattice-based cryptography.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4 flex items-center gap-2">
                                        <Search className="w-6 h-6 text-[#6b7280]" /> Independent Audits
                                    </h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed">
                                        Our core cryptographic Rust implementations undergo rigorous, continuous third-party audits by leading firms specializing in post-quantum cryptography. We commit to publishing summary letters of these audits on an annual basis to ensure absolute transparency.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4 flex items-center gap-2">
                                        <Key className="w-6 h-6 text-[#6b7280]" /> Infrastructure Security
                                    </h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed mb-4">
                                        Beyond cryptography, our cloud infrastructure is hardened against classical attacks:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-[#6b7280] ml-4">
                                        <li>SOC2 Type II compliance procedures are currently underway.</li>
                                        <li>All API interactions require TLS 1.3.</li>
                                        <li>Gateway servers are distributed globally with automatic DDoS mitigation.</li>
                                        <li>Strict internal access controls based on the principle of least privilege.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-[24px] font-medium text-[black] mb-4 flex items-center gap-2">
                                        <FileWarning className="w-6 h-6 text-[#6b7280]" /> Vulnerability Disclosure
                                    </h2>
                                    <p className="text-[16px] text-[#6b7280] leading-relaxed">
                                        We welcome responsible disclosure of vulnerabilities from the security research community. If you believe you have found a security vulnerability in QuantaCipher's systems, APIs, or SDKs, please immediately report it to <a href="mailto:security@quantacipher.com" className="text-[#C4ED5F] hover:underline">security@quantacipher.com</a>. We offer a bug bounty program for critical cryptographic or infrastructure findings.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
