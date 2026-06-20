use pyo3::prelude::*;
use pyo3::exceptions::PyValueError;
use quantacipher_core::{
    generate_keypair as core_generate_keypair,
    vault_encrypt as core_vault_encrypt,
    secure_encrypt as core_secure_encrypt,
    secure_decrypt as core_secure_decrypt,
    get_version as core_get_version,
};

/// Generates a keypair and returns it as a dictionary
#[pyfunction]
fn generate_keypair() -> PyResult<PyObject> {
    let (public, private) = core_generate_keypair()
        .map_err(|e| PyValueError::new_err(format!("QuantaCipher Error: {}", e)))?;

    Python::with_gil(|py| {
        let dict = pyo3::types::PyDict::new(py);
        dict.set_item("publicKey", public)?;
        dict.set_item("privateKey", private)?;
        dict.set_item("algorithm", "Kyber-1024")?;
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

#[pymodule]
fn quantacipher(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(generate_keypair, m)?)?;
    m.add_function(wrap_pyfunction!(vault_encrypt, m)?)?;
    m.add_function(wrap_pyfunction!(secure_encrypt, m)?)?;
    m.add_function(wrap_pyfunction!(secure_decrypt, m)?)?;
    m.add_function(wrap_pyfunction!(get_version, m)?)?;
    Ok(())
}
