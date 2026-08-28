use pyo3::prelude::*;
use pyo3::exceptions::PyValueError;
use pyo3::types::{PyBytes, PyDict};
use quantacipher_core::{
    generate_keypair as core_generate_keypair,
    vault_encrypt as core_vault_encrypt,
    secure_encrypt as core_secure_encrypt,
    secure_decrypt as core_secure_decrypt,
    get_version as core_get_version,
    get_algorithm as core_get_algorithm,
    KEM_ALGORITHM_LABEL,
};
use quantacipher_core::sign::registry::{self, AlgorithmId};
use quantacipher_core::sign::types::SignatureEnvelope;
use base64::{engine::general_purpose, Engine as _};


/// Generates a keypair and returns it as a dictionary
#[pyfunction]
fn generate_keypair() -> PyResult<PyObject> {
    let (public, private) = core_generate_keypair()
        .map_err(|e| PyValueError::new_err(format!("QuantaCipher Error: {}", e)))?;

    Python::with_gil(|py| {
        let dict = pyo3::types::PyDict::new(py);
        dict.set_item("publicKey", public)?;
        dict.set_item("privateKey", private)?;
        dict.set_item("algorithm", KEM_ALGORITHM_LABEL)?;
        dict.set_item("version", "1.0")?;
        Ok(dict.into())
    })
}

/// Vault encrypt
#[pyfunction]
fn vault_encrypt(plaintext: &str) -> PyResult<String> {
    core_vault_encrypt(plaintext)
        .map_err(|e| PyValueError::new_err(format!("QuantaCipher Error: {}", e)))
}

/// Secure encrypt
#[pyfunction]
fn secure_encrypt(plaintext: &str, public_key_b64: &str) -> PyResult<String> {
    core_secure_encrypt(plaintext, public_key_b64)
        .map_err(|e| PyValueError::new_err(format!("QuantaCipher Error: {}", e)))
}

/// Secure decrypt
#[pyfunction]
fn secure_decrypt(ciphertext_payload: &str, private_key_b64: &str) -> PyResult<String> {
    core_secure_decrypt(ciphertext_payload, private_key_b64)
        .map_err(|e| PyValueError::new_err(format!("QuantaCipher Error: {}", e)))
}

#[pyfunction]
fn get_version() -> PyResult<String> {
    Ok(core_get_version())
}

/// Returns the algorithm label (e.g. "ML-KEM-1024") from the core constants.
/// Consistent with the WASM get_algorithm() export.
#[pyfunction]
fn get_algorithm() -> PyResult<&'static str> {
    Ok(core_get_algorithm())
}

#[pymodule]
fn _quantacipher_core(_py: Python, m: &PyModule) -> PyResult<()> {
    // Encryption functions (existing)
    m.add_function(wrap_pyfunction!(generate_keypair, m)?)?;
    m.add_function(wrap_pyfunction!(vault_encrypt, m)?)?;
    m.add_function(wrap_pyfunction!(secure_encrypt, m)?)?;
    m.add_function(wrap_pyfunction!(secure_decrypt, m)?)?;
    m.add_function(wrap_pyfunction!(get_version, m)?)?;
    m.add_function(wrap_pyfunction!(get_algorithm, m)?)?;
    // Signing functions (v2.0)
    m.add_function(wrap_pyfunction!(generate_signing_keypair, m)?)?;
    m.add_function(wrap_pyfunction!(sign_payload, m)?)?;
    m.add_function(wrap_pyfunction!(verify_signature, m)?)?;
    Ok(())
}

// ============================================================
// SIGN MODULE (v2.0) — crypto-agile signing
// ============================================================

/// Generate a signing keypair.
///
/// Args:
///     algorithm: Optional algorithm ID string.
///               "falcon-512-fips206-draft" (default) | "ml-dsa-44"
///
/// Returns:
///     dict with keys: public_key (str), private_key (str), algorithm (str)
#[pyfunction]
#[pyo3(signature = (algorithm=None))]
fn generate_signing_keypair(algorithm: Option<String>) -> PyResult<PyObject> {
    let alg_id = parse_alg_opt(algorithm)?;
    let kp = registry::generate_keypair(alg_id)
        .map_err(|e| PyValueError::new_err(format!("QuantaCipher Sign Error: {}", e)))?;

    Python::with_gil(|py| {
        let dict = PyDict::new(py);
        dict.set_item("public_key", kp.public_key)?;
        dict.set_item("private_key", kp.private_key)?;
        dict.set_item("algorithm", kp.algorithm)?;
        Ok(dict.into())
    })
}

/// Sign a payload.
///
/// Args:
///     payload (bytes): The raw bytes to sign.
///     private_key_b64 (str): Base64-encoded signing private key.
///     algorithm (str, optional): Algorithm ID. Defaults to "falcon-512-fips206-draft".
///
/// Returns:
///     dict with keys: alg (str), sig (str), ver (int)
#[pyfunction]
#[pyo3(signature = (payload, private_key_b64, algorithm=None))]
fn sign_payload<'py>(
    _py: Python<'py>,
    payload: &PyBytes,
    private_key_b64: &str,
    algorithm: Option<String>,
) -> PyResult<PyObject> {
    let alg_id = parse_alg_opt(algorithm)?;
    let envelope = registry::sign(payload.as_bytes(), private_key_b64, alg_id)
        .map_err(|e| PyValueError::new_err(format!("QuantaCipher Sign Error: {}", e)))?;

    Python::with_gil(|py| {
        let dict = PyDict::new(py);
        dict.set_item("alg", &envelope.alg)?;
        dict.set_item("sig", &envelope.sig)?;
        dict.set_item("ver", envelope.ver)?;
        Ok(dict.into())
    })
}

/// Verify a signature.
///
/// Args:
///     payload (bytes): The original raw bytes that were signed.
///     signature (dict): The envelope dict returned by sign_payload().
///                       Must contain keys: alg (str), sig (str), ver (int).
///     public_key_b64 (str): Base64-encoded signing public key.
///
/// Returns:
///     bool: True if signature is valid, False if not.
///
/// Raises:
///     ValueError: If the envelope alg field is missing, unknown, or malformed.
#[pyfunction]
fn verify_signature<'py>(
    _py: Python<'py>,
    payload: &PyBytes,
    signature: &PyDict,
    public_key_b64: &str,
) -> PyResult<bool> {
    let alg: String = signature.get_item("alg")?
        .ok_or_else(|| PyValueError::new_err("Signature dict missing 'alg' field"))?
        .extract()?;
    let sig: String = signature.get_item("sig")?
        .ok_or_else(|| PyValueError::new_err("Signature dict missing 'sig' field"))?
        .extract()?;
    let ver: u32 = signature.get_item("ver")?
        .ok_or_else(|| PyValueError::new_err("Signature dict missing 'ver' field"))?
        .extract()?;

    let envelope = SignatureEnvelope { alg, sig, ver };

    registry::verify(payload.as_bytes(), &envelope, public_key_b64)
        .map_err(|e| PyValueError::new_err(format!("QuantaCipher Verify Error: {}", e)))
}

// ============================================================
// Internal helpers
// ============================================================

fn parse_alg_opt(algorithm: Option<String>) -> PyResult<Option<AlgorithmId>> {
    match algorithm {
        None => Ok(None),
        Some(s) if s.is_empty() => Ok(None),
        Some(s) => AlgorithmId::from_str(&s)
            .map(Some)
            .map_err(|e| PyValueError::new_err(format!("QuantaCipher AlgorithmId Error: {}", e))),
    }
}
