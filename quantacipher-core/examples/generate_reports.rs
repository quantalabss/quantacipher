use std::fs;
use quantacipher_core::telecom::cbom_scanner::{audit_telecom_deployment, TelecomAuditConfig};

fn main() {
    println!("=== Running 5G Telecom-CBOM Analyzer on Open-Source 5G Cores ===");

    // 1. Open5GS v2.7.x Standard Config
    let open5gs_config = TelecomAuditConfig {
        suci_profile: "profile_a".to_string(),
        sba_token_alg: "rsa_2048".to_string(),
        sepp_roaming_kem: "classical_ecdh".to_string(),
        nas_cipher: "nea2_aes128".to_string(),
        up_cipher: "nea2_aes128".to_string(),
    };
    let open5gs_report = audit_telecom_deployment(&open5gs_config);
    println!("Open5GS v2.7.x Readiness Score: {}/100, Level: {}", open5gs_report.overall_score, open5gs_report.quantum_risk_level);

    // 2. free5GC v3.4.x Standard Config
    let free5gc_config = TelecomAuditConfig {
        suci_profile: "profile_a".to_string(),
        sba_token_alg: "rsa_2048".to_string(),
        sepp_roaming_kem: "classical_ecdh".to_string(),
        nas_cipher: "nea2_aes128".to_string(),
        up_cipher: "nea0".to_string(),
    };
    let free5gc_report = audit_telecom_deployment(&free5gc_config);
    println!("free5GC v3.4.x Readiness Score: {}/100, Level: {}", free5gc_report.overall_score, free5gc_report.quantum_risk_level);

    // Write reports
    let dirs = [
        "/home/azureuser/dev/quantacipher/reports",
        "/home/azureuser/dev/quantacipher-platform/quantacipher-web/public/reports",
    ];

    for d in &dirs {
        fs::create_dir_all(d).unwrap();
        fs::write(
            format!("{}/open5gs_cbom_report.json", d),
            serde_json::to_string_pretty(&open5gs_report).unwrap(),
        ).unwrap();
        fs::write(
            format!("{}/free5gc_cbom_report.json", d),
            serde_json::to_string_pretty(&free5gc_report).unwrap(),
        ).unwrap();
    }

    println!("Successfully exported open5gs_cbom_report.json and free5gc_cbom_report.json!");
}
