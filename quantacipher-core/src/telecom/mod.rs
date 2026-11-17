//! # 5G Telecom Security Engine (3GPP TS 33.501 & TEC 910028:2025)
//!
//! Copyright (c) 2026 QuantaLabs Private Limited. All rights reserved.
//!
//! Dual-Licensed under:
//! 1. Open Source Evaluation License (AGPLv3 / MIT for non-commercial research & testbeds).
//! 2. Commercial Enterprise & Carrier License for production 5G Core deployment,
//!    closed-source embedding in NEM equipment, and carrier SLAs.
//!
//! Commercial inquiries: contact@quantalabs.cc | https://quantalabs.cc

pub mod types;
pub mod pq_ies;
pub mod sba_token;
pub mod sepp_n32;
pub mod cbom_scanner;

#[cfg(test)]
mod tests;

pub use types::{ProtectionScheme, Suci, Supi, HnKeyPair};
pub use pq_ies::{
    conceal_profile_c, deconceal_profile_c,
    conceal_profile_d, deconceal_profile_d,
    generate_hn_keypair,
    ansi_x963_kdf,
};
pub use sba_token::{SbaTokenClaims, PqJwtHeader, issue_sba_token, verify_sba_token};
pub use sepp_n32::{N32fMessage, PqJweHeader, protect_n32f_payload, unprotect_n32f_payload};
pub use cbom_scanner::{
    TelecomAuditConfig, TelecomAuditReport, TelecomCryptoAsset, TelecomAuditFinding,
    FindingSeverity, audit_telecom_deployment,
};


