"use client";

import { useEffect } from "react";

// Load the tracking ID from environment variables
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export default function Analytics() {
  useEffect(() => {
    // Function to load Google Analytics
    const loadAnalytics = () => {
      if (!GA_TRACKING_ID) return;
      if (document.getElementById("google-analytics")) return;

      const script1 = document.createElement("script");
      script1.id = "google-analytics-gtag";
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
      document.head.appendChild(script1);

      const script2 = document.createElement("script");
      script2.id = "google-analytics";
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_TRACKING_ID}', {
          page_path: window.location.pathname,
        });
      `;
      document.head.appendChild(script2);
    };

    // Check if user already consented on mount
    const consent = localStorage.getItem("cookieConsent");
    if (consent === "true") {
      loadAnalytics();
    }

    // Listen for the custom event emitted by CookieBanner when they click "Accept"
    const handleConsentGiven = () => {
      loadAnalytics();
    };

    window.addEventListener("cookieConsentAccepted", handleConsentGiven);

    return () => {
      window.removeEventListener("cookieConsentAccepted", handleConsentGiven);
    };
  }, []);

  return null;
}
