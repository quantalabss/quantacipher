import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://quantacipher.com'),
  title: "QuantaCipher | Post-Quantum Data Security API",
  description: "QuantaCipher is the world's first post-quantum encryption SaaS. Secure your enterprise data with NIST-standard Kyber-1024 in two lines of code. HIPAA-ready, zero-trust architecture.",
  openGraph: {
    title: "QuantaCipher | Post-Quantum Data Security API",
    description: "Secure your enterprise data with NIST-standard Kyber-1024 in two lines of code. Zero-trust architecture.",
    url: 'https://quantacipher.com',
    siteName: 'QuantaCipher',
    images: [
      {
        url: '/og/image.png',
        width: 1200,
        height: 630,
        alt: 'QuantaCipher - Zero Trust Post Quantum Security',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "QuantaCipher | Post-Quantum Data Security API",
    description: "Secure your enterprise data with NIST-standard Kyber-1024 in two lines of code. Zero-trust architecture.",
    images: ['/og/image.png'],
  },
  icons: {
    icon: '/icon.svg?v=2',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Providers } from "@/components/providers/SessionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-[#FCFBF9] text-[#111111] relative antialiased selection:bg-[#EAE6DF] selection:text-[#111111] font-sans">
        
        {/* Very subtle noise/glow overlay for Frontier AI feel if needed later. For now, pure white. */}
        <Providers>
          {children}
        </Providers>
        <CookieBanner />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "QuantaCipher",
              "applicationCategory": "SecurityApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "publisher": {
                "@type": "Organization",
                "name": "QuantaLabs Private Limited",
                "url": "https://www.quantalabs.cc"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
