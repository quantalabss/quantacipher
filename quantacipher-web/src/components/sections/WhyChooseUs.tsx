"use client";

import { Package, Cpu, ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function WhyChooseUs() {
  const steps = [
    {
      step: "01",
      icon: Package,
      title: "Install the SDK",
      desc: "Add quantacipher-sdk to your project with one npm command. Works in Node.js, browsers, and any JavaScript codebase. Python bindings available via pip.",
      href: "https://www.npmjs.com/package/quantacipher-sdk",
      badge: "NPM · PIP",
    },
    {
      step: "02",
      icon: Cpu,
      title: "Encrypt Locally via WASM",
      desc: "Our Rust WASM engine executes NIST Kyber-1024 (ML-KEM) directly inside your JavaScript runtime. Your plaintext data never leaves your machine unencrypted.",
      href: "https://www.npmjs.com/package/quantacipher-wasm",
      badge: "Zero-Trust",
    },
    {
      step: "03",
      icon: ShieldCheck,
      title: "Cryptographic Receipt",
      desc: "The ciphertext is transmitted to our Gateway, which validates your API key, logs the event, and issues a signed cryptographic receipt with a tamper-proof timestamp.",
      href: "https://quantachain.gitbook.io/quantacipher",
      badge: "Tamper-Proof",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-transparent border-t border-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C4ED5F] mb-4">
            Architecture
          </p>
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1] max-w-2xl">
              Zero-trust encryption,{" "}
              <span className="text-gray-500">zero complexity.</span>
            </h2>
            <p className="text-sm text-gray-400 font-normal max-w-sm leading-relaxed">
              Quantum computers are coming. NIST issued final standards in 2024.
              QuantaCipher makes your app compliant today — in minutes, not months.
            </p>
          </div>
        </div>

        {/* Step cards (Bento style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Link
                key={i}
                href={step.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-[#0A0A0A] border border-[#222] p-8 transition-colors duration-300 hover:bg-[#111] flex flex-col min-h-[320px]"
              >
                {/* Step number — top right */}
                <div className="flex items-start justify-between mb-8">
                  <div className="w-10 h-10 rounded bg-[#111] border border-[#222] group-hover:border-[#333] flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-mono text-gray-600 transition-colors">
                    {step.step}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-sm text-gray-400 font-normal leading-relaxed">{step.desc}</p>
                </div>

                {/* Badge + arrow */}
                <div className="mt-8 flex items-center justify-between border-t border-[#222] pt-4">
                  <span className="text-[11px] font-medium px-2 py-1 rounded bg-[#111] text-gray-300 border border-[#222] uppercase tracking-wider">
                    {step.badge}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 group-hover:text-white transition-colors">
                    View SDKs <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom connector — "Read the full architecture" */}
        <div className="mt-12 flex justify-start">
          <Link
            href="/security"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Read the whitepaper <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
