"use client";

import { Package, Cpu, ShieldCheck, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function WhyChooseUs() {
  const steps = [
    {
      icon: Package,
      title: "1. Install the SDK",
      desc: "Add quantacipher-sdk to your project with one npm command. Works with Node.js, browsers, and any JavaScript or TypeScript codebase.",
      href: "/documentation",
      badge: "NPM",
    },
    {
      icon: Cpu,
      title: "2. Encrypt Locally via WASM",
      desc: "Our Rust WASM engine runs NIST Kyber-1024 (ML-KEM) directly inside your JavaScript runtime. Your plaintext data never leaves your machine unencrypted.",
      href: "/architecture",
      badge: "Zero-Trust",
    },
    {
      icon: ShieldCheck,
      title: "3. Cryptographic Receipt",
      desc: "The ciphertext is transmitted to our Gateway, which validates your API key, logs the event, and issues a cryptographic receipt with a timestamp.",
      href: "/documentation#receipts",
      badge: "Tamper-Proof",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 mb-16">
          <div className="max-w-2xl animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-extrabold text-black tracking-tighter mb-8 leading-tight">
              Zero-trust encryption, <br className="hidden md:block" /><span className="text-[#C4ED5F]">zero complexity.</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 font-medium mb-10 leading-relaxed">
              Quantum computers are coming. NIST issued the final standards in 2024.
              QuantaCipher makes your app compliant today — in minutes, not months.
            </p>
            <Link
              href="/documentation"
              className="inline-flex items-center text-sm font-bold text-black border-b-[3px] border-[#C4ED5F] pb-1 hover:text-[#C4ED5F] transition-colors uppercase tracking-widest"
            >
              Read Documentation <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* 3 service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Link
                key={index}
                href={step.href}
                className="group relative bg-white border border-gray-100 rounded-[2rem] p-10 hover:border-[#C4ED5F] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,229,153,0.1)] flex flex-col overflow-hidden"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#C4ED5F]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 flex items-center justify-between mb-8">
                  <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-black transition-all duration-300">
                    <Icon className="w-6 h-6 text-black group-hover:text-[#C4ED5F] transition-colors" />
                  </div>
                  {step.badge && (
                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 group-hover:bg-[#C4ED5F]/10 group-hover:text-[#C4ED5F] group-hover:border-[#C4ED5F]/20 transition-colors">
                      {step.badge}
                    </span>
                  )}
                </div>
                <h3 className="relative z-10 font-extrabold text-black text-2xl mb-4 tracking-tight group-hover:text-black transition-colors">{step.title}</h3>
                <p className="relative z-10 text-base text-gray-500 font-medium leading-relaxed flex-1 group-hover:text-gray-600 transition-colors">{step.desc}</p>
                <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-bold text-[#C4ED5F] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  View Technical Docs <ArrowUpRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
