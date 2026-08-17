"use client";

import { Package, Cpu, ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function WhyChooseUs() {
  const steps = [
    {
      step: "01",
      icon: Package,
      title: "Install the SDK",
      desc: "Add quantacipher-sdk to your project with one command. Works in Node.js, browsers, and any JS codebase.",
      href: "https://www.npmjs.com/package/quantacipher-sdk",
      badge: "NPM · PIP",
    },
    {
      step: "02",
      icon: Cpu,
      title: "Encrypt Locally",
      desc: "Our WASM engine executes ML-KEM directly inside your runtime. Your plaintext data never leaves your machine.",
      href: "https://www.npmjs.com/package/quantacipher-wasm",
      badge: "Zero-Trust",
    },
    {
      step: "03",
      icon: ShieldCheck,
      title: "Cryptographic Receipt",
      desc: "The ciphertext is transmitted to our Gateway, which logs the event and issues a tamper-proof timestamp.",
      href: "https://quantachain.gitbook.io/quantacipher",
      badge: "Tamper-Proof",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#FCFBF9] border-t border-[#E8E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8b7355] mb-4 font-sans">
            Architecture
          </p>
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <h2 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight leading-[1.1] max-w-2xl font-serif">
              Zero-trust encryption,{" "}
              <span className="text-[#6B6356]">zero complexity.</span>
            </h2>
            <p className="text-base text-[#6B6356] font-medium max-w-sm leading-relaxed font-sans">
              Quantum computers are coming. NIST issued final standards.
              QuantaCipher makes your app compliant today — in minutes.
            </p>
          </div>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Link
                key={i}
                href={step.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded p-8 transition-all duration-300 shadow-clean flex flex-col min-h-[320px] bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#8b7355]"
              >
                {/* Step number — top right */}
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 rounded flex items-center justify-center transition-colors bg-[#FCFBF9] border border-[#E8E5DF] group-hover:bg-[#EAE6DF] group-hover:border-[#D4D0C5]">
                    <Icon className="w-5 h-5 text-[#6B6356] group-hover:text-[#111111] transition-colors duration-300" />
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border border-[#E8E5DF] bg-[#FFFFFF] text-[#6B6356]">
                    {step.step}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-[#111111] text-xl mb-3 tracking-tight font-serif">{step.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-[#6B6356]">
                    {step.desc}
                  </p>
                </div>

                {/* Badge + arrow */}
                <div className="mt-8 flex items-center justify-between border-t border-[#E8E5DF] pt-5">
                  <span className="text-[11px] font-bold tracking-widest px-2 py-1 rounded-sm bg-[#FCFBF9] border border-[#E8E5DF] text-[#8b7355] group-hover:bg-[#EAE6DF] transition-colors">
                    {step.badge}
                  </span>
                  <div className="flex items-center gap-1 text-[12px] font-medium transition-colors text-[#6B6356] group-hover:text-[#111111]">
                    View SDKs <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom connector */}
        <div className="mt-12 flex justify-start font-sans">
          <Link
            href="/assets/QuantaCipher-Whitepaper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent border border-[#E8E5DF] text-[#111111] font-medium rounded hover:bg-[#EAE6DF] transition-colors text-sm"
          >
            Read the whitepaper <ArrowUpRight className="w-4 h-4 text-[#8b7355]" />
          </Link>
        </div>

      </div>
    </section>
  );
}
