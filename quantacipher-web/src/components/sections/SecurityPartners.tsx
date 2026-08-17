import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function SecurityPartners() {
  return (
    <section className="py-24 bg-[#FCFBF9] border-b border-[#E8E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-[#FFFFFF] border border-[#E8E5DF] p-8 md:p-12 shadow-clean">
          
          <div className="flex-1 max-w-2xl">
            <h2 className="text-2xl font-bold text-[#111111] font-serif mb-4">Independent Audits</h2>
            <p className="text-[16px] text-[#6B6356] leading-relaxed font-sans mb-8">
              Our core cryptographic Rust implementations undergo rigorous, continuous third-party audits by leading firms specializing in post-quantum cryptography. We commit to publishing summary letters of these audits on an annual basis to ensure absolute transparency.
            </p>
            <Link 
              href="/assets/QuantaKrypto-QuantaCipher-Audit.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 px-6 font-bold text-xs uppercase tracking-wider text-[#111111] bg-[#FCFBF9] border border-[#E8E5DF] hover:bg-[#E8E5DF] transition-colors group"
            >
              View Latest Audit Report
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="hidden md:block w-px h-32 bg-[#E8E5DF]"></div>
          
          <div className="flex flex-col items-center justify-center min-w-[240px]">
            <p className="text-[10px] font-bold tracking-widest text-[#6B6356] uppercase text-center mb-6">
              Security Audited & Trusted By
            </p>
            <div className="flex flex-col items-center gap-3">
              <img 
                src="/partners/quantakrypto-logo-dark.svg?v=2" 
                alt="Quantakrypto logo"
                className="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#6B6356]">
                QuantaCipher Audit Partner
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
