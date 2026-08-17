"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Shield, Lock, Server, Key, FileWarning } from "lucide-react";
import { SecurityPartners } from "@/components/sections/SecurityPartners";

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-[#FCFBF9] relative font-sans">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-[48px] font-bold text-[#111111] mb-4 font-serif">Security Overview</h1>
                        <p className="text-[14px] text-[#8b7355] mb-12 font-semibold uppercase tracking-widest font-sans">Transparency in our post-quantum cryptographic infrastructure.</p>

                        <div className="prose prose-lg max-w-none">
                            <p className="text-[18px] text-[#111111] leading-relaxed mb-12 font-medium">
                                At QuantaCipher, security is not just a feature—it is our entire product. We are building the future of post-quantum infrastructure to protect the world's most sensitive data against "Store Now, Decrypt Later" (SNDL) attacks by cryptanalytically relevant quantum computers (CRQCs).
                            </p>

                            <div className="grid gap-8 mb-16">
                                {/* Card 1 */}
                                <div className="bg-[#FFFFFF] p-8 rounded border border-[#E8E5DF] shadow-clean">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-[#FCFBF9] border border-[#E8E5DF] p-2 rounded">
                                            <Shield className="w-6 h-6 text-[#111111]" />
                                        </div>
                                        <h3 className="text-[20px] font-bold text-[#111111] m-0 font-serif">NIST Kyber-1024 Implementation</h3>
                                    </div>
                                    <p className="text-[15px] text-[#6B6356] leading-relaxed m-0 font-medium">
                                        Our core cryptography relies on ML-KEM (Kyber-1024), the final standard approved by the National Institute of Standards and Technology (NIST) for post-quantum key encapsulation. We utilize security category 5 parameter sets, equivalent to AES-256 in classical computing, providing the highest possible margin of security against known quantum attacks. However, please note that no system is 100% invulnerable. This includes both the underlying mathematical algorithms (like ML-KEM) and our software implementations across our open-source SDKs and gateway servers.
                                    </p>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-[#FFFFFF] p-8 rounded border border-[#E8E5DF] shadow-clean">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-[#FCFBF9] border border-[#E8E5DF] p-2 rounded">
                                            <Server className="w-6 h-6 text-[#111111]" />
                                        </div>
                                        <h3 className="text-[20px] font-bold text-[#111111] m-0 font-serif">Zero-Trust WASM Engine</h3>
                                    </div>
                                    <p className="text-[15px] text-[#6B6356] leading-relaxed m-0 font-medium">
                                        Encryption and decryption occur entirely within your local environment (Node.js or Browser) via our Rust-compiled WebAssembly (WASM) engine. QuantaCipher Gateway servers never see your plaintext data, nor do we possess the private keys required to decrypt your ciphertexts. We operate on a mathematically provable Zero-Trust architecture.
                                    </p>
                                </div>

                                {/* Card 3 */}
                                <div className="bg-[#FFFFFF] p-8 rounded border border-[#E8E5DF] shadow-clean">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-[#FCFBF9] border border-[#E8E5DF] p-2 rounded">
                                            <Lock className="w-6 h-6 text-[#111111]" />
                                        </div>
                                        <h3 className="text-[20px] font-bold text-[#111111] m-0 font-serif">Hybrid Cryptography Fallback</h3>
                                    </div>
                                    <p className="text-[15px] text-[#6B6356] leading-relaxed m-0 font-medium">
                                        While we employ cutting-edge post-quantum algorithms, we follow NSA and CISA recommendations by using a hybrid cryptographic approach. All payloads are wrapped in standard ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) and AES-GCM before the Kyber layer is applied, ensuring that our systems remain secure even if future mathematical vulnerabilities are found in lattice-based cryptography. If significant vulnerabilities are ever discovered in ML-KEM or within our SDK implementations, we will immediately initiate our incident response protocol, which includes falling back to our classical encryption layer and issuing rapid security patches to all affected open-source SDKs and gateway servers.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <section className="border-t border-[#E8E5DF] pt-8">
                                    <h2 className="text-[24px] font-bold text-[#111111] mb-4 flex items-center gap-2 font-serif">
                                        <Key className="w-5 h-5 text-[#8b7355]" /> Infrastructure Security
                                    </h2>
                                    <p className="text-[16px] text-[#6B6356] leading-relaxed mb-4 font-medium">
                                        Beyond cryptography, our cloud infrastructure is hardened against classical attacks:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-[16px] text-[#6B6356] ml-4 font-medium">
                                        <li>SOC2 Type II compliance procedures are currently underway.</li>
                                        <li>All API interactions require TLS 1.3.</li>
                                        <li>Gateway servers are distributed globally with automatic DDoS mitigation.</li>
                                        <li>Strict internal access controls based on the principle of least privilege.</li>
                                    </ul>
                                </section>

                                <section className="border-t border-[#E8E5DF] pt-8">
                                    <h2 className="text-[24px] font-bold text-[#111111] mb-4 flex items-center gap-2 font-serif">
                                        <FileWarning className="w-5 h-5 text-[#8b7355]" /> Vulnerability Disclosure
                                    </h2>
                                    <p className="text-[16px] text-[#6B6356] leading-relaxed font-medium">
                                        We welcome responsible disclosure of vulnerabilities from the security research community. If you believe you have found a security vulnerability in QuantaCipher's systems, APIs, or SDKs, please immediately report it to <a href="mailto:security@quantacipher.com" className="text-[#8b7355] font-bold hover:underline">security@quantacipher.com</a>. Please note that we do not currently operate a paid bug bounty program.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <SecurityPartners />
            <Footer />
        </div>
    );
}



