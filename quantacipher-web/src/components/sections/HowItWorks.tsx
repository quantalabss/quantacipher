"use client";

import Link from "next/link";
import { UserCircle2, Key, Terminal, ShieldCheck, Receipt, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserCircle2,
    title: "Sign Up",
    desc: "Create a free account with GitHub or Google. No credit card required.",
    action: "Sign up free →",
    href: "/signin",
  },
  {
    icon: Key,
    title: "Get API Key",
    desc: "Generate your API key from the dashboard. Instant, no approval process.",
    action: "View dashboard →",
    href: "/dashboard",
  },
  {
    icon: Terminal,
    title: "Install SDK",
    desc: "npm install quantacipher-sdk or pip install quantacipher. Two lines.",
    action: "Read docs →",
    href: "/documentation",
  },
  {
    icon: ShieldCheck,
    title: "Encrypt Locally",
    desc: "WASM engine runs Kyber-1024 inside your runtime. Plaintext never leaves.",
    action: "Architecture →",
    href: "/architecture",
  },
  {
    icon: Receipt,
    title: "Get Receipt",
    desc: "Gateway validates your key and issues a signed cryptographic audit receipt.",
    action: "Learn more →",
    href: "/documentation#receipts",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8db53a] mb-4">
            Get started in minutes
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter leading-tight">
            From zero to quantum-safe
          </h2>
        </div>

        {/* Timeline row */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#222] to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                  {/* Step number + icon bubble */}
                  <div className="relative mb-5">
                    <div className="w-20 h-20 rounded-2xl bg-[#111] border border-[#222] shadow-[0_2px_12px_rgba(0,0,0,0.4)] flex items-center justify-center group-hover:border-[#C4ED5F] transition-all">
                      <Icon className="w-8 h-8 text-gray-500" />
                    </div>
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#C4ED5F] text-black flex items-center justify-center text-[10px] font-black">
                      {i + 1}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-white text-base mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed mb-4 flex-1">{step.desc}</p>
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-1 text-[12px] font-bold text-[#8db53a] hover:text-[#C4ED5F] transition-colors"
                  >
                    {step.action}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-[#C4ED5F] hover:text-black transition-all text-sm uppercase tracking-wider hover:scale-105 active:scale-95"
          >
            Start for free — no credit card needed
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
