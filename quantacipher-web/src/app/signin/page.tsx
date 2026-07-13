"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

function SignInContent() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    useEffect(() => {
        if (status === "authenticated") {
            router.push(callbackUrl);
        }
    }, [status, router]);

    return (
        <div className="min-h-screen grid lg:grid-cols-[60%_40%]">
            {/* Left Side — Dark panel with node grid */}
            <div className="hidden lg:flex flex-col justify-between bg-transparent p-12 relative overflow-hidden border-r border-[#222]">

                {/* Subtle dot grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.15] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle, #C4ED5F 1px, transparent 1px)`,
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Lime glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#C4ED5F] opacity-[0.04] rounded-full blur-[100px] pointer-events-none" />

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 relative z-10 group w-fit">
                    <img
                        src="/logo/quanta-transparent-bg-logo.svg"
                        alt="QuantaCipher Logo"
                        className="w-9 h-9 transition-transform group-hover:scale-110"
                    />
                    <span className="text-2xl font-bold tracking-tighter text-white">
                        QuantaCipher<span className="text-[#C4ED5F]">.</span>
                    </span>
                </Link>

                {/* Center content */}
                <div className="max-w-xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C4ED5F] mb-6">
                            Zero-Trust · Post-Quantum · Open Source Core
                        </p>
                        <h2 className="text-[48px] sm:text-[56px] leading-[1.05] font-black tracking-tighter text-white mb-6">
                            Start securing<br />
                            <span className="text-[#C4ED5F]">in seconds.</span>
                        </h2>
                        <p className="text-[17px] text-gray-400 leading-relaxed mb-10 font-medium">
                            Enterprise post-quantum encryption. NIST ML-KEM (Kyber-1024).
                            Your plaintext never leaves your runtime.
                        </p>

                        {/* Trust signals */}
                        <div className="flex flex-col gap-3">
                            {[
                                "NIST ML-KEM 2024 certified — Kyber-1024",
                                "Zero plaintext data stored or transmitted",
                                "Open source core — audit everything",
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#C4ED5F]/10 border border-[#C4ED5F]/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[#C4ED5F] text-[10px] font-black">✓</span>
                                    </div>
                                    <span className="text-[13px] font-semibold text-gray-400">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="text-[13px] text-gray-600 relative z-10 font-mono">
                    &copy; {new Date().getFullYear()} QuantaLabs Private Limited.
                </div>
            </div>

            {/* Right Side - Auth Form (40%) */}
            <div className="flex flex-col items-center justify-center p-8 bg-transparent">
                <div className="w-full max-w-[380px] space-y-8">
                    <div className="text-center">
                        <div className="lg:hidden mb-8 flex justify-center">
                            <Link href="/" className="flex items-center gap-3 group">
                                <img
                                    src="/logo/quanta-transparent-bg-logo.svg"
                                    alt="QuantaCipher Logo"
                                    className="w-9 h-9 transition-transform group-hover:scale-110"
                                />
                                <span className="text-3xl font-bold tracking-tighter text-white">
                                    QuantaCipher<span className="text-[#C4ED5F]">.</span>
                                </span>
                            </Link>
                        </div>
                        <h1 className="text-[28px] font-normal text-white mb-2">Welcome back</h1>
                        <p className="text-gray-400 text-[14px]">
                            Sign in to access your dashboard.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => signIn("google", { callbackUrl })}
                            variant="outline"
                            className="w-full h-[48px] rounded-xl bg-[#0a0a0a] border border-[#222] hover:bg-[#111] hover:border-[#C4ED5F] transition-all flex items-center justify-center gap-3"
                        >
                            {/* Google G Logo */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-[14px] font-medium text-white">Sign in with Google</span>
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[#222]" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0a0a0a] px-2 text-gray-500">Or</span>
                            </div>
                        </div>

                        <Button
                            onClick={() => signIn("github", { callbackUrl })}
                            className="w-full h-[48px] rounded-xl bg-[#111] border border-[#222] hover:bg-[#1f1f1f] text-white hover:shadow-md transition-all flex items-center justify-center gap-3"
                        >
                            {/* GitHub Logo */}
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="text-[14px] font-medium">Sign in with GitHub</span>
                        </Button>
                    </div>

                    <div className="text-center px-4">
                        <p className="text-[12px] text-gray-400 leading-relaxed">
                            By signing in, you agree to our{" "}
                            <Link href="/terms" className="text-[#C4ED5F] hover:underline">Terms of Service</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-[#C4ED5F] hover:underline">Privacy Policy</Link>.
                        </p>
                    </div>

                    <div className="pt-4 text-center">
                        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white text-[14px] font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Return to homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
            <div className="relative min-h-screen bg-transparent">
                <div className="relative z-[1]">
                    <SignInContent />
                </div>
            </div>
        </Suspense>
    );
}
