"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { ParticleOrb } from "@/components/ui/ParticleOrb";

export function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0a0a0a] flex flex-col justify-end overflow-hidden">
      
      {/* 1. Underlying Soft Glows (These illuminate the noise) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-[10%] w-[50vw] h-[50vw] bg-white opacity-[0.05] blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 right-[10%] w-[40vw] h-[40vw] bg-white opacity-[0.04] blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-1/3 w-[60vw] h-[40vw] bg-white opacity-[0.03] blur-[180px] rounded-full mix-blend-screen" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[90vh] flex flex-col justify-center pb-20 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Text Content */}
          <div className="animate-fade-in max-w-[650px]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#C4ED5F] font-mono text-xs tracking-widest uppercase">Zero-Trust · Post-Quantum</span>
            </div>

            <h1 className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-medium tracking-[-0.04em] leading-[1.05] text-white mb-8 drop-shadow-sm">
              Secure data.<br />In two lines of code.
            </h1>

            <p className="text-[1.15rem] sm:text-[1.25rem] text-gray-400 leading-relaxed font-normal mb-10">
              Enterprise post-quantum encryption API. NIST ML-KEM (Kyber-1024). 
              Your plaintext never leaves your runtime. Deploy zero-trust security instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/signin"
                className="flex items-center justify-center px-8 py-3.5 bg-white text-black font-semibold hover:bg-gray-100 transition-colors text-[15px]"
              >
                Get API Keys
              </Link>
              <Link
                href="https://quantachain.gitbook.io/quantacipher"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-8 py-3.5 bg-transparent text-white border border-white/20 font-semibold hover:bg-white/5 transition-colors text-[15px]"
              >
                View Docs
              </Link>
            </div>
          </div>

          {/* Right 3D Particle Orb */}
          <div className="flex justify-center items-center mix-blend-screen pointer-events-none w-full mt-12 lg:mt-0">
            <div className="scale-90 xl:scale-100">
              <ParticleOrb />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
