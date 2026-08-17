"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function Hero() {
  const [copied, setCopied] = useState(false);

  return (
    <section className="relative min-h-screen bg-[#FCFBF9] flex flex-col justify-center items-center overflow-hidden pt-20 pb-20 font-sans text-center">
      
      {/* Background Math Formula Watermark (LWE) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-5 select-none">
        <div className="font-serif text-[12rem] md:text-[20rem] whitespace-nowrap text-[#111111] leading-none tracking-tighter">
          A·s + e ≡ b <span className="text-[6rem] md:text-[10rem] align-bottom ml-4">(mod q)</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center">
        
        {/* Subtle Label */}
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E8E5DF] bg-white text-xs font-semibold text-[#8b7355] tracking-widest uppercase">
          FIPS 204 Standardized
        </div>

        {/* Main Heading (Centered, Serif, Academic Style) */}
        <h1 className="animate-fade-in text-6xl sm:text-7xl lg:text-[6rem] font-bold tracking-tight leading-[1.05] text-[#111111] mb-8 font-serif text-balance">
          The cryptographic foundation for the quantum era.
        </h1>

        <p className="animate-fade-in text-lg sm:text-xl text-[#6B6356] leading-relaxed font-normal mb-12 max-w-2xl text-balance">
          QuantaCipher implements ML-KEM lattice-based cryptography in a zero-trust WASM runtime, securing your infrastructure against both classical and quantum adversaries.
        </p>

        <div className="animate-fade-in flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
          <Link
            href="/signin"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#111111] text-white rounded font-bold hover:bg-[#2c2c2c] transition-all duration-200 text-sm shadow-clean uppercase tracking-wide"
          >
            Get API Keys <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="https://quantachain.gitbook.io/quantacipher"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-transparent text-[#111111] border border-[#E8E5DF] rounded font-medium hover:bg-[#EAE6DF] transition-colors text-sm"
          >
            Read docs
          </Link>
        </div>

        {/* Code Snippet - Clean Academic Block */}
        <div className="animate-fade-in w-full max-w-2xl mt-24">
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-md shadow-clean overflow-hidden text-left">
            <div className="px-6 py-3 border-b border-[#E8E5DF] bg-[#FCFBF9] flex justify-between items-center">
              <span className="text-xs font-semibold text-[#8b7355] uppercase tracking-wider">Example Implementation</span>
              <span className="text-[10px] text-[#6B6356] font-mono">TypeScript</span>
            </div>
            <div className="p-6 overflow-x-auto bg-[#FFFFFF]">
              <pre className="font-mono text-sm leading-relaxed text-[#111111]">
                <code>
                  <span className="text-[#8b7355]">import</span> {"{ QuantaCipher }"} <span className="text-[#8b7355]">from</span> <span className="text-[#6B6356]">'quantacipher-sdk'</span>;<br/><br/>
                  <span className="text-[#A1A1AA]">{'// Initialize ML-KEM engine'}</span><br/>
                  <span className="text-[#8b7355]">const</span> qc = <span className="text-[#8b7355]">new</span> QuantaCipher(<span className="text-[#6B6356]">'sk_live_...'</span>);<br/><br/>
                  <span className="text-[#A1A1AA]">{'// Generate quantum-resistant ciphertext'}</span><br/>
                  <span className="text-[#8b7355]">const</span> {"{ ciphertext }"} = <span className="text-[#8b7355]">await</span> qc.encrypt(<span className="text-[#6B6356]">"Sensitive payload"</span>);
                </code>
              </pre>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
