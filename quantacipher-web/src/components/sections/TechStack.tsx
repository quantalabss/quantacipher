"use client";

import { Terminal, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function TechStack() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'npm' | 'python'>('npm');

  const npmSnippet = `// QuantaCipher Integration
import { QuantaCipher } from 'quantacipher-sdk';

const sdk = new QuantaCipher({ apiKey: process.env.QZ_KEY });

async function processData(patientRecord) {
    // ■ VAULT MODE (Permanent sealed record)
    const vaultCiphertext = sdk.encryptVault(patientRecord);
    const receipt = await sdk.vaultData(patientRecord, { type: 'hipaa_audit' });

    // ■ SECURE MODE (User Holds Keys)
    const keypair = sdk.generateKeypair();
    const secureCiphertext = sdk.encryptSecure(patientRecord, keypair.publicKey);
    const plaintext = sdk.decryptSecure(secureCiphertext, keypair.privateKey);
    
    return plaintext;
}`;

  const pythonSnippet = `# QuantaCipher Integration
from quantacipher import QuantaCipher
import os

sdk = QuantaCipher(api_key=os.getenv("QZ_KEY"))

def process_data(patient_record):
    # ■ VAULT MODE (Permanent sealed record)
    vault_ciphertext = sdk.encrypt_vault(patient_record)
    receipt = sdk.vault_data(patient_record, type='hipaa_audit')

    # ■ SECURE MODE (User Holds Keys)
    keypair = sdk.generate_keypair()
    secure_ciphertext = sdk.encrypt_secure(patient_record, keypair.public_key)
    plaintext = sdk.decrypt_secure(secure_ciphertext, keypair.private_key)
    
    return plaintext`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeTab === 'npm' ? npmSnippet : pythonSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="integrations" className="py-24 md:py-32 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="w-full lg:w-5/12 animate-fade-in">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8db53a] mb-4 block">
              Architecture
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter mb-6 leading-tight">
              Two distinct modes<br />of operation.
            </h2>
            <p className="text-base text-gray-400 font-medium mb-8 leading-relaxed">
              Whether you need permanently sealed audit logs or secure end-to-end encryption with user-held keys, QuantaCipher has you covered. Everything runs locally in your environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/demo" className="bg-white text-black px-8 py-3.5 rounded-none font-bold hover:bg-[#C4ED5F] hover:text-black transition-all text-sm uppercase tracking-wider text-center">
                Try Demo
              </Link>
              <Link href="https://quantachain.gitbook.io/quantacipher" target="_blank" rel="noopener noreferrer" className="bg-[#111] text-white border border-[#222] px-8 py-3.5 rounded-none font-semibold hover:border-[#C4ED5F] hover:text-[#8db53a] transition-all text-sm text-center">
                Read the Docs
              </Link>
            </div>
          </div>


          {/* Code Terminal */}
          <div className="w-full lg:w-7/12 animate-fade-in relative">
            <div className="bg-black border border-white/5 rounded-none overflow-hidden shadow-2xl relative z-10">
              
              {/* Subtle background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#222]/50 to-transparent opacity-50 pointer-events-none" />
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/50 backdrop-blur-md relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                
                {/* Language Switcher */}
                <div className="flex items-center bg-[#111] border border-white/10 rounded-none p-0.5 ml-4">
                  <button 
                    onClick={() => setActiveTab('npm')}
                    className={`px-3 py-1 text-xs font-semibold rounded-none transition-colors ${activeTab === 'npm' ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Node.js
                  </button>
                  <button 
                    onClick={() => setActiveTab('python')}
                    className={`px-3 py-1 text-xs font-semibold rounded-none transition-colors ${activeTab === 'python' ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Python
                  </button>
                </div>

                <div className="flex items-center text-gray-500 text-xs font-mono ml-auto mr-4">
                  <Terminal className="w-3 h-3 mr-2" />
                  {activeTab === 'npm' ? 'index.ts' : 'main.py'}
                </div>
                <button onClick={copyToClipboard} className="text-gray-500 hover:text-[#C4ED5F] transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-[#C4ED5F]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Terminal Body */}
              <div className="p-4 sm:p-6 overflow-x-auto relative z-10">
                <pre className="text-[10px] sm:text-xs md:text-sm font-mono leading-relaxed">
                  <code className="text-gray-300">
                    {activeTab === 'npm' ? (
                      <>
                        <span className="text-gray-500">// QuantaCipher Integration</span><br />
                        <span className="text-blue-400">import</span> {'{ QuantaCipher }'} <span className="text-blue-400">from</span> <span className="text-green-400">'quantacipher-sdk'</span>;<br />
                        <br />
                        <span className="text-blue-400">const</span> sdk = <span className="text-yellow-200">new</span> QuantaCipher({'{'} apiKey: process.env.QZ_KEY {'}'});<br />
                        <br />
                        <span className="text-blue-400">async function</span> <span className="text-yellow-200">processData</span>(patientRecord) {'{'}<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="inline-block bg-[#C4ED5F]/20 text-[#C4ED5F] px-1.5 py-0.5 rounded-none text-[10px] font-bold tracking-wider mt-2 mb-1 border border-[#C4ED5F]/30">■ VAULT MODE</span><span className="text-gray-500"> (Permanent sealed record)</span><br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> vaultCiphertext = sdk.<span className="text-yellow-200">encryptVault</span>(patientRecord);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> receipt = <span className="text-blue-400">await</span> sdk.<span className="text-yellow-200">vaultData</span>(patientRecord, {'{'} type: <span className="text-green-400">'hipaa_audit'</span> {'}'});<br />
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="inline-block bg-white/20 text-white px-1.5 py-0.5 rounded-none text-[10px] font-bold tracking-wider mt-2 mb-1 border border-white/30">■ SECURE MODE</span><span className="text-gray-500"> (User Holds Keys)</span><br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> keypair = sdk.<span className="text-yellow-200">generateKeypair</span>();<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> secureCiphertext = sdk.<span className="text-yellow-200">encryptSecure</span>(patientRecord, keypair.publicKey);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> plaintext = sdk.<span className="text-yellow-200">decryptSecure</span>(secureCiphertext, keypair.privateKey);<br />
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">return</span> plaintext;<br />
                        {'}'}
                      </>
                    ) : (
                      <>
                        <span className="text-gray-500"># QuantaCipher Integration</span><br />
                        <span className="text-blue-400">from</span> quantacipher <span className="text-blue-400">import</span> QuantaCipher<br />
                        <span className="text-blue-400">import</span> os<br />
                        <br />
                        sdk = <span className="text-yellow-200">QuantaCipher</span>(api_key=os.getenv(<span className="text-green-400">"QZ_KEY"</span>))<br />
                        <br />
                        <span className="text-blue-400">def</span> <span className="text-yellow-200">process_data</span>(patient_record):<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="inline-block bg-[#C4ED5F]/20 text-[#C4ED5F] px-1.5 py-0.5 rounded-none text-[10px] font-bold tracking-wider mt-2 mb-1 border border-[#C4ED5F]/30">■ VAULT MODE</span><span className="text-gray-500"> (Permanent sealed record)</span><br />
                        &nbsp;&nbsp;&nbsp;&nbsp;vault_ciphertext = sdk.<span className="text-yellow-200">encrypt_vault</span>(patient_record)<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;receipt = sdk.<span className="text-yellow-200">vault_data</span>(patient_record, type=<span className="text-green-400">'hipaa_audit'</span>)<br />
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="inline-block bg-white/20 text-white px-1.5 py-0.5 rounded-none text-[10px] font-bold tracking-wider mt-2 mb-1 border border-white/30">■ SECURE MODE</span><span className="text-gray-500"> (User Holds Keys)</span><br />
                        &nbsp;&nbsp;&nbsp;&nbsp;keypair = sdk.<span className="text-yellow-200">generate_keypair</span>()<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;secure_ciphertext = sdk.<span className="text-yellow-200">encrypt_secure</span>(patient_record, keypair.public_key)<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;plaintext = sdk.<span className="text-yellow-200">decrypt_secure</span>(secure_ciphertext, keypair.private_key)<br />
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">return</span> plaintext<br />
                      </>
                    )}
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
