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
    <div className="bg-white py-0 overflow-hidden border-t border-gray-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-5 flex items-center justify-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
          Designed for regulated industries
        </p>
      </div>

      {/* Marquee row */}
      <div className="relative overflow-hidden pb-8">
        {/* Fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-white to-transparent" />

        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {industries.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 px-6 py-3 mx-2 rounded-xl border border-gray-200 bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)] group hover:border-orange-200 hover:bg-orange-50 hover:shadow-md transition-all cursor-default whitespace-nowrap"
              >
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-gray-100 group-hover:border-orange-200 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-500 transition-colors" />
                </div>
                <span className="text-[12px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors tracking-tight">
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
