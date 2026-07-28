"use client";

import Link from "next/link";
import { UserCircle2, Key, Terminal, ShieldCheck, Receipt, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserCircle2,
    title: "Authenticate",
    desc: "Create an organization account and register your application endpoints.",
    action: "Sign up free →",
    href: "/signin",
  },
  {
    icon: Key,
    title: "Provision Key",
    desc: "Generate your API keys via the dashboard.",
    action: "View dashboard →",
    href: "/dashboard",
  },
  {
    icon: Terminal,
    title: "Install SDK",
    desc: "npm install quantacipher-sdk. Available for Node.js and browser environments.",
    action: "Read docs →",
    href: "/documentation",
  },
  {
    icon: ShieldCheck,
    title: "Encrypt Data",
    desc: "Kyber-1024 WASM executes locally. Plaintext never leaves your memory space.",
    action: "Architecture →",
    href: "/security",
  },
  {
    icon: Receipt,
    title: "Validate & Log",
    desc: "Gateway issues a cryptographically signed receipt for audit and compliance.",
    action: "Learn more →",
    href: "/documentation#receipts",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-transparent border-t border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
              Integration Pipeline
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-tight max-w-2xl">
              From zero to <span className="text-[#C4ED5F]">quantum-safe</span>.
            </h2>
          </div>
          <Link
            href="https://quantachain.gitbook.io/quantacipher"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#333] hover:border-gray-500 rounded text-sm text-gray-300 hover:text-white transition-colors"
          >
            Read API Reference
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Technical Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-[#222] border border-[#222]">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative bg-[#000] p-6 flex flex-col group hover:bg-[#0A0A0A] transition-colors">
                <div className="text-[10px] font-mono text-gray-600 mb-6">STEP {i + 1}</div>
                
                <Icon className="w-6 h-6 text-gray-400 mb-6 group-hover:text-white transition-colors" />

                <h3 className="font-semibold text-white text-base mb-2 tracking-tight">{step.title}</h3>
                <p className="text-sm text-gray-500 font-normal leading-relaxed mb-8 flex-1">{step.desc}</p>
                
                <Link
                  href={step.href}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400 group-hover:text-[#C4ED5F] transition-colors mt-auto"
                >
                  {step.action}
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
