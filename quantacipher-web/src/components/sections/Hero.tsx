"use client";

import Link from "next/link";
import { ArrowUpRight, PlayCircle } from "lucide-react";

export function Hero() {

  return (
    <section className="relative pt-24 pb-8 md:pt-28 md:pb-12 overflow-hidden bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 xl:gap-32 items-center">

          {/* Left Column: Typography & CTAs */}
          <div
            className="flex flex-col justify-center max-w-2xl mt-4 md:mt-0 animate-fade-in"
          >
            <div className="flex items-center space-x-3 mb-5">
              <div className="h-px w-8 bg-gray-400"></div>
              <span className="text-gray-400 font-black tracking-[0.15em] text-[10px] sm:text-[11px] uppercase">
                Zero-Trust Post-Quantum Architecture
              </span>
            </div>

            <h1
              className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[3.75rem] xl:text-[4.25rem] font-black tracking-tighter text-black mb-5 leading-[1.05]"
            >
              Post Quantum <br />
              Security. <br />
              <span className="text-[#00E599] whitespace-nowrap">In two lines of code.</span>
            </h1>

            <p className="text-lg md:text-[1.125rem] text-gray-600 mb-6 leading-relaxed font-medium max-w-xl">
              Protect your enterprise data from quantum computer attacks today.
              Our SDK encrypts everything locally on your machine before it ever hits a network.
            </p>

            <p className="text-[13px] md:text-[14px] font-bold text-gray-400 mb-9 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>NIST ML-KEM Certified</span>
              <span className="hidden md:inline">&middot;</span>
              <span>Zero-Trust Architecture</span>
              <span className="hidden md:inline">&middot;</span>
              <span>Kyber-1024 Encryption</span>
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Link
                href="/signin"
                className="group flex items-center justify-center space-x-2 px-7 py-3.5 bg-black text-white rounded-full font-medium hover:bg-[#00E599] hover:text-black transition-all hover:scale-105 active:scale-95 w-full sm:w-auto shadow-xl"
              >
                <span>Get Free API Key</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>

              <Link
                href="/documentation"
                className="group flex items-center justify-center space-x-2 px-7 py-3.5 bg-white text-black border border-gray-200 rounded-full font-medium hover:border-black transition-all w-full sm:w-auto"
              >
                <span>Read the Docs</span>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
              </Link>
            </div>
          </div>

          {/* Right Column: Code Window */}
          <div className="relative w-full flex items-center justify-center lg:justify-end mt-12 lg:mt-0 animate-fade-in">
            <div className="relative w-full max-w-[650px]">
                <div className="relative z-10 bg-[#111111] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] font-mono text-[14px] sm:text-[15px] border border-[#222222] overflow-hidden">
                    {/* Window Header */}
                    <div className="flex items-center bg-[#1a1a1a] border-b border-[#333333] px-5 py-3.5">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                        </div>
                        <div className="mx-auto flex items-center gap-2 text-gray-500 text-[12px] font-bold tracking-wide uppercase">
                            quantacipher-integration.ts
                        </div>
                    </div>

                    {/* Code Content */}
                    <div className="p-8 leading-[1.9]">
                        <div>
                            <span className="text-gray-500">// Install SDK via npm</span>
                        </div>
                        <div className="mb-5">
                            <span className="text-gray-500">// </span>
                            <span className="text-[#00E599]">npm</span>
                            <span className="text-gray-300"> install quantacipher-sdk</span>
                        </div>

                        <div className="mb-6">
                            <span className="text-[#00E599]">import</span>
                            <span className="text-gray-300"> {"{ "}</span>
                            <span className="text-white">QuantaCipher</span>
                            <span className="text-gray-300">{" }"} </span>
                            <span className="text-[#00E599]">from</span>
                            <span className="text-gray-400"> 'quantacipher-sdk'</span>
                            <span className="text-gray-300">;</span>
                        </div>

                        <div className="mb-2">
                            <span className="text-gray-500">// Encrypt patient record locally — Kyber-1024</span>
                        </div>
                        <div>
                            <span className="text-[#00E599]">const</span>
                            <span className="text-white"> qz</span>
                            <span className="text-[#00E599]"> = new</span>
                            <span className="text-white"> QuantaCipher</span>
                            <span className="text-gray-300">{"({ "}</span>
                        </div>
                        <div className="pl-6">
                            <span className="text-gray-400">apiKey</span>
                            <span className="text-gray-300">: process.env.</span>
                            <span className="text-white">QZ_KEY</span>
                        </div>
                        <div>
                            <span className="text-gray-300">{"});"}</span>
                        </div>
                        
                        <div className="mt-6">
                            <span className="text-[#00E599]">await</span>
                            <span className="text-white"> qz</span>
                            <span className="text-gray-300">.</span>
                            <span className="text-[#00E599]">secureData</span>
                            <span className="text-gray-300">(</span>
                            <span className="text-white">patientRecord</span>
                            <span className="text-gray-300">, {"{ "}</span>
                            <span className="text-gray-400">type</span>
                            <span className="text-gray-300">: </span>
                            <span className="text-gray-400">'ehr'</span>
                            <span className="text-gray-300"> {"});"}</span>
                        </div>

                        {/* Terminal output line */}
                        <div className="mt-5">
                            <span className="text-gray-500">// </span>
                            <span className="text-[#00E599]">✓</span>
                            <span className="text-white"> receipt</span>
                            <span className="text-gray-300">.</span>
                            <span className="text-[#00E599]">status</span>
                            <span className="text-gray-300"> = </span>
                            <span className="text-gray-400">'issued'</span>
                            <span className="text-gray-300">  </span>
                            <span className="text-gray-500">// kyber-1024</span>
                        </div>

                    </div>
                </div>

                {/* Subtle background glow effect behind IDE */}
                <div className="absolute -inset-1 bg-[#00E599] rounded-3xl blur-[40px] opacity-[0.08] -z-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
