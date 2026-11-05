# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-11-05

### Added
- Unified KEM algorithm registry with `KemAlgorithm` supporting `ml-kem-768` (NIST Level 3) and `ml-kem-1024` (NIST Level 5).
- Support for FIPS 204 signatures: `ml-dsa-65` (NIST Level 3) and `ml-dsa-87` (NIST Level 5).
- Versioned envelope formats: `QZ_VAULT_V2:{alg}:...` and `QZ_SECURE_V2:{alg}:...`.
- Envelope header authentication: envelope prefix bound as Additional Authenticated Data (`AAD`) in AES-256-GCM.
- Cryptographic binding of signature envelope metadata in V2 signature envelopes (`QC_SIG_V2:{alg}:`).
- NIST ACVP Known Answer Tests (KAT) for ML-KEM-768 and ML-KEM-1024.
- Full backward compatibility with legacy V1 payloads (`QZ_VAULT_V1:`, `QZ_SECURE_V1:`, `QZ_TRUE_PQC_KEM:`) and legacy V1 signatures.

## [2.0.0] - 2026-08-28

### Added
- Initial Open Source Release
- ML-KEM-1024 (FIPS 203) support
- ML-DSA-44 (FIPS 204) support
- FN-DSA (FIPS 206 draft) support
