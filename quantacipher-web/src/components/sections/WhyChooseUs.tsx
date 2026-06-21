"use client";

import { Package, Cpu, ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function WhyChooseUs() {
  const steps = [
    {
      step: "01",
      icon: Package,
      title: "Install the SDK",
      desc: "Add quantacipher-sdk to your project with one npm command. Works in Node.js, browsers, and any JavaScript or TypeScript codebase. Python bindings available via pip.",
      href: "/documentation",
      badge: "NPM · PIP",
      color: "from-[#C4ED5F]/10 to-transparent",
      borderColor: "group-hover:border-[#C4ED5F]/40",
    },
    {
      step: "02",
      icon: Cpu,
      title: "Encrypt Locally via WASM",
      desc: "Our Rust WASM engine executes NIST Kyber-1024 (ML-KEM) directly inside your JavaScript runtime. Your plaintext data never leaves your machine unencrypted.",
      href: "/architecture",
      badge: "Zero-Trust",
      color: "from-[#C4ED5F]/10 to-transparent",
      borderColor: "group-hover:border-[#C4ED5F]/40",
    },
    {
      step: "03",
      icon: ShieldCheck,
      title: "Cryptographic Receipt",
      desc: "The ciphertext is transmitted to our Gateway, which validates your API key, logs the event, and issues a signed cryptographic receipt with a tamper-proof timestamp.",
      href: "/documentation#receipts",
      badge: "Tamper-Proof",
      color: "from-[#C4ED5F]/10 to-transparent",
      borderColor: "group-hover:border-[#C4ED5F]/40",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-16">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8db53a] mb-4">
            How it works
          </p>
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter leading-tight max-w-xl">
              Zero-trust encryption,{" "}
              <span className="text-[#C4ED5F]">zero complexity.</span>
            </h2>
            <p className="text-base text-gray-400 font-medium max-w-sm leading-relaxed">
              Quantum computers are coming. NIST issued final standards in 2024.
              QuantaCipher makes your app compliant today — in minutes, not months.
            </p>
          </div>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Link
                key={i}
                href={step.href}
                className={`group relative bg-[#111] border border-[#222] rounded-2xl p-8 hover:border-[#C4ED5F]/40 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(196,237,95,0.08)] overflow-hidden flex flex-col`}
              >
                {/* Subtle gradient bg on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                {/* Step number — top right */}
                <div className="relative z-10 flex items-start justify-between mb-8">
                  <div className="w-11 h-11 rounded-xl bg-[#0a0a0a] border border-[#222] flex items-center justify-center group-hover:bg-black group-hover:border-[#C4ED5F] transition-all duration-300">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#C4ED5F] transition-colors" />
                  </div>
                  <span className="text-[11px] font-black text-gray-300 group-hover:text-[#C4ED5F] transition-colors tracking-widest">
                    {step.step}
                  </span>
                </div>

                <div className="relative z-10 flex-1">
                  <h3 className="font-extrabold text-white text-xl mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">{step.desc}</p>
                </div>

                {/* Badge + arrow */}
                <div className="relative z-10 mt-6 flex items-center justify-between">
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#0a0a0a] text-gray-400 border border-[#222] group-hover:bg-[#C4ED5F]/10 group-hover:text-[#C4ED5F] group-hover:border-[#C4ED5F]/20 transition-colors uppercase tracking-wider">
                    {step.badge}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-[#C4ED5F] transition-all transform translate-x-2 group-hover:translate-x-0">
                    Docs <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom connector — "Read the full architecture" */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/architecture"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors border-b-2 border-[#222] hover:border-[#C4ED5F] pb-0.5"
          >
            View full architecture →
          </Link>
        </div>

      </div>
    </section>
  );
}
