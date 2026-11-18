//! 5G Telecom-CBOM & Cryptographic Readiness Analyzer
//! Evaluates 5G Core Network Functions (AMF, UDM, AUSF, NRF, SEPP) and O-RAN
//! configurations against TEC 910018:2025 (Sections 2.6 & 4.1.2 Cryptographic Inventory)
//! and TEC 910028:2025 (5G PQC Guidelines), generating CycloneDX 1.6 CBOM.

use serde::{Deserialize, Serialize};

/// Severity level for audit findings.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum FindingSeverity {
    Critical,
    High,
    Medium,
    Low,
    Pass,
}

/// A cryptographic asset discovered in the 5G telecom deployment.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TelecomCryptoAsset {
    /// 5G Network Function (e.g. "UDM / SIDF", "NRF", "v-SEPP", "AMF")
    pub network_function: String,
    /// Logical interface or usage (e.g. "Radio NAS Signaling", "SBI OAuth2", "N32-f Roaming")
    pub interface_name: String,
    /// Cryptographic primitive (e.g. "Key Encapsulation", "Digital Signature", "Symmetric Cipher")
    pub primitive: String,
    /// Algorithm identifier in use
    pub algorithm: String,
    /// Effective key length or curve
    pub key_size: String,
    /// Whether algorithm is Classical, Hybrid, or Pure Post-Quantum
    pub crypto_type: String,
    /// Quantum resistance status
    pub quantum_safe: bool,
    /// Standard reference (e.g. "3GPP TS 33.501 Annex C", "TEC 910028:2025 §6.4 Profile D")
    pub standard_ref: String,
}

/// An audit finding detailing compliance or vulnerability status.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TelecomAuditFinding {
    /// Finding severity
    pub severity: FindingSeverity,
    /// Issue title
    pub title: String,
    /// Affected Network Function
    pub network_function: String,
    /// Detailed technical explanation
    pub description: String,
    /// Standard or guideline clause
    pub compliance_clause: String,
    /// Recommended migration remediation
    pub remediation: String,
}

/// Complete 5G Telecom Post-Quantum Audit & Readiness Report.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TelecomAuditReport {
    /// Overall readiness score (0 to 100)
    pub overall_score: u32,
    /// Overall quantum risk classification
    pub quantum_risk_level: String,
    /// Whether the configuration satisfies TEC 910018/910028 Quantum Readiness criteria
    #[serde(alias = "readiness_pass")]
    pub mtcte_certified: bool,
    /// Number of critical quantum vulnerabilities found
    pub critical_count: u32,
    /// Number of high-risk items
    pub high_count: u32,
    /// List of evaluated network functions
    pub evaluated_nfs: Vec<String>,
    /// Full cryptographic inventory
    pub assets: Vec<TelecomCryptoAsset>,
    /// Security & compliance findings
    pub findings: Vec<TelecomAuditFinding>,
    /// CycloneDX 1.6 CBOM formatted JSON
    pub cyclonedx_cbom_json: String,
}

/// Configurable parameters for auditing a 5G Core deployment.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TelecomAuditConfig {
    /// Identity Concealment scheme in UDM/AMF ("profile_a", "profile_b", "profile_c", "profile_d")
    pub suci_profile: String,
    /// SBA OAuth2 token algorithm in NRF ("rsa_2048", "ecdsa_p256", "mldsa_65", "hybrid_mldsa65_p256")
    pub sba_token_alg: String,
    /// Roaming interconnect KEM in SEPP ("none", "classical_ecdh", "mlkem_768", "hybrid_xwing")
    pub sepp_roaming_kem: String,
    /// Radio NAS cipher in AMF/gNodeB ("nea0", "nea1_snow3g", "nea2_aes128", "nea4_aes256")
    pub nas_cipher: String,
    /// User plane cipher in UPF/gNodeB ("nea0", "nea2_aes128", "nea4_aes256")
    pub up_cipher: String,
}

impl Default for TelecomAuditConfig {
    fn default() -> Self {
        Self {
            suci_profile: "profile_d".to_string(),
            sba_token_alg: "hybrid_mldsa65_p256".to_string(),
            sepp_roaming_kem: "hybrid_xwing".to_string(),
            nas_cipher: "nea4_aes256".to_string(),
            up_cipher: "nea4_aes256".to_string(),
        }
    }
}

/// Executes a compliance audit of a 5G telecom configuration against
/// TEC 910018:2025 and TEC 910028:2025 standards.
pub fn audit_telecom_deployment(config: &TelecomAuditConfig) -> TelecomAuditReport {
    let mut assets = Vec::new();
    let mut findings = Vec::new();
    let mut score: i32 = 100;
    let mut critical_count = 0;
    let mut high_count = 0;

    // =========================================================================
    // 1. Audit SUCI Subscriber Identity Concealment (3GPP TS 33.501 Annex C & TEC §6.4)
    // =========================================================================
    match config.suci_profile.as_str() {
        "profile_c" => {
            assets.push(TelecomCryptoAsset {
                network_function: "UDM / SIDF".to_string(),
                interface_name: "Radio N1/N2 (SUCI)".to_string(),
                primitive: "Key Encapsulation (PQ-IES)".to_string(),
                algorithm: "ML-KEM-768".to_string(),
                key_size: "1184 bytes".to_string(),
                crypto_type: "Pure Post-Quantum".to_string(),
                quantum_safe: true,
                standard_ref: "TEC 910028:2025 §6.4.1 Profile C (Proposed PQ Extension)".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::Pass,
                title: "Quantum-Resilient Subscriber Identity Concealment (Profile C Proposal)".to_string(),
                network_function: "UDM / SIDF".to_string(),
                description: "Module-Lattice KEM (ML-KEM-768) protects subscriber IMSI/SUPI over the air against passive eavesdropping and HNDL decryption.".to_string(),
                compliance_clause: "TEC 910028:2025 Clause 6.4.1".to_string(),
                remediation: "Compliant proposed design. Note: USIM requires Extended Length APDU (ISO 7816-4) or ME baseband calculation.".to_string(),
            });
        }
        "profile_d" => {
            assets.push(TelecomCryptoAsset {
                network_function: "UDM / SIDF".to_string(),
                interface_name: "Radio N1/N2 (SUCI)".to_string(),
                primitive: "Hybrid Key Encapsulation (PQ-IES)".to_string(),
                algorithm: "ML-KEM-768 + X25519".to_string(),
                key_size: "1216 bytes (Hybrid)".to_string(),
                crypto_type: "Hybrid Post-Quantum".to_string(),
                quantum_safe: true,
                standard_ref: "TEC 910028:2025 §6.4.2 Profile D (Proposed Hybrid Extension)".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::Pass,
                title: "Hybrid Post-Quantum Identity Concealment (Profile D Proposal)".to_string(),
                network_function: "UDM / SIDF".to_string(),
                description: "Combines classical X25519 with ML-KEM-768 for dual defense per DoT recommendations.".to_string(),
                compliance_clause: "TEC 910028:2025 Clause 6.4.2".to_string(),
                remediation: "Compliant proposed design. Provides classical fallback security alongside quantum resilience.".to_string(),
            });
        }
        "profile_a" => {
            score -= 30;
            critical_count += 1;
            assets.push(TelecomCryptoAsset {
                network_function: "UDM / SIDF".to_string(),
                interface_name: "Radio N1/N2 (SUCI)".to_string(),
                primitive: "Key Agreement (ECIES)".to_string(),
                algorithm: "Curve25519".to_string(),
                key_size: "256 bits".to_string(),
                crypto_type: "Classical".to_string(),
                quantum_safe: false,
                standard_ref: "3GPP TS 33.501 Annex C Profile A (Vulnerable to Quantum Decryption)".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::Critical,
                title: "Vulnerable Classical SUCI Concealment (Profile A Curve25519)".to_string(),
                network_function: "UDM / SIDF".to_string(),
                description: "Shor's algorithm breaks discrete logarithm on Curve25519. Eavesdropped SUCI ciphertexts can be stored and decrypted post-quantum to reveal permanent subscriber IMSI (HNDL).".to_string(),
                compliance_clause: "TEC 910028:2025 Section 6.4 (Recommends PQ-IES Profile C/D)".to_string(),
                remediation: "Upgrade UDM/SIDF and USIM profiles to Profile D (Hybrid ML-KEM-768 + X25519).".to_string(),
            });
        }
        _ => {
            score -= 35;
            critical_count += 1;
            assets.push(TelecomCryptoAsset {
                network_function: "UDM / SIDF".to_string(),
                interface_name: "Radio N1/N2 (SUCI)".to_string(),
                primitive: "Key Agreement (ECIES)".to_string(),
                algorithm: "secp256r1 (P-256)".to_string(),
                key_size: "256 bits".to_string(),
                crypto_type: "Classical".to_string(),
                quantum_safe: false,
                standard_ref: "3GPP TS 33.501 Profile B (Deprecated for PQC)".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::Critical,
                title: "Vulnerable Classical SUCI Concealment (Profile B secp256r1)".to_string(),
                network_function: "UDM / SIDF".to_string(),
                description: "Weierstrass curve secp256r1 is completely vulnerable to Shor's algorithm on cryptanalytically relevant quantum computers.".to_string(),
                compliance_clause: "TEC 910028:2025 Section 6.4".to_string(),
                remediation: "Upgrade to Profile C (ML-KEM-768) or Profile D (Hybrid).".to_string(),
            });
        }
    }

    // =========================================================================
    // 2. Audit 5G SBA Core OAuth2 Tokens (3GPP TS 33.501 §6.3.1 & TEC 910018:2025)
    // =========================================================================
    match config.sba_token_alg.as_str() {
        "hybrid_mldsa65_p256" => {
            assets.push(TelecomCryptoAsset {
                network_function: "NRF (Token Authority)".to_string(),
                interface_name: "Service-Based Architecture (SBA)".to_string(),
                primitive: "Digital Signature (OAuth2)".to_string(),
                algorithm: "Hybrid ML-DSA-65 + ECDSA P-256".to_string(),
                key_size: "1952B + 64B".to_string(),
                crypto_type: "Non-Separable Hybrid".to_string(),
                quantum_safe: true,
                standard_ref: "TEC 910018:2025 Figure 3".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::Pass,
                title: "Quantum-Safe Non-Separable Hybrid SBA Token Signatures".to_string(),
                network_function: "NRF".to_string(),
                description: "NRF issues PQ-JWT tokens binding ML-DSA-65 and ECDSA P-256 in non-separable composite mode.".to_string(),
                compliance_clause: "TEC 910018:2025 Section 6.3.1 & Figure 3".to_string(),
                remediation: "Compliant with highest DoT standards.".to_string(),
            });
        }
        "mldsa_65" => {
            assets.push(TelecomCryptoAsset {
                network_function: "NRF (Token Authority)".to_string(),
                interface_name: "Service-Based Architecture (SBA)".to_string(),
                primitive: "Digital Signature (OAuth2)".to_string(),
                algorithm: "ML-DSA-65 (FIPS 204)".to_string(),
                key_size: "1952 bytes".to_string(),
                crypto_type: "Pure Post-Quantum".to_string(),
                quantum_safe: true,
                standard_ref: "NIST FIPS 204 Level 3".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::Pass,
                title: "Quantum-Resilient FIPS 204 SBA Token Gateway".to_string(),
                network_function: "NRF".to_string(),
                description: "SBA inter-NF tokens signed using Module-Lattice Digital Signatures.".to_string(),
                compliance_clause: "TEC 910028:2025 §6.3.1".to_string(),
                remediation: "Compliant.".to_string(),
            });
        }
        "rsa_2048" => {
            score -= 25;
            high_count += 1;
            assets.push(TelecomCryptoAsset {
                network_function: "NRF".to_string(),
                interface_name: "Service-Based Architecture (SBA)".to_string(),
                primitive: "Digital Signature".to_string(),
                algorithm: "RSA-2048 (RS256)".to_string(),
                key_size: "2048 bits".to_string(),
                crypto_type: "Classical".to_string(),
                quantum_safe: false,
                standard_ref: "RFC 7515 RS256 (Deprecated for PQC)".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::High,
                title: "Quantum-Vulnerable SBA Token Signing (RSA-2048)".to_string(),
                network_function: "NRF".to_string(),
                description: "Quantum computers running Shor's algorithm can factor 2048-bit RSA keys, allowing attackers to forge NRF access tokens and hijack core NFs.".to_string(),
                compliance_clause: "TEC 910018:2025 Section 2.6 & Section 4.1.2".to_string(),
                remediation: "Deploy QuantaCipher SBA Token Gateway with ML-DSA-65 or Hybrid signing.".to_string(),
            });
        }
        _ => {
            score -= 20;
            high_count += 1;
            assets.push(TelecomCryptoAsset {
                network_function: "NRF".to_string(),
                interface_name: "Service-Based Architecture (SBA)".to_string(),
                primitive: "Digital Signature".to_string(),
                algorithm: "ECDSA P-256 (ES256)".to_string(),
                key_size: "256 bits".to_string(),
                crypto_type: "Classical".to_string(),
                quantum_safe: false,
                standard_ref: "RFC 7515 ES256 (Vulnerable to Quantum)".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::High,
                title: "Vulnerable Classical ECDSA Token Gateway".to_string(),
                network_function: "NRF".to_string(),
                description: "Elliptic curve discrete log is broken by quantum computers. Rogue NFs can forge authorization grants.".to_string(),
                compliance_clause: "TEC 910018:2025 Section 2.6 & Section 4.1.2".to_string(),
                remediation: "Migrate to Hybrid ML-DSA-65 + ECDSA P-256 (pending final IETF JOSE RFC).".to_string(),
            });
        }
    }

    // =========================================================================
    // 3. Audit SEPP N32 Roaming Interconnect (3GPP TS 33.501 §5.9.3 & Annex H)
    // =========================================================================
    match config.sepp_roaming_kem.as_str() {
        "hybrid_xwing" | "mlkem_768" => {
            assets.push(TelecomCryptoAsset {
                network_function: "Security Edge Protection Proxy (SEPP)".to_string(),
                interface_name: "N32-f Roaming Interconnect".to_string(),
                primitive: "Key Encapsulation (JWE PRINS)".to_string(),
                algorithm: if config.sepp_roaming_kem == "hybrid_xwing" { "Hybrid X-Wing" } else { "ML-KEM-768" }.to_string(),
                key_size: "256-bit CEK (PQC-Encapped)".to_string(),
                crypto_type: "Post-Quantum".to_string(),
                quantum_safe: true,
                standard_ref: "3GPP TS 33.501 Annex H & TEC 910018:2025 §3.4".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::Pass,
                title: "Quantum-Resilient Roaming Interconnect (PRINS JWE Design)".to_string(),
                network_function: "SEPP".to_string(),
                description: "Content Encryption Keys across N32-f roaming interfaces are protected by post-quantum KEMs against IPX eavesdropping (requires bilateral carrier adoption).".to_string(),
                compliance_clause: "3GPP TS 33.501 Annex H (Bilateral Design)".to_string(),
                remediation: "Compliant design. Coordinate bilateral deployment with roaming partner PLMNs.".to_string(),
            });
        }
        "classical_ecdh" => {
            score -= 20;
            high_count += 1;
            assets.push(TelecomCryptoAsset {
                network_function: "SEPP".to_string(),
                interface_name: "N32-f Roaming Interconnect".to_string(),
                primitive: "Key Agreement (Classical JWE)".to_string(),
                algorithm: "ECDH-ES (X25519/P-256)".to_string(),
                key_size: "256 bits".to_string(),
                crypto_type: "Classical".to_string(),
                quantum_safe: false,
                standard_ref: "3GPP TS 33.501 Annex H (Classical)".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::High,
                title: "Vulnerable Classical Roaming Interconnect (ECDH JWE)".to_string(),
                network_function: "SEPP".to_string(),
                description: "Inter-carrier roaming traffic traversing IPX providers can be recorded by adversaries and decrypted retroactively using quantum computers.".to_string(),
                compliance_clause: "TEC 910018:2025 Section 2.6 & Section 4.1.2".to_string(),
                remediation: "Deploy QuantaCipher SEPP PRINS Engine with Hybrid X-Wing KEM bilaterally.".to_string(),
            });
        }
        _ => {
            score -= 30;
            critical_count += 1;
            assets.push(TelecomCryptoAsset {
                network_function: "SEPP".to_string(),
                interface_name: "N32-f Roaming Interconnect".to_string(),
                primitive: "None".to_string(),
                algorithm: "Cleartext / Unprotected".to_string(),
                key_size: "0 bits".to_string(),
                crypto_type: "None".to_string(),
                quantum_safe: false,
                standard_ref: "Non-Compliant".to_string(),
            });
            findings.push(TelecomAuditFinding {
                severity: FindingSeverity::Critical,
                title: "Unprotected Roaming Interconnect (Cleartext N32-f)".to_string(),
                network_function: "SEPP".to_string(),
                description: "No JWE application-layer protection enabled. IPX providers have full visibility into cross-network subscriber requests.".to_string(),
                compliance_clause: "3GPP TS 33.501 Section 5.9.3".to_string(),
                remediation: "Enable N32 PRINS JWE with QuantaCipher Post-Quantum SEPP.".to_string(),
            });
        }
    }

    // =========================================================================
    // 4. Audit Radio NAS & User Plane Ciphers (3GPP TS 33.501 §5.3)
    // =========================================================================
    if config.nas_cipher == "nea0" || config.up_cipher == "nea0" {
        score -= 25;
        critical_count += 1;
        findings.push(TelecomAuditFinding {
            severity: FindingSeverity::Critical,
            title: "Null Ciphering Enabled (NEA0 / EEA0)".to_string(),
            network_function: "gNodeB / AMF".to_string(),
            description: "Null encryption transmits user plane and/or NAS control signaling completely unencrypted over the air.".to_string(),
            compliance_clause: "3GPP TS 33.501 §5.3.1".to_string(),
            remediation: "Enforce NEA2 (AES-128) minimum, preferably NEA4 (AES-256) for quantum resilience.".to_string(),
        });
    } else if config.nas_cipher == "nea4_aes256" {
        assets.push(TelecomCryptoAsset {
            network_function: "AMF / gNodeB".to_string(),
            interface_name: "N1 NAS Signaling & N3 User Plane".to_string(),
            primitive: "Symmetric Cipher".to_string(),
            algorithm: "NEA4 (AES-256-GCM)".to_string(),
            key_size: "256 bits".to_string(),
            crypto_type: "Quantum-Resilient Symmetric".to_string(),
            quantum_safe: true,
            standard_ref: "3GPP TS 33.501 NEA4".to_string(),
        });
        findings.push(TelecomAuditFinding {
            severity: FindingSeverity::Pass,
            title: "Quantum-Safe 256-bit Symmetric Ciphering (NEA4)".to_string(),
            network_function: "AMF / gNodeB".to_string(),
            description: "256-bit symmetric cipher keys provide 128-bit post-quantum security against Grover's algorithm.".to_string(),
            compliance_clause: "TEC 910028:2025 Section 5.2 & Section 6.2".to_string(),
            remediation: "Compliant.".to_string(),
        });
    } else {
        score -= 10;
        assets.push(TelecomCryptoAsset {
            network_function: "AMF / gNodeB".to_string(),
            interface_name: "N1 NAS Signaling".to_string(),
            primitive: "Symmetric Cipher".to_string(),
            algorithm: "NEA2 (AES-128-CTR)".to_string(),
            key_size: "128 bits".to_string(),
            crypto_type: "Classical Symmetric".to_string(),
            quantum_safe: false,
            standard_ref: "3GPP TS 33.501 NEA2".to_string(),
        });
        findings.push(TelecomAuditFinding {
            severity: FindingSeverity::Medium,
            title: "128-bit Symmetric Cipher Strength Degradation".to_string(),
            network_function: "AMF / gNodeB".to_string(),
            description: "Grover's algorithm halves effective symmetric key security to 64 bits. 3GPP Rel-18 and TEC recommend 256-bit ciphers.".to_string(),
            compliance_clause: "TEC 910018:2025 Section 4.1.2".to_string(),
            remediation: "Enable 256-bit ciphering algorithms (NEA4 / EEA4).".to_string(),
        });
    }

    let final_score = score.max(0).min(100) as u32;
    let (risk_level, mtcte_certified) = if critical_count > 0 || final_score < 60 {
        ("Critical Quantum Risk", false)
    } else if high_count > 0 || final_score < 80 {
        ("Elevated Quantum Risk", false)
    } else if final_score < 95 {
        ("Low Quantum Risk", true)
    } else {
        ("Quantum-Resilient", true)
    };

    // Construct CycloneDX 1.6 Telecom-CBOM
    let cbom_components: Vec<serde_json::Value> = assets
        .iter()
        .map(|a| {
            serde_json::json!({
                "type": "cryptographic-asset",
                "name": format!("{}: {}", a.network_function, a.algorithm),
                "version": "1.0",
                "cryptoProperties": {
                    "assetType": "algorithm",
                    "algorithmProperties": {
                        "primitive": a.primitive,
                        "parameterSetIdentifier": a.key_size,
                        "classicalSecurityLevel": if a.quantum_safe { 256 } else { 128 },
                        "nistQuantumSecurityLevel": if a.quantum_safe { 3 } else { 0 },
                    },
                    "oid": a.standard_ref,
                }
            })
        })
        .collect();

    let cyclonedx_cbom = serde_json::json!({
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "serialNumber": "urn:uuid:5g-telecom-cbom-quantacipher",
        "version": 1,
        "metadata": {
            "timestamp": "2026-11-17T00:00:00Z",
            "tools": {
                "components": [{
                    "type": "application",
                    "name": "QuantaCipher 5G Telecom-CBOM Analyzer",
                    "version": "2.1.0",
                    "vendor": "Quantalabs Private Limited"
                }]
            },
            "manufacture": {
                "name": "Telecommunications Standards Readiness Engine (TEC 910018 / TEC 910028)"
            }
        },
        "components": cbom_components
    });

    TelecomAuditReport {
        overall_score: final_score,
        quantum_risk_level: risk_level.to_string(),
        mtcte_certified,
        critical_count,
        high_count,
        evaluated_nfs: vec![
            "UDM / SIDF".to_string(),
            "NRF (OAuth2)".to_string(),
            "SEPP (N32-f)".to_string(),
            "AMF".to_string(),
            "gNodeB".to_string(),
        ],
        assets,
        findings,
        cyclonedx_cbom_json: serde_json::to_string_pretty(&cyclonedx_cbom).unwrap_or_default(),
    }
}
