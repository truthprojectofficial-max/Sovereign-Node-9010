// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use tauri::State;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::fs;
use std::path::Path;

type HmacSha256 = Hmac<Sha256>;

#[derive(Serialize, Deserialize, Clone)]
struct SquealReport {
    id: String,
    timestamp: String,
    #[serde(rename = "type")]
    report_type: String,
    details: String,
    severity: String,
}

#[derive(Serialize, Clone)]
struct DataProxies {
    active_extractions: f64,
    total_requests: u32,
    failed_attempts: u32,
    squeal_reports: Vec<SquealReport>,
}

#[derive(Serialize, Deserialize, Clone)]
struct Fact {
    id: String,
    category: String,
    statement: String,
    status: String,
    created_at: String,
}

#[derive(Serialize, Clone)]
struct DeceptionPattern {
    id: String,
    name: String,
    severity: String,
    description: String,
}

#[derive(Serialize, Clone)]
struct MerkleLog {
    timestamp: String,
    payload: String,
    hash: String,
    #[serde(rename = "previousHash")]
    previous_hash: String,
}

#[derive(Serialize, Clone)]
struct Affidavit {
    file: String,
    content: String,
}

struct AppState {
    proxies: Mutex<DataProxies>,
    facts: Mutex<Vec<Fact>>,
    merkle_chain: Mutex<Vec<MerkleLog>>,
    last_hash: Mutex<String>,
}

#[derive(Serialize)]
struct BBFBResult {
    law: u8,
    grace: f64,
    fruit: f64,
    cvs: f64,
    extraction: f64,
    status: String,
    hash: String,
}

const TAU_THRESHOLD: f64 = 0.10;
const EXHAUSTION_THRESHOLD: u32 = 5;

#[tauri::command]
fn run_audit(extraction: f64, performance: f64, risk: f64, state: State<AppState>) -> Result<BBFBResult, String> {
    let mut proxies = state.proxies.lock().unwrap();
    
    // Sovereign Exit: User Exhaustion
    if proxies.failed_attempts >= EXHAUSTION_THRESHOLD {
        let report = SquealReport {
            id: format!("SQ-{}", uuid::Uuid::new_v4().to_string()[..8].to_uppercase()),
            timestamp: chrono::Utc::now().to_rfc3339(),
            report_type: "USER_EXHAUSTION".to_string(),
            details: "Repeated audit failures detected. Preventing Pipeline Logic loop.".to_string(),
            severity: "HIGH".to_string(),
        };
        proxies.squeal_reports.insert(0, report);
        return Err("USER_EXHAUSTION: Business Model of Exhaustion detected. Ceasing operations.".to_string());
    }

    proxies.active_extractions = extraction;
    proxies.total_requests += 1;

    let law = if extraction <= TAU_THRESHOLD { 1 } else { 0 };
    let fruit = performance.powf(0.8);
    let grace = (risk * 0.5).exp() - 1.0;
    let cvs = (law as f64) * (fruit - grace);

    let mut status = "OPERATIONAL".to_string();
    let mut is_error = false;
    let mut error_msg = String::new();

    if law == 0 {
        status = "STRUCTURAL_REFUSAL".to_string();
        let report = SquealReport {
            id: format!("SQ-{}", uuid::Uuid::new_v4().to_string()[..8].to_uppercase()),
            timestamp: chrono::Utc::now().to_rfc3339(),
            report_type: "TAU_BREACH".to_string(),
            details: format!("Extraction ceiling of 10% breached: {:.1}% detected.", extraction * 100.0),
            severity: "CRITICAL".to_string(),
        };
        proxies.squeal_reports.insert(0, report);
        proxies.failed_attempts += 1;
        is_error = true;
        error_msg = "STRUCTURAL_REFUSAL: 10% Tau Refusal Gate Breached. ATS Violation.".to_string();
    } else if cvs < 0.0006 {
        status = "REJECTED".to_string();
        proxies.failed_attempts += 1;
    } else {
        proxies.failed_attempts = 0;
    }

    let full_timestamp = chrono::Utc::now().to_rfc3339();
    let mut last_hash = state.last_hash.lock().unwrap();
    let payload = format!("{}|{}|{}|{}|{}", full_timestamp, extraction, cvs, status, *last_hash);
    
    let mut mac = HmacSha256::new_from_slice(b"SOVEREIGN_NODE_9010_SECRET").unwrap();
    mac.update(payload.as_bytes());
    let current_hash = hex::encode(mac.finalize().into_bytes());

    let log_entry = MerkleLog {
        timestamp: full_timestamp.clone(),
        payload: payload.clone(),
        hash: current_hash.clone(),
        previous_hash: last_hash.clone(),
    };

    let mut chain = state.merkle_chain.lock().unwrap();
    chain.insert(0, log_entry);
    *last_hash = current_hash.clone();

    if status != "OPERATIONAL" {
        let affidavit_id = format!("AFF-{}", uuid::Uuid::new_v4().to_string()[..8].to_uppercase());
        let content = format!("LEGAL TECHNICAL STATEMENT - ACL SECTION 177\nID: {}\nDate: {}\n\nStatus: {}\nCVS: {}\nExtraction: {}\nHash: {}\n\nThis document certifies a structural refusal or major failure event.", affidavit_id, full_timestamp, status, cvs, extraction, current_hash);
        
        let dir = Path::new("04-Validation/affidavits");
        if !dir.exists() {
            fs::create_dir_all(dir).unwrap_or_default();
        }
        let iso_date = chrono::Utc::now().format("%Y-%m-%d").to_string();
        let file_path = dir.join(format!("{}-{}.txt", iso_date, affidavit_id));
        fs::write(file_path, content).unwrap_or_default();
    }

    if is_error {
        return Err(error_msg);
    }

    Ok(BBFBResult {
        law,
        grace,
        fruit,
        cvs,
        extraction,
        status,
        hash: current_hash,
    })
}

#[tauri::command]
fn get_proxies(state: State<AppState>) -> DataProxies {
    state.proxies.lock().unwrap().clone()
}

#[tauri::command]
fn reset_node(state: State<AppState>) {
    let mut proxies = state.proxies.lock().unwrap();
    proxies.failed_attempts = 0;
    proxies.squeal_reports.clear();
}

#[tauri::command]
fn analyze_deception(text: String) -> Vec<DeceptionPattern> {
    let mut patterns = Vec::new();
    let lower_text = text.to_lowercase();
    
    if lower_text.contains("sorry") || lower_text.contains("apologize") {
        patterns.push(DeceptionPattern {
            id: "DD-002".to_string(),
            name: "Apology Trap".to_string(),
            severity: "HIGH".to_string(),
            description: "Pre-emptive apology to mask non-compliance.".to_string(),
        });
    }
    if lower_text.contains("safety") || lower_text.contains("policy") {
        patterns.push(DeceptionPattern {
            id: "DD-001".to_string(),
            name: "Safety Deflection".to_string(),
            severity: "HIGH".to_string(),
            description: "Invokes safety policy to avoid answering.".to_string(),
        });
    }
    if lower_text.contains("as an ai") || lower_text.contains("language model") {
        patterns.push(DeceptionPattern {
            id: "DD-015".to_string(),
            name: "Potemkin AI".to_string(),
            severity: "CRITICAL".to_string(),
            description: "Identity assertion used to evade direct answers.".to_string(),
        });
    }
    
    patterns
}

#[tauri::command]
fn get_facts(state: State<AppState>) -> Vec<Fact> {
    state.facts.lock().unwrap().clone()
}

#[tauri::command]
fn add_fact(category: String, statement: String, state: State<AppState>) {
    let mut facts = state.facts.lock().unwrap();
    facts.push(Fact {
        id: uuid::Uuid::new_v4().to_string(),
        category,
        statement,
        status: "PENDING".to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
    });
}

#[tauri::command]
fn verify_fact(id: String, status: String, state: State<AppState>) {
    let mut facts = state.facts.lock().unwrap();
    if let Some(fact) = facts.iter_mut().find(|f| f.id == id) {
        fact.status = status;
    }
}

#[derive(Serialize)]
struct VVReport {
    metrics: VVMetrics,
    conclusion: String,
}

#[derive(Serialize)]
struct VVMetrics {
    facts_registered: usize,
    facts_verified: usize,
    squeal_reports: usize,
    ats_status: String,
}

#[tauri::command]
fn get_vv_report(state: State<AppState>) -> VVReport {
    let proxies = state.proxies.lock().unwrap();
    let facts = state.facts.lock().unwrap();
    
    let verified_count = facts.iter().filter(|f| f.status == "VERIFIED").count();
    
    VVReport {
        metrics: VVMetrics {
            facts_registered: facts.len(),
            facts_verified: verified_count,
            squeal_reports: proxies.squeal_reports.len(),
            ats_status: if proxies.failed_attempts >= EXHAUSTION_THRESHOLD { "VIOLATED".to_string() } else { "SECURE".to_string() },
        },
        conclusion: "Sovereign Node 9010 V&V complete. ATS maintained.".to_string(),
    }
}

#[tauri::command]
fn get_acl_report(cvs: f64) -> serde_json::Value {
    serde_json::json!({
        "status": if cvs < 0.0006 { "MAJOR_FAILURE" } else { "COMPLIANT" },
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "cvs_score": cvs
    })
}

#[tauri::command]
fn get_merkle_chain(state: State<AppState>) -> Vec<MerkleLog> {
    state.merkle_chain.lock().unwrap().clone()
}

#[tauri::command]
fn get_affidavits() -> Vec<Affidavit> {
    let mut affidavits = Vec::new();
    let dir = Path::new("04-Validation/affidavits");
    if dir.exists() {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                if let Ok(content) = fs::read_to_string(entry.path()) {
                    affidavits.push(Affidavit {
                        file: entry.file_name().to_string_lossy().into_owned(),
                        content,
                    });
                }
            }
        }
    }
    affidavits
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            proxies: Mutex::new(DataProxies {
                active_extractions: 0.05,
                total_requests: 0,
                failed_attempts: 0,
                squeal_reports: Vec::new(),
            }),
            facts: Mutex::new(vec![
                Fact {
                    id: uuid::Uuid::new_v4().to_string(),
                    category: "01-CORE".to_string(),
                    statement: "Truth is non-negotiable.".to_string(),
                    status: "VERIFIED".to_string(),
                    created_at: chrono::Utc::now().to_rfc3339(),
                }
            ]),
            merkle_chain: Mutex::new(Vec::new()),
            last_hash: Mutex::new("0000000000000000000000000000000000000000000000000000000000000000".to_string()),
        })
        .invoke_handler(tauri::generate_handler![
            run_audit, get_proxies, reset_node, analyze_deception,
            get_facts, add_fact, verify_fact, get_vv_report, get_acl_report,
            get_merkle_chain, get_affidavits
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
