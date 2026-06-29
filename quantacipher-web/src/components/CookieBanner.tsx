"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Delay showing it slightly for better UX
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
    // Dispatch custom event to notify analytics components
    window.dispatchEvent(new Event("cookieConsentAccepted"));
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "false");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-sm z-50 animate-fade-in">
      <div className="bg-[#111] border border-white/10 shadow-2xl p-6 flex flex-col gap-4 text-white rounded-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-serif text-2xl text-white leading-none inline-block">
              ∿
            </span>
            <h3 className="font-bold text-sm uppercase tracking-widest text-white">
              Cookie Policy
            </h3>
          </div>
          <p className="text-sm font-medium text-white/70 leading-relaxed">
            We use minimal cookies to analyze traffic and secure our
            infrastructure. We believe in data minimization.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={acceptCookies}
            className="flex-1 px-4 py-2.5 bg-[#C4ED5F] border border-transparent text-black font-bold uppercase tracking-widest text-xs hover:bg-[#aade3e] transition-colors text-center rounded-lg"
          >
            Accept
          </button>
          <button
            onClick={declineCookies}
            className="flex-1 px-4 py-2.5 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors text-center rounded-lg"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
