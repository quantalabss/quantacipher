"use client";

import { Activity, Building2, Scale, Landmark, ShieldPlus, Server, Database, Lock } from "lucide-react";

const industries = [
  { icon: Activity, name: "Healthcare" },
  { icon: Landmark, name: "FinTech" },
  { icon: Scale, name: "Legal & Compliance" },
  { icon: Building2, name: "Government" },
  { icon: ShieldPlus, name: "Insurance" },
  { icon: Server, name: "Enterprise SaaS" },
  { icon: Database, name: "Cloud Infrastructure" },
  { icon: Lock, name: "Defence & Intel" },
  // duplicate for seamless loop
  { icon: Activity, name: "Healthcare" },
  { icon: Landmark, name: "FinTech" },
  { icon: Scale, name: "Legal & Compliance" },
  { icon: Building2, name: "Government" },
  { icon: ShieldPlus, name: "Insurance" },
  { icon: Server, name: "Enterprise SaaS" },
  { icon: Database, name: "Cloud Infrastructure" },
  { icon: Lock, name: "Defence & Intel" },
];

export function TrustedBy() {
  return (
    <div className="bg-transparent py-0 overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-5 flex items-center justify-center">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
          Designed for regulated industries
        </p>
      </div>

      {/* Marquee row */}
      <div className="relative overflow-hidden pb-8">
        {/* Fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[#000] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#000] to-transparent" />

        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {industries.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 px-6 py-3 mx-2 rounded-xl border border-[#222] bg-[#0a0a0a] shadow-[0_1px_4px_rgba(0,0,0,0.4)] group hover:border-[#C4ED5F]/40 hover:shadow-[0_4px_12px_rgba(196,237,95,0.08)] transition-all cursor-default whitespace-nowrap"
              >
                <div className="w-7 h-7 rounded-lg bg-[#111] flex items-center justify-center group-hover:bg-[#C4ED5F]/10 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#C4ED5F] transition-colors" />
                </div>
                <span className="text-[12px] font-bold text-gray-400 group-hover:text-white transition-colors tracking-tight">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
