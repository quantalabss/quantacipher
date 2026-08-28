use std::fmt;

#[derive(Debug)]
pub enum QuantaCipherError {
    // Encryption errors (existing)
    KeygenFailed,
    EncapsulationFailed,
    DecapsulationFailed,
    EncryptionFailed,
    DecryptionFailed,
    InvalidPublicKeyLength,
    InvalidPrivateKeyLength,
    InvalidCiphertextLength,
    InvalidPayloadFormat,
    DecodeError(base64::DecodeError),
    Utf8Error(std::string::FromUtf8Error),
    // Signing errors (new in v2.0)
    SigningFailed,
    VerificationFailed,
    /// Signature envelope JSON is malformed or missing required fields
    InvalidSignatureFormat,
    /// The `alg` field in the envelope is not a registered algorithm ID
    UnknownAlgorithm(String),
    /// The `alg` field is absent — fail-closed, never fall back to a default
    MissingAlgorithmId,
    /// Sign keygen failed for the given algorithm
    SignKeygenFailed,
    SerializationError(serde_json::Error),
}

impl fmt::Display for QuantaCipherError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::KeygenFailed         => write!(f, "ML-KEM keygen failed"),
            Self::EncapsulationFailed   => write!(f, "ML-KEM encapsulation failed"),
            Self::DecapsulationFailed   => write!(f, "ML-KEM decapsulation failed (wrong key?)"),
            Self::EncryptionFailed => write!(f, "AES-GCM encryption failed"),
            Self::DecryptionFailed => write!(f, "AES-GCM decryption failed (tampered data or wrong key?)"),
            Self::InvalidPublicKeyLength => write!(f, "Invalid public key length"),
            Self::InvalidPrivateKeyLength => write!(f, "Invalid private key length"),
            Self::InvalidCiphertextLength => write!(f, "Invalid ML-KEM ciphertext length"),
            Self::InvalidPayloadFormat => write!(f, "Invalid payload format"),
            Self::DecodeError(e) => write!(f, "Base64 decode error: {}", e),
            Self::Utf8Error(e) => write!(f, "UTF-8 decode error: {}", e),
            // Signing errors
            Self::SigningFailed => write!(f, "Signing operation failed"),
            Self::VerificationFailed => write!(f, "Signature verification failed"),
            Self::InvalidSignatureFormat => write!(f, "Invalid signature envelope format"),
            Self::UnknownAlgorithm(alg) => write!(f, "Unknown algorithm ID in signature envelope: '{}'", alg),
            Self::MissingAlgorithmId => write!(f, "Signature envelope is missing the 'alg' field — rejecting to prevent algorithm confusion"),
            Self::SignKeygenFailed => write!(f, "Signing keypair generation failed"),
            Self::SerializationError(e) => write!(f, "Serialization error: {}", e),
        }
    }
}

impl std::error::Error for QuantaCipherError {}

impl From<base64::DecodeError> for QuantaCipherError {
    fn from(err: base64::DecodeError) -> Self {
        QuantaCipherError::DecodeError(err)
    }
}

impl From<std::string::FromUtf8Error> for QuantaCipherError {
    fn from(err: std::string::FromUtf8Error) -> Self {
        QuantaCipherError::Utf8Error(err)
    }
}

impl From<serde_json::Error> for QuantaCipherError {
    fn from(err: serde_json::Error) -> Self {
        QuantaCipherError::SerializationError(err)
    }
}
