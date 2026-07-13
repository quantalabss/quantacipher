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
    icon: '/favicon.ico',
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
      <body className="min-h-full flex flex-col bg-[#000000] text-[#ededed] relative antialiased selection:bg-[#C4ED5F] selection:text-black font-sans">
        {/* Soft Global Glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 -left-[10%] w-[50vw] h-[50vw] bg-white opacity-[0.01] blur-[150px] rounded-full" />
          <div className="absolute bottom-1/4 -right-[10%] w-[50vw] h-[50vw] bg-white opacity-[0.02] blur-[150px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#C4ED5F] opacity-[0.01] blur-[200px] rounded-full" />
        </div>
        
        {/* Global Noise Overlay */}
        <div 
          className="fixed inset-0 z-[999] pointer-events-none opacity-[0.25] mix-blend-screen"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '120px 120px'
          }} 
        />
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
