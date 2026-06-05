"use client";

import { Terminal, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function TechStack() {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `// QuantaCipher Integration
import { QuantaCipher } from 'quantacipher-sdk';

const sdk = new QuantaCipher({
    apiKey: process.env.QZ_KEY
});

async function processData(patientRecord) {
    // Mode 1: Vault Mode (Permanent sealed record)
    const vaultCiphertext = sdk.encryptVault(patientRecord);
    const receipt = await sdk.vaultData(patientRecord, { type: 'hipaa_audit' });
    
    console.log("Audit logged", receipt.id);

    // Mode 2: Secure Mode (User Holds Keys)
    const keypair = sdk.generateKeypair();
    const secureCiphertext = sdk.encryptSecure(patientRecord, keypair.publicKey);
    
    // Decrypt locally with private key
    const plaintext = sdk.decryptSecure(secureCiphertext, keypair.privateKey);
    
    return plaintext;
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="integrations" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="w-full lg:w-5/12 animate-fade-in">
            <span className="text-[#C4ED5F] font-bold tracking-widest uppercase text-xs mb-6 block">
              Architecture
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-black tracking-tighter mb-6 leading-tight">
              Two distinct modes <br />
              of operation.
            </h2>
            <p className="text-lg text-gray-500 font-medium mb-8">
              Whether you need permanently sealed audit logs or secure end-to-end encryption with user-held keys, QuantaCipher has you covered. Everything runs locally in your environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signin" className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-[#C4ED5F] hover:text-black transition-all hover:scale-105 active:scale-95 text-center">
                Get API Key
              </Link>
              <Link href="/documentation" className="bg-white text-black border border-gray-200 px-8 py-4 rounded-full font-medium hover:border-[#C4ED5F] hover:text-[#C4ED5F] transition-all text-center">
                Read the Docs
              </Link>
            </div>
          </div>

          {/* Code Terminal */}
          <div className="w-full lg:w-7/12 animate-fade-in">
            <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#111]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div className="flex items-center text-gray-500 text-xs font-mono">
                  <Terminal className="w-3 h-3 mr-2" />
                  index.ts
                </div>
                <button onClick={copyToClipboard} className="text-gray-500 hover:text-[#C4ED5F] transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-[#C4ED5F]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Terminal Body */}
              <div className="p-4 sm:p-6 overflow-x-auto">
                <pre className="text-[10px] sm:text-xs md:text-sm font-mono leading-relaxed">
                  <code className="text-gray-300">
                    <span className="text-gray-500">// QuantaCipher Integration</span><br />
                    <span className="text-blue-400">import</span> {'{ QuantaCipher }'} <span className="text-blue-400">from</span> <span className="text-green-400">'quantacipher-sdk'</span>;<br />
                    <br />
                    <span className="text-blue-400">const</span> sdk = <span className="text-yellow-200">new</span> QuantaCipher({'{'}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;apiKey: process.env.QZ_KEY<br />
                    {'}'});<br />
                    <br />
                    <span className="text-blue-400">async function</span> <span className="text-yellow-200">processData</span>(patientRecord) {'{'}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// Mode 1: Vault Mode (Permanent sealed record)</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> vaultCiphertext = sdk.<span className="text-yellow-200">encryptVault</span>(patientRecord);<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> receipt = <span className="text-blue-400">await</span> sdk.<span className="text-yellow-200">vaultData</span>(patientRecord, {'{'} type: <span className="text-green-400">'hipaa_audit'</span> {'}'});<br />
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// Mode 2: Secure Mode (User Holds Keys)</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> keypair = sdk.<span className="text-yellow-200">generateKeypair</span>();<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> secureCiphertext = sdk.<span className="text-yellow-200">encryptSecure</span>(patientRecord, keypair.publicKey);<br />
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// Decrypt locally with private key</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> plaintext = sdk.<span className="text-yellow-200">decryptSecure</span>(secureCiphertext, keypair.privateKey);<br />
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">return</span> plaintext;<br />
                    {'}'}
                  </code>
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
