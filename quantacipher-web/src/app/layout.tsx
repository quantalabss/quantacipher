import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuantaCipher | Post-Quantum Data Security API",
  description: "QuantaCipher is the world's first post-quantum encryption SaaS. Secure your enterprise data with NIST-standard Kyber-1024 in two lines of code. HIPAA-ready, zero-trust architecture.",
};

import { Providers } from "@/components/providers/SessionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="antialiased min-h-screen bg-white text-[#202124] font-sans selection:bg-[#d2e3fc] selection:text-[#1a73e8]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
