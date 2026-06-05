"use client";

import { Activity, Building2, Scale, Landmark, ShieldPlus, Server } from "lucide-react";

export function TrustedBy() {
  const logos = [
    { icon: Activity, name: "Healthcare" },
    { icon: Landmark, name: "FinTech" },
    { icon: Scale, name: "Legal & Compliance" },
    { icon: Building2, name: "Government" },
    { icon: ShieldPlus, name: "Insurance" },
    { icon: Server, name: "Enterprise SaaS" },
  ];

  return (
    <div className="bg-white py-4 overflow-hidden border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center sm:justify-between items-center gap-6 opacity-40 grayscale">
          {logos.map((logo, index) => {
            const Icon = logo.icon;
            return (
              <div key={index} className="flex items-center space-x-2 text-gray-600 hover:text-[#C4ED5F] hover:grayscale-0 hover:opacity-100 transition-all cursor-default scale-90 sm:scale-100">
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-xs md:text-sm tracking-tight">{logo.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
