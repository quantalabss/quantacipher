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
    <section className="py-24 bg-[#FCFBF9] border-t border-[#E8E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8b7355] mb-4 font-sans">
              Integration Pipeline
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight leading-tight max-w-2xl font-serif">
              From zero to <span className="text-[#6B6356]">quantum-safe</span>.
            </h2>
          </div>
          <Link
            href="https://quantachain.gitbook.io/quantacipher"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-2.5 bg-[#FFFFFF] border border-[#E8E5DF] hover:bg-[#EAE6DF] rounded font-medium text-sm text-[#111111] transition-all shadow-clean font-sans"
          >
            Read API Reference
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Technical Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-sans">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative bg-[#FFFFFF] border border-[#E8E5DF] rounded p-6 flex flex-col shadow-clean hover:border-[#8b7355] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded border border-[#E8E5DF] bg-[#FCFBF9] flex items-center justify-center font-bold text-xs text-[#111111] group-hover:bg-[#EAE6DF] transition-colors">
                    {i + 1}
                  </div>
                  <div className="flex-1 border-t border-[#E8E5DF]"></div>
                </div>
                
                <Icon className="w-6 h-6 text-[#111111] mb-4" />

                <h3 className="font-bold text-[#111111] text-base mb-2 tracking-tight font-serif">{step.title}</h3>
                <p className="text-sm text-[#6B6356] font-medium leading-relaxed mb-6 flex-1">{step.desc}</p>
                
                <Link
                  href={step.href}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#8b7355] group-hover:text-[#111111] transition-colors mt-auto"
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
