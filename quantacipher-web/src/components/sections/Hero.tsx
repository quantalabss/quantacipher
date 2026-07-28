"use client";

import Link from "next/link";
import { ArrowUpRight, Terminal, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function Hero() {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `import { QuantaCipher } from 'quantacipher-sdk';

// Initialize with your API key
const qc = new QuantaCipher('sk_live_...');

// Zero-trust Kyber-1024 encryption (client-side)
const { ciphertext, receipt } = await qc.encrypt(
  "Highly sensitive enterprise payload"
);

console.log("Cryptographic receipt:", receipt.signature);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen bg-transparent flex flex-col justify-end overflow-hidden pt-24">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#C4ED5F]/10 rounded-full blur-[128px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[128px] pointer-events-none -z-10" />

      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[85vh] flex flex-col justify-center pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Text Content */}
          <div className="animate-fade-in max-w-[600px]">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-white mb-6">
              Post-Quantum Security.<br />
              <span className="text-gray-500">In 2 lines of code.</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-normal mb-10 max-w-[500px]">
              The zero-trust API for post-quantum encryption. Secure your data with Kyber-1024. Your plaintext never leaves your runtime.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/signin"
                className="flex items-center justify-center px-6 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-colors text-sm"
              >
                Get API keys
              </Link>
              <Link
                href="https://quantachain.gitbook.io/quantacipher"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-3 bg-transparent text-white border border-[#333] font-semibold hover:bg-[#111] hover:border-gray-500 transition-colors text-sm"
              >
                Read Docs
              </Link>
            </div>
          </div>

          {/* Right Code Snippet UI */}
          <div className="w-full mt-10 lg:mt-0 animate-fade-in relative group">
            {/* Ambient glow behind code */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#222] to-[#111] blur-2xl opacity-50 transition duration-1000 group-hover:opacity-100" />
            
            <div className="relative bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
              {/* Fake Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] bg-[#0A0A0A]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                  <Terminal className="w-3.5 h-3.5" />
                  index.ts
                </div>
                <button 
                  onClick={handleCopy}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Code Content */}
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed text-gray-300">
                  <code>
                    <span className="text-[#C4ED5F]">import</span> {"{ QuantaCipher }"} <span className="text-[#C4ED5F]">from</span> <span className="text-gray-400">'quantacipher-sdk'</span>;<br /><br />
                    <span className="text-gray-600">{'// Initialize with your API key'}</span><br />
                    <span className="text-[#C4ED5F]">const</span> qc = <span className="text-[#C4ED5F]">new</span> QuantaCipher(<span className="text-gray-400">'sk_live_...'</span>);<br /><br />
                    <span className="text-gray-600">{'// Zero-trust Kyber-1024 encryption (client-side)'}</span><br />
                    <span className="text-[#C4ED5F]">const</span> {"{ ciphertext, receipt }"} = <span className="text-[#C4ED5F]">await</span> qc.encrypt(<br />
                    {"  "}<span className="text-gray-400">"Highly sensitive enterprise payload"</span><br />
                    );<br /><br />
                    console.<span className="text-blue-400">log</span>(<span className="text-gray-400">"Cryptographic receipt:"</span>, receipt.signature);
                  </code>
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
