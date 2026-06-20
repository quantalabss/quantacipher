use std::fmt;

#[derive(Debug)]
pub enum QuantaCipherError {
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
}

impl fmt::Display for QuantaCipherError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::KeygenFailed => write!(f, "Kyber keygen failed"),
            Self::EncapsulationFailed => write!(f, "Kyber encapsulation failed"),
            Self::DecapsulationFailed => write!(f, "Kyber decapsulation failed (wrong key?)"),
            Self::EncryptionFailed => write!(f, "AES-GCM encryption failed"),
            Self::DecryptionFailed => write!(f, "AES-GCM decryption failed (tampered data or wrong key?)"),
            Self::InvalidPublicKeyLength => write!(f, "Invalid public key length"),
            Self::InvalidPrivateKeyLength => write!(f, "Invalid private key length"),
            Self::InvalidCiphertextLength => write!(f, "Invalid Kyber ciphertext length"),
            Self::InvalidPayloadFormat => write!(f, "Invalid payload format"),
            Self::DecodeError(e) => write!(f, "Base64 decode error: {}", e),
            Self::Utf8Error(e) => write!(f, "UTF-8 decode error: {}", e),
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
