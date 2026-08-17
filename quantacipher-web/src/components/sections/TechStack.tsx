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
    <section id="integrations" className="py-24 md:py-32 bg-[#FCFBF9] border-t border-[#E8E5DF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="w-full lg:w-5/12 animate-fade-in">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8b7355] mb-4 block font-sans">
              Architecture
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#111111] tracking-tight mb-6 leading-tight font-serif text-balance">
              Two distinct modes of operation.
            </h2>
            <p className="text-base text-[#6B6356] font-medium mb-8 leading-relaxed font-sans">
              Whether you need permanently sealed audit logs or secure end-to-end encryption with user-held keys, QuantaCipher has you covered. Everything runs locally in your environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 font-sans">
              <Link href="/demo" className="bg-[#111111] text-white px-8 py-3.5 rounded font-medium hover:bg-[#2c2c2c] transition-all duration-200 text-sm text-center shadow-clean">
                View Architecture
              </Link>
            </div>
          </div>


          {/* Code Terminal */}
          <div className="w-full lg:w-7/12 animate-fade-in relative">
            <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-md overflow-hidden shadow-clean relative z-10 transition-all duration-300">
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E5DF] bg-[#FCFBF9] relative z-10 font-sans">
                
                {/* Language Switcher */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveTab('npm')}
                    className={`px-3 py-1 text-xs font-semibold rounded uppercase tracking-wider transition-all duration-200 ${activeTab === 'npm' ? 'bg-[#EAE6DF] text-[#111111]' : 'text-[#8b7355] hover:text-[#111111]'}`}
                  >
                    TypeScript
                  </button>
                  <button 
                    onClick={() => setActiveTab('python')}
                    className={`px-3 py-1 text-xs font-semibold rounded uppercase tracking-wider transition-all duration-200 ${activeTab === 'python' ? 'bg-[#EAE6DF] text-[#111111]' : 'text-[#8b7355] hover:text-[#111111]'}`}
                  >
                    Python
                  </button>
                </div>

                <div className="flex items-center text-[#8b7355] text-xs font-medium ml-auto mr-4">
                  Integration Example
                </div>
                <button onClick={copyToClipboard} className="text-[#8b7355] hover:text-[#111111] transition-colors p-1.5">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-[#111111]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Terminal Body */}
              <div className="p-4 sm:p-6 overflow-x-auto relative z-10 bg-[#FFFFFF] min-h-[350px]">
                <pre className="text-[10px] sm:text-xs md:text-sm font-mono leading-relaxed text-[#111111]">
                  <code>
                    {activeTab === 'npm' ? (
                      <>
                        <span className="text-[#A1A1AA]">// QuantaCipher Integration</span><br />
                        <span className="text-[#8b7355]">import</span> {'{ QuantaCipher }'} <span className="text-[#8b7355]">from</span> <span className="text-[#6B6356]">'quantacipher-sdk'</span>;<br />
                        <br />
                        <span className="text-[#8b7355]">const</span> sdk = <span className="text-[#8b7355]">new</span> QuantaCipher({'{'} apiKey: process.env.QZ_KEY {'}'});<br />
                        <br />
                        <span className="text-[#8b7355]">async function</span> <span className="text-[#111111]">processData</span>(patientRecord) {'{'}<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="inline-block bg-[#F4F2EC] text-[#8b7355] px-1.5 py-0.5 rounded-sm text-[10px] font-bold tracking-widest mt-2 mb-1 border border-[#E8E5DF]">VAULT MODE</span><span className="text-[#A1A1AA]"> (Permanent sealed record)</span><br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8b7355]">const</span> vaultCiphertext = sdk.<span className="text-[#111111]">encryptVault</span>(patientRecord);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8b7355]">const</span> receipt = <span className="text-[#8b7355]">await</span> sdk.<span className="text-[#111111]">vaultData</span>(patientRecord, {'{'} type: <span className="text-[#6B6356]">'hipaa_audit'</span> {'}'});<br />
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="inline-block bg-[#111111] text-white px-1.5 py-0.5 rounded-sm text-[10px] font-bold tracking-widest mt-2 mb-1">SECURE MODE</span><span className="text-[#A1A1AA]"> (User Holds Keys)</span><br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8b7355]">const</span> keypair = sdk.<span className="text-[#111111]">generateKeypair</span>();<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8b7355]">const</span> secureCiphertext = sdk.<span className="text-[#111111]">encryptSecure</span>(patientRecord, keypair.publicKey);<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8b7355]">const</span> plaintext = sdk.<span className="text-[#111111]">decryptSecure</span>(secureCiphertext, keypair.privateKey);<br />
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8b7355]">return</span> plaintext;<br />
                        {'}'}
                      </>
                    ) : (
                      <>
                        <span className="text-[#A1A1AA]"># QuantaCipher Integration</span><br />
                        <span className="text-[#8b7355]">from</span> quantacipher <span className="text-[#8b7355]">import</span> QuantaCipher<br />
                        <span className="text-[#8b7355]">import</span> os<br />
                        <br />
                        sdk = <span className="text-[#111111]">QuantaCipher</span>(api_key=os.getenv(<span className="text-[#6B6356]">"QZ_KEY"</span>))<br />
                        <br />
                        <span className="text-[#8b7355]">def</span> <span className="text-[#111111]">process_data</span>(patient_record):<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="inline-block bg-[#F4F2EC] text-[#8b7355] px-1.5 py-0.5 rounded-sm text-[10px] font-bold tracking-widest mt-2 mb-1 border border-[#E8E5DF]">VAULT MODE</span><span className="text-[#A1A1AA]"> (Permanent sealed record)</span><br />
                        &nbsp;&nbsp;&nbsp;&nbsp;vault_ciphertext = sdk.<span className="text-[#111111]">encrypt_vault</span>(patient_record)<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;receipt = sdk.<span className="text-[#111111]">vault_data</span>(patient_record, type=<span className="text-[#6B6356]">'hipaa_audit'</span>)<br />
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="inline-block bg-[#111111] text-white px-1.5 py-0.5 rounded-sm text-[10px] font-bold tracking-widest mt-2 mb-1">SECURE MODE</span><span className="text-[#A1A1AA]"> (User Holds Keys)</span><br />
                        &nbsp;&nbsp;&nbsp;&nbsp;keypair = sdk.<span className="text-[#111111]">generate_keypair</span>()<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;secure_ciphertext = sdk.<span className="text-[#111111]">encrypt_secure</span>(patient_record, keypair.public_key)<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;plaintext = sdk.<span className="text-[#111111]">decrypt_secure</span>(secure_ciphertext, keypair.private_key)<br />
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#8b7355]">return</span> plaintext<br />
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
