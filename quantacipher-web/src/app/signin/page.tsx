"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function SignInPage() {
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
            {/* Left Side - Hero/Branding (60%) */}
            <div className="hidden lg:flex flex-col justify-between bg-white p-12 relative overflow-hidden">
                {/* Animated circles background - matching homepage */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            x: [0, 10, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[15%] right-[15%] w-[280px] h-[280px] rounded-full bg-[#ea4335] opacity-20"
                    />
                    <motion.div
                        animate={{
                            y: [0, 30, 0],
                            x: [0, -15, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[40%] right-[25%] w-[180px] h-[180px] rounded-full bg-[#34a853] opacity-20"
                    />
                    <motion.div
                        animate={{
                            y: [0, -25, 0],
                            x: [0, 20, 0],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-[20%] right-[10%] w-[220px] h-[220px] rounded-full bg-[#4285f4] opacity-20"
                    />
                    <motion.div
                        animate={{
                            y: [0, 15, 0],
                            x: [0, -10, 0],
                        }}
                        transition={{
                            duration: 9,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[25%] right-[40%] w-[120px] h-[120px] rounded-full bg-[#fbbc05] opacity-20"
                    />
                    <motion.div
                        animate={{
                            y: [0, -18, 0],
                            x: [0, 12, 0],
                        }}
                        transition={{
                            duration: 11,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-[35%] right-[35%] w-[90px] h-[90px] rounded-full bg-[#00E599] opacity-20"
                    />
                    <motion.div
                        animate={{
                            y: [0, 22, 0],
                            x: [0, -8, 0],
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[10%] right-[5%] w-[60px] h-[60px] rounded-full bg-[#ea4335] opacity-25"
                    />
                </div>

                <Link href="/" className="flex items-center gap-3 relative z-10 group w-fit">
                    <img
                        src="/logo/quanta-transparent-bg-logo.svg"
                        alt="QuantaCipher Logo"
                        className="w-9 h-9 transition-transform group-hover:scale-110"
                    />
                    <span className="text-2xl font-bold tracking-tighter text-black">
                        QuantaCipher<span className="text-[#00E599]">.</span>
                    </span>
                </Link>

                <div className="max-w-xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-[56px] sm:text-[64px] leading-[1.1] font-normal text-[black] mb-6">
                            Start securing <br /> <span className="text-[#00E599]">in seconds.</span>
                        </h2>
                        <p className="text-[20px] text-[#6b7280] leading-relaxed mb-8">
                            Secure your critical APIs with Kyber-1024 encryption and manage your Zero-Trust infrastructure.
                        </p>
                    </motion.div>
                </div>

                <div className="text-[14px] text-[#9aa0a6] relative z-10">
                    &copy; {new Date().getFullYear()} QuantaCipher Inc.
                </div>
            </div>

            {/* Right Side - Auth Form (40%) */}
            <div className="flex flex-col items-center justify-center p-8 bg-white">
                <div className="w-full max-w-[380px] space-y-8">
                    <div className="text-center">
                        <div className="lg:hidden mb-8 flex justify-center">
                            <Link href="/" className="flex items-center gap-3 group">
                                <img
                                    src="/logo/quanta-transparent-bg-logo.svg"
                                    alt="QuantaCipher Logo"
                                    className="w-9 h-9 transition-transform group-hover:scale-110"
                                />
                                <span className="text-3xl font-bold tracking-tighter text-black">
                                    QuantaCipher<span className="text-[#00E599]">.</span>
                                </span>
                            </Link>
                        </div>
                        <h1 className="text-[28px] font-normal text-[black] mb-2">Welcome back</h1>
                        <p className="text-[#6b7280] text-[14px]">
                            Sign in to access your dashboard.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => signIn("google", { callbackUrl })}
                            variant="outline"
                            className="w-full h-[48px] rounded-xl bg-white border border-[#e5e7eb] hover:bg-white hover:border-[#00E599] hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all flex items-center justify-center gap-3"
                        >
                            {/* Google G Logo */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-[14px] font-medium text-[#1f2937]">Sign in with Google</span>
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[#e5e7eb]" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-[#6b7280]">Or</span>
                            </div>
                        </div>

                        <Button
                            onClick={() => signIn("github", { callbackUrl })}
                            className="w-full h-[48px] rounded-xl bg-[#24292e] hover:bg-[#2f363d] text-white hover:shadow-md transition-all flex items-center justify-center gap-3"
                        >
                            {/* GitHub Logo */}
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="text-[14px] font-medium">Sign in with GitHub</span>
                        </Button>
                    </div>

                    <div className="text-center px-4">
                        <p className="text-[12px] text-[#6b7280] leading-relaxed">
                            By signing in, you agree to our{" "}
                            <Link href="/terms" className="text-[#00E599] hover:underline">Terms of Service</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-[#00E599] hover:underline">Privacy Policy</Link>.
                        </p>
                    </div>

                    <div className="pt-4 text-center">
                        <Link href="/" className="inline-flex items-center text-[#6b7280] hover:text-[black] text-[14px] font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Return to homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
