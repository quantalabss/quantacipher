use serde::{Deserialize, Serialize};
use crate::error::QuantaCipherError;

/// 3GPP 5G Protection Scheme Identifier per 3GPP TS 33.501 and TEC 910028:2025.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum ProtectionScheme {
    /// Null Scheme (no encryption, plain MSIN transmitted)
    Null = 0,
    /// Profile A: Classical Curve25519 + AES-128-CTR + HMAC-SHA256
    ProfileA = 1,
    /// Profile B: Classical secp256r1 + AES-128-CTR + HMAC-SHA256
    ProfileB = 2,
    /// Profile C: TEC 910028:2025 Homogeneous Post-Quantum ML-KEM + AES-256-CTR + HMAC-SHA256
    ProfileC = 3,
    /// Profile D: TEC 910028:2025 Hybrid Post-Quantum ML-KEM + X25519 + AES-256-CTR + HMAC-SHA256
    ProfileD = 4,
}

impl ProtectionScheme {
    pub fn from_u8(val: u8) -> Result<Self, QuantaCipherError> {
        match val {
            0 => Ok(Self::Null),
            1 => Ok(Self::ProfileA),
            2 => Ok(Self::ProfileB),
            3 => Ok(Self::ProfileC),
            4 => Ok(Self::ProfileD),
            _ => Err(QuantaCipherError::InvalidPayloadFormat),
        }
    }

    pub fn to_u8(self) -> u8 {
        self as u8
    }

    pub fn is_post_quantum(&self) -> bool {
        matches!(self, Self::ProfileC | Self::ProfileD)
    }
}

/// 5G Subscription Permanent Identifier (SUPI) - e.g., IMSI
/// Structure: MCC (3 digits) + MNC (2-3 digits) + MSIN (9-10 digits)
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Supi {
    /// Mobile Country Code (e.g., "404" for India)
    pub mcc: String,
    /// Mobile Network Code (e.g., "45" for Airtel, "86" for Jio, "01" for BSNL)
    pub mnc: String,
    /// Mobile Subscription Identification Number (up to 10 decimal digits)
    pub msin: String,
}

impl Supi {
    pub fn new(mcc: impl Into<String>, mnc: impl Into<String>, msin: impl Into<String>) -> Self {
        Self {
            mcc: mcc.into(),
            mnc: mnc.into(),
            msin: msin.into(),
        }
    }

    /// Parses a standard 15-digit IMSI string into SUPI components
    pub fn from_imsi(imsi: &str) -> Result<Self, QuantaCipherError> {
        if imsi.len() < 14 || imsi.len() > 15 {
            return Err(QuantaCipherError::DecryptionFailed);
        }
        let mcc = &imsi[0..3];
        // Standard MNC is 2 or 3 digits; for 15-digit IMSI default to 2 digits MNC
        let (mnc, msin) = if imsi.len() == 15 {
            (&imsi[3..5], &imsi[5..])
        } else {
            (&imsi[3..5], &imsi[5..])
        };

        Ok(Self {
            mcc: mcc.to_string(),
            mnc: mnc.to_string(),
            msin: msin.to_string(),
        })
    }

    /// Formats as standard IMSI
    pub fn to_imsi(&self) -> String {
        format!("{}{}{}", self.mcc, self.mnc, self.msin)
    }
}

/// 5G Subscription Concealed Identifier (SUCI) per 3GPP TS 23.003 & TEC 910028:2025.
/// Transmitted over the air interface from UE to AMF to protect user privacy against IMSI catchers.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Suci {
    /// SUPI Type (0 = IMSI)
    pub supi_type: u8,
    /// Mobile Country Code
    pub mcc: String,
    /// Mobile Network Code
    pub mnc: String,
    /// Routing Indicator (typically 4 decimal digits, e.g., "0000")
    pub routing_indicator: String,
    /// Protection Scheme (Profile C = Homogeneous PQC, Profile D = Hybrid PQC)
    pub protection_scheme: ProtectionScheme,
    /// Home Network Public Key Identifier (0-255)
    pub hn_public_key_id: u8,
    /// Raw Scheme Output: [Ephemeral Key / Ciphertext || Ciphertext2 (Encrypted MSIN) || MAC]
    pub scheme_output: Vec<u8>,
}

impl Suci {
    /// Formats SUCI into the standard 3GPP TS 23.003 representation:
    /// `suci-0-MCC-MNC-RoutingIndicator-ProtectionScheme-KeyId-HexSchemeOutput`
    pub fn to_nai_string(&self) -> String {
        format!(
            "suci-{}-{}-{}-{}-{}-{}-{}",
            self.supi_type,
            self.mcc,
            self.mnc,
            self.routing_indicator,
            self.protection_scheme.to_u8(),
            self.hn_public_key_id,
            hex::encode(&self.scheme_output)
        )
    }

    /// Parses a standard 3GPP TS 23.003 formatted SUCI string (accepts '-' or ':' separators,
    /// with or without the optional '@nai.5gc...' realm suffix).
    pub fn from_nai_string(s: &str) -> Result<Self, QuantaCipherError> {
        let clean = s.split('@').next().unwrap_or(s);
        let parts: Vec<&str> = if clean.contains('-') {
            clean.split('-').collect()
        } else {
            clean.split(':').collect()
        };
        if parts.len() != 8 || parts[0] != "suci" {
            return Err(QuantaCipherError::InvalidSignatureFormat);
        }

        let supi_type: u8 = parts[1].parse().map_err(|_| QuantaCipherError::InvalidSignatureFormat)?;
        let mcc = parts[2].to_string();
        let mnc = parts[3].to_string();
        let routing_indicator = parts[4].to_string();
        let scheme_id: u8 = parts[5].parse().map_err(|_| QuantaCipherError::InvalidSignatureFormat)?;
        let hn_public_key_id: u8 = parts[6].parse().map_err(|_| QuantaCipherError::InvalidSignatureFormat)?;
        let scheme_output = hex::decode(parts[7]).map_err(|_| QuantaCipherError::InvalidSignatureFormat)?;

        Ok(Self {
            supi_type,
            mcc,
            mnc,
            routing_indicator,
            protection_scheme: ProtectionScheme::from_u8(scheme_id)?,
            hn_public_key_id,
            scheme_output,
        })
    }
}

/// 5G Home Network (UDM) keypair holding both Post-Quantum (ML-KEM-768) and Classical (X25519) keys.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HnKeyPair {
    pub mlkem_public_key: String,
    pub mlkem_private_key: String,
    pub x25519_public_key: String,
    pub x25519_private_key: String,
}

