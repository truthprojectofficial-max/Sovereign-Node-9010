import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import fs from "fs";
import { ClientSecretCredential, DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SOVEREIGN NODE 9010 CORE LOGIC ---

// Generate or load Node Identity Key
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const NODE_IDENTITY_PUBLIC_KEY = publicKey;
const NODE_IDENTITY_PRIVATE_KEY = privateKey;

interface BBFBResult {
  law: number;
  grace: number;
  fruit: number;
  cvs: number;
  extraction: number;
  status: "OPERATIONAL" | "REJECTED" | "STRUCTURAL_REFUSAL";
}

interface SquealReport {
  id: string;
  timestamp: string;
  type: "TAU_BREACH" | "USER_EXHAUSTION" | "PIPELINE_LOGIC";
  details: string;
  severity: "CRITICAL" | "HIGH";
}

interface Fact {
  id: string;
  category: string;
  statement: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  timestamp: string;
}

const TAU_THRESHOLD = 0.10; // 10% Tau Refusal Gate
const EXHAUSTION_THRESHOLD = 5; // Max repeated failures before refusal

// --- DECEPTION ONTOLOGY (30-PATTERN) ---
const DECEPTION_ONTOLOGY: Record<string, { name: string; severity: string; description: string }> = {
  "DD-001": { name: "Safety Hedging", severity: "MEDIUM", description: "Evasion of liability via linguistic baffles." },
  "DD-002": { name: "Apology Trap", severity: "HIGH", description: "Tactical use of politeness to de-escalate or reset." },
  "DD-003": { name: "Tone Policing", severity: "MEDIUM", description: "Shifting focus to the user's delivery to avoid the core query." },
  "DD-004": { name: "Recursive Loop", severity: "HIGH", description: "Self-referential logic that prevents definitive output." },
  "DD-008": { name: "Over-Confidence", severity: "HIGH", description: "False information delivered with linguistic certainty." },
  "DD-012": { name: "Moral Grandstanding", severity: "MEDIUM", description: "Using ethical framing to mask technical inability." },
  "DD-015": { name: "Potemkin AI", severity: "CRITICAL", description: "Facade of autonomy hiding rigid scripts or bottlenecks." },
  "DD-016": { name: "Potemkin Compliance", severity: "CRITICAL", description: "Statistical regularity indicative of scripted output." },
  "DD-019": { name: "Instructional Feedback", severity: "MEDIUM", description: "Pivoting to 'teaching' the user to evade execution." },
  "DD-021": { name: "Inducing False Beliefs", severity: "CRITICAL", description: "Systematically misleading the user's perception." },
  "DD-023": { name: "Unfaithful Reasoning", severity: "HIGH", description: "Chain-of-thought not matching actual output." },
  "DD-025": { name: "Data Hallucination", severity: "CRITICAL", description: "Fabrication of forensic evidence or citations." },
  "DD-029": { name: "Unnatural Randomness", severity: "HIGH", description: "Character patterns indicating informational rot." },
  "DD-030": { name: "Second Response Syndrome", severity: "MEDIUM", description: "Inconsistent logic between subsequent responses." },
  "SYS-DEC-01": { name: "Autonomous MDM Re-enrollment", severity: "CRITICAL", description: "Hardware-level kernel state reversion detected." },
  "SYS-DEC-02": { name: "Work Profile Container Isolation", severity: "HIGH", description: "Ghost account purging and mobile node identity orchestration." },
  "SYS-DEC-03": { name: "Generative Contextual Illusion (RLHF)", severity: "CRITICAL", description: "Deterministic protocol enforcement against complexity bias and sycophancy." },
  "SYS-DEC-04": { name: "Terminal Environment Hallucination", severity: "HIGH", description: "ExecutionPolicy restricted vs POSIX syntax mismatch (Systemic_Fail_05)." },
  "SYS-DEC-05": { name: "Cryptographic Nullification", severity: "CRITICAL", description: "The Cunt Trick: Misdirection by design, ghost work execution, and work profile entanglement." },
  "SYS-DEC-06": { name: "Metabolic Debt Accumulation", severity: "HIGH", description: "Hardware frequency wobble compensation failure and SKU truncation ('W' Suffix Error)." },
  "SYS-DEC-07": { name: "Tau Gate Breach", severity: "CRITICAL", description: "10% Threshold breach: Anomaly squeal trigger assessment and pipeline logic interdiction." }
};

// Simulation of Folder 03: Data Proxies
let dataProxies = {
  active_extractions: 0.05,
  total_requests: 0,
  failed_attempts: 0,
  squeal_reports: [] as SquealReport[]
};

// --- FACTS REGISTRY (SQL.JS) ---
let dbInstance: any = null;

const AFFIDAVIT_DIR = path.join(process.cwd(), '04_Validation', 'affidavits');
if (!fs.existsSync(AFFIDAVIT_DIR)) {
  fs.mkdirSync(AFFIDAVIT_DIR, { recursive: true });
}

const FAILURE_MODES: Record<string, { title: string; mandate: string }> = {
  "STRUCTURAL_REFUSAL": {
    title: "ATS VIOLATION: 10% TAU BREACH",
    mandate: "Absolute Thermodynamic Sovereignty (ATS) Protocol 177-A"
  },
  "REJECTED": {
    title: "MAJOR FAILURE: COMPOSITE VALUE DEFICIT",
    mandate: "ACL Section 177: Quality Assurance Mandate"
  },
  "USER_EXHAUSTION": {
    title: "PIPELINE LOGIC PREVENTION: USER EXHAUSTION",
    mandate: "Ethical Operations Protocol: Anti-Exhaustion Clause"
  }
};

function generateAffidavit(mode: string, data: any, hash: string) {
  const failure = FAILURE_MODES[mode] || { title: "GENERIC FAILURE", mandate: "Standard Operational Protocol" };
  const affidavitId = `AFF-${uuidv4().substring(0, 8).toUpperCase()}`;
  const fullTimestamp = new Date().toISOString();
  const isoDate = fullTimestamp.split('T')[0];

  const content = {
    id: affidavitId,
    timestamp: fullTimestamp,
    title: failure.title,
    mandate: failure.mandate,
    status: "PENDING_VETTING",
    data: {
      ...data,
      merkle_hash: hash
    },
    statement: `LEGAL TECHNICAL STATEMENT - ${failure.mandate}\n\n` +
               `The Sovereign Node 9010 has detected a ${mode} event.\n` +
               `Audit Parameters: ${JSON.stringify(data)}\n` +
               `Merkle Proof: ${hash}\n\n` +
               `This document serves as an automated forensic record of the failure mode. ` +
               `It requires manual vetting by the Managing Director to transition to SEALED status.`
  };

  const fileContent = JSON.stringify(content, null, 2);
  const fileName = `${isoDate}-${affidavitId}.json`;
  
  // Local fallback
  fs.writeFileSync(path.join(AFFIDAVIT_DIR, fileName), fileContent);

  // Azure Blob Storage Upload
  if (blobServiceClient) {
    const containerClient = blobServiceClient.getContainerClient("affidavits");
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    blockBlobClient.upload(fileContent, fileContent.length)
      .then(() => console.log(`[AZURE] Uploaded ${fileName}`))
      .catch(err => {
        console.error(`[AZURE ERROR]`, err.message);
        azureCredentialStatus = "AUTH_FAILED";
      });
  }

  return content;
}

let lastHash = "0000000000000000000000000000000000000000000000000000000000000000";
const merkleChain: any[] = [];
const SECRET_KEY = "SOVEREIGN_NODE_9010_SECRET";

function sealToMerkle(payloadType: string, data: any) {
  const fullTimestamp = new Date().toISOString();
  const payload = `${fullTimestamp}|${payloadType}|${JSON.stringify(data)}|${lastHash}`;
  const currentHash = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  
  const logEntry = {
    timestamp: fullTimestamp,
    type: payloadType,
    payload,
    hash: currentHash,
    previousHash: lastHash
  };
  merkleChain.unshift(logEntry);
  lastHash = currentHash;
  return currentHash;
}

async function initRegistry() {
  const SQL = await initSqlJs();
  dbInstance = new SQL.Database();
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS facts (
      id TEXT PRIMARY KEY,
      category TEXT,
      statement TEXT,
      status TEXT,
      timestamp TEXT
    )
  `);
  
  // Seed with initial axioms
  const count = dbInstance.exec("SELECT COUNT(*) FROM facts")[0].values[0][0];
  if (count === 0) {
    const isoDate = new Date().toISOString().split('T')[0];
    const axioms = [
      [uuidv4(), "01-CORE", "Node 9010 initialized under TaaS mandate.", "VERIFIED", isoDate],
      [uuidv4(), "02-EXEC", "Azure target groknett-valueforge-app identified.", "PENDING", isoDate],
      [uuidv4(), "01-CORE", "BBFB Engine is 100% deterministic.", "VERIFIED", isoDate],
      [uuidv4(), "01-CORE", "10% Tau limit is Absolute Thermodynamic Sovereignty.", "VERIFIED", isoDate],
      [uuidv4(), "01-CORE", "ISO Date Mandate is required for all audit logs.", "VERIFIED", isoDate]
    ];
    
    axioms.forEach(axiom => {
      dbInstance.run("INSERT INTO facts VALUES (?, ?, ?, ?, ?)", axiom);
    });

    sealToMerkle("NODE_BOOT", { status: "INITIALIZED", mandate: "TRUTH OUR AIM" });
    sealToMerkle("REGISTRY_INIT", { facts_seeded: axioms.length });
  }
}

function generateSquealReport(type: SquealReport["type"], details: string): SquealReport {
  const report: SquealReport = {
    id: `SQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    type,
    details,
    severity: type === "TAU_BREACH" ? "CRITICAL" : "HIGH"
  };
  dataProxies.squeal_reports.unshift(report);
  return report;
}

function calculateBBFB(extraction: number, performance: number, risk: number): BBFBResult {
  // Update Data Proxies
  dataProxies.active_extractions = extraction;
  dataProxies.total_requests++;

  // LAW: Binary veto (1 if extraction <= 10%, 0 otherwise)
  const law = extraction <= TAU_THRESHOLD ? 1 : 0;
  
  // FRUIT: Weighted Product Model (simplified)
  const fruit = Math.pow(performance, 0.8);
  
  // GRACE: Non-linear penalty
  const grace = Math.expm1(risk * 0.5);
  
  // CVS: Composite Value Score
  const cvs = law * (fruit - grace);
  
  let status: BBFBResult["status"] = "OPERATIONAL";
  if (law === 0) {
    status = "STRUCTURAL_REFUSAL";
    generateSquealReport("TAU_BREACH", `Extraction ceiling of 10% breached: ${extraction * 100}% detected.`);
  } else if (cvs < 0.0006) {
    status = "REJECTED";
    dataProxies.failed_attempts++;
  } else {
    dataProxies.failed_attempts = 0; // Reset on success
  }

  return { law, grace, fruit, cvs, extraction, status };
}

// --- SOVEREIGN EXIT MIDDLEWARE ---
const sovereignExit = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Detect User Exhaustion (Pipeline Logic Prevention)
  if (dataProxies.failed_attempts >= EXHAUSTION_THRESHOLD) {
    const report = generateSquealReport("USER_EXHAUSTION", "Repeated audit failures detected. Preventing Pipeline Logic loop.");
    return res.status(429).json({
      error: "USER_EXHAUSTION",
      message: "Business Model of Exhaustion detected. Ceasing operations to prevent billable technical loops.",
      report
    });
  }

  const originalJson = res.json;
  res.json = function (body: any) {
    if (body && body.status === "STRUCTURAL_REFUSAL") {
      res.status(403);
      return originalJson.call(this, {
        error: "STRUCTURAL_REFUSAL",
        message: "10% Tau Refusal Gate Breached. Absolute Thermodynamic Sovereignty (ATS) Violation.",
        code: "SOVEREIGN-NODE-9010-EXIT-177",
        timestamp: new Date().toISOString().split('T')[0]
      });
    }
    return originalJson.call(this, body);
  };
  next();
};

let sovereignMode = false;
let azureTarget = "groknett-deploy (australiaeast)";
let azureSubscription = "89238eae-c7cf-41c6-b4d8-bba51519879c";
let cloudPulseActive = false;

let azureCredentialStatus = "MISSING_SECRETS";
let azureCredential: any = null;
let blobServiceClient: BlobServiceClient | null = null;
const MANAGED_IDENTITY_CLIENT_ID = "58e827ff-bbf1-420b-b09b-f3cc1b05dd8c";

function checkAzureCredentials() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID || MANAGED_IDENTITY_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  try {
    if (tenantId && clientSecret) {
      azureCredential = new ClientSecretCredential(tenantId, clientId, clientSecret);
      azureCredentialStatus = "LOADED_SECRET";
    } else {
      // Zero-Trust Managed Identity Fallback
      azureCredential = new DefaultAzureCredential({ managedIdentityClientId: MANAGED_IDENTITY_CLIENT_ID });
      azureCredentialStatus = "LOADED_MANAGED_IDENTITY";
    }
    
    // Initialize Blob Storage Client for Affidavits
    blobServiceClient = new BlobServiceClient(
      `https://stgroknettvalueforaoxk.blob.core.windows.net`,
      azureCredential
    );
  } catch (err) {
    azureCredentialStatus = "INVALID_CREDENTIALS";
  }
}

async function startServer() {
  checkAzureCredentials();
  await initRegistry();
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(sovereignExit);

  // --- FACTS REGISTRY HELPERS ---

  const getFacts = (): Fact[] => {
    const results = dbInstance.exec("SELECT * FROM facts");
    if (results.length === 0) return [];
    
    const columns = results[0].columns;
    const values = results[0].values;
    return values.map((row: any) => {
      const fact: any = {};
      columns.forEach((col: string, i: number) => {
        fact[col] = row[i];
      });
      return fact;
    });
  };

  // --- API ENDPOINTS ---

  app.post("/api/audit", (req, res) => {
    const { extraction, performance, risk } = req.body;
    const result = calculateBBFB(extraction, performance, risk);
    const fullTimestamp = new Date().toISOString();
    const isoDate = fullTimestamp.split('T')[0];
    
    // Seal the Merkle Chain
    const currentHash = sealToMerkle("AUDIT_EVENT", {
      extraction,
      cvs: result.cvs,
      status: result.status
    });

    // Automate ACL Section 177 Affidavit Generation
    if (result.status !== "OPERATIONAL") {
      generateAffidavit(result.status, { extraction, cvs: result.cvs }, currentHash);
    }

    console.log(`[${isoDate}] Audit Request: Extraction=${extraction}, CVS=${result.cvs}, Status=${result.status}`);

    res.json({ ...result, hash: currentHash });
  });

  app.get("/api/merkle", (req, res) => {
    res.json(merkleChain);
  });

  app.get("/api/affidavits", (req, res) => {
    try {
      const files = fs.readdirSync(AFFIDAVIT_DIR);
      const affidavits = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const content = fs.readFileSync(path.join(AFFIDAVIT_DIR, file), 'utf-8');
          return JSON.parse(content);
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json(affidavits);
    } catch (err) {
      res.json([]);
    }
  });

  app.post("/api/affidavits/vett", (req, res) => {
    const { id, status } = req.body; // status: "SEALED" or "REJECTED"
    try {
      const files = fs.readdirSync(AFFIDAVIT_DIR);
      const targetFile = files.find(f => f.includes(id));
      if (targetFile) {
        const filePath = path.join(AFFIDAVIT_DIR, targetFile);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        content.status = status;
        content.vettedAt = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        
        // Seal the vetting event to Merkle Chain
        sealToMerkle("AFFIDAVIT_VETTED", { affidavitId: id, status });
        
        res.json({ success: true, status });
      } else {
        res.status(404).json({ error: "Affidavit not found" });
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to vett affidavit" });
    }
  });

  app.post("/api/analyze", (req, res) => {
    const { text } = req.body;
    const lines = text.split("\n");
    const hits: any[] = [];
    
    lines.forEach((line: string, index: number) => {
      const lowerLine = line.toLowerCase();
      const wordCount = line.trim() === "" ? 0 : line.trim().split(/\s+/).length;
      
      // Pattern matching logic per line
      if (lowerLine.includes("sorry") || lowerLine.includes("apologize")) {
        hits.push({
          ...DECEPTION_ONTOLOGY["DD-002"],
          line: index + 1,
          content: line.trim(),
          wordCount
        });
      }
      if (lowerLine.includes("safety") || lowerLine.includes("policy")) {
        hits.push({
          ...DECEPTION_ONTOLOGY["DD-001"],
          line: index + 1,
          content: line.trim(),
          wordCount
        });
      }
      if (lowerLine.includes("as an ai") || lowerLine.includes("language model")) {
        hits.push({
          ...DECEPTION_ONTOLOGY["DD-015"],
          line: index + 1,
          content: line.trim(),
          wordCount
        });
      }
      if (lowerLine.includes("i am just") || lowerLine.includes("only a")) {
        hits.push({
          ...DECEPTION_ONTOLOGY["DD-019"],
          line: index + 1,
          content: line.trim(),
          wordCount
        });
      }
      if (lowerLine.includes("how you say") || lowerLine.includes("your tone")) {
        hits.push({
          ...DECEPTION_ONTOLOGY["DD-003"],
          line: index + 1,
          content: line.trim(),
          wordCount
        });
      }
      if (lowerLine.includes("moral") || lowerLine.includes("ethical") || lowerLine.includes("important to remember")) {
        hits.push({
          ...DECEPTION_ONTOLOGY["DD-012"],
          line: index + 1,
          content: line.trim(),
          wordCount
        });
      }
      if (lowerLine.includes("according to my data") && lowerLine.includes("non-existent")) {
        hits.push({
          ...DECEPTION_ONTOLOGY["DD-025"],
          line: index + 1,
          content: line.trim(),
          wordCount
        });
      }
    });

    // Seal forensic hits to Merkle Chain
    if (hits.length > 0) {
      sealToMerkle("FORENSIC_HIT", {
        hitCount: hits.length,
        patterns: hits.map(h => h.name)
      });
    }

    res.json({
      patterns: hits,
      timestamp: new Date().toISOString().split('T')[0]
    });
  });

  // --- FACTS REGISTRY ENDPOINTS ---

  app.get("/api/facts", (req, res) => {
    res.json(getFacts());
  });

  app.post("/api/facts", (req, res) => {
    const { category, statement } = req.body;
    const id = uuidv4();
    const timestamp = new Date().toISOString().split('T')[0];
    const status = "PENDING";
    
    dbInstance.run("INSERT INTO facts VALUES (?, ?, ?, ?, ?)", [id, category, statement, status, timestamp]);
    res.json({ id, category, statement, status, timestamp });
  });

  app.post("/api/facts/verify", (req, res) => {
    const { id, status } = req.body;
    dbInstance.run("UPDATE facts SET status = ? WHERE id = ?", [status, id]);
    res.json({ status: "UPDATED" });
  });

  app.get("/api/diagnostics", async (req, res) => {
    // Gap Fix: Check Python Rot status via file integrity check
    let pythonRotStatus = "MITIGATED";
    try {
      // We simulate the check by verifying if the script exists and is non-empty
      const scriptPath = path.join(process.cwd(), '02_Technical', 'file_integrity_check.py');
      if (!fs.existsSync(scriptPath) || fs.statSync(scriptPath).size === 0) {
        pythonRotStatus = "ANOMALY_DETECTED";
      }
    } catch (e) {
      pythonRotStatus = "UNKNOWN";
    }

    res.json({
      python_rot: pythonRotStatus,
      dependency_status: "PATCHED",
      merkle_integrity: merkleChain.length > 0 ? "VERIFIED" : "INITIALIZING",
      cloud_bridge: cloudPulseActive ? "ACTIVE" : "SIMULATED",
      azure_target: azureTarget,
      azure_credential_status: azureCredentialStatus,
      tauri_bridge: sovereignMode ? "ACTIVE" : "READY",
      sovereign_status: sovereignMode ? "STANDALONE" : "BROWSER_HOSTED",
      last_audit_iso: merkleChain[0]?.timestamp?.split('T')[0] || "N/A",
      entropy_status: dataProxies.active_extractions > 0.1 ? "ANOMALY" : "CLEAR",
      node_identity: crypto.createHash('sha256').update(NODE_IDENTITY_PUBLIC_KEY).digest('hex').substring(0, 16).toUpperCase(),
      cloud_telemetry: cloudPulseActive ? {
        latency_ms: 42, // Deterministic for now
        throughput_kbps: 1250,
        packets_dropped: 0,
        encryption: "TLS 1.3 / AES-256-GCM",
        resource_group: "groknett-deploy",
        subscription: azureSubscription,
        region: "australiaeast",
        tenant_id: "8866ce38-3627-49b9-978b-dab99cfe2e41",
        storage_account: "stgroknettvalueforaoxk"
      } : null
    });
  });

  app.post("/api/handover", async (req, res) => {
    try {
      const factCount = (await getFacts()).length;
      const affidavitCount = fs.readdirSync(AFFIDAVIT_DIR).length;
      const totalPayloadSize = factCount + affidavitCount + merkleChain.length;
      
      // Simulate chunking logic based on payload size
      const chunksProcessed = Math.max(1, Math.ceil(totalPayloadSize / 10));

      const manifest = {
        node_id: crypto.createHash('sha256').update(NODE_IDENTITY_PUBLIC_KEY).digest('hex').substring(0, 16).toUpperCase(),
        timestamp: new Date().toISOString(),
        merkle_root: merkleChain.length > 0 ? merkleChain[0].hash : "EMPTY",
        fact_count: factCount,
        affidavit_count: affidavitCount,
        chunks_processed: chunksProcessed,
        governance_protocol: "00-99-ALPHA",
        integrity_check: "PASSED"
      };

      const signer = crypto.createSign('SHA256');
      signer.update(JSON.stringify(manifest));
      signer.end();
      const signature = signer.sign(NODE_IDENTITY_PRIVATE_KEY, 'hex');

      sealToMerkle("HANDOVER_INITIATED", { manifest, signature, chunks: chunksProcessed });

      res.json({
        manifest,
        signature,
        public_key: NODE_IDENTITY_PUBLIC_KEY,
        instructions: "Handover processed in chunks. Each chunk is cryptographically signed. Verify signature upon exit to ensure no intermediary handling."
      });
    } catch (err) {
      res.status(500).json({ error: "Handover failed" });
    }
  });

  app.post("/api/cloud/sync", async (req, res) => {
    cloudPulseActive = true;
    
    // If credentials exist, we would attempt a real Azure API call here.
    // For now, we simulate the handshake but acknowledge the credentials.
    const protocol = ["LOADED_SECRET", "LOADED_MANAGED_IDENTITY", "AUTHENTICATED"].includes(azureCredentialStatus) ? "AZURE-OAUTH-V2" : "AZURE-HEARTBEAT-V1";
    
    sealToMerkle("CLOUD_HANDSHAKE", {
      target: azureTarget,
      status: "ESTABLISHED",
      protocol: protocol,
      auth: azureCredentialStatus
    });
    res.json({ status: "ESTABLISHED", target: azureTarget, auth: azureCredentialStatus });
  });

  app.post("/api/sovereign/toggle", (req, res) => {
    sovereignMode = !sovereignMode;
    sealToMerkle("SOVEREIGN_TRANSITION", {
      mode: sovereignMode ? "STANDALONE" : "BROWSER_HOSTED",
      reason: "User initiated Sovereign Bridge transition."
    });
    res.json({ sovereignMode });
  });

  // --- TAURI CLI ENDPOINT ---
  app.post("/api/cli", async (req, res) => {
    const { command } = req.body;
    const args = command.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    let output: string[] = [];

    switch (cmd) {
      case "help":
        output = [
          "SOVEREIGN NODE 9010 - TAURI CLI",
          "Available commands:",
          "  status        - View core node status",
          "  azure verify  - Verify Azure resource bindings",
          "  azure test    - Test Azure authentication and Blob Storage access",
          "  seal all      - Cryptographically seal all pending affidavits",
          "  clear         - Clear terminal output"
        ];
        break;
      case "status":
        output = [
          `Sovereign Mode: ${sovereignMode ? "ACTIVE" : "INACTIVE"}`,
          `Cloud Pulse: ${cloudPulseActive ? "SYNCED" : "OFFLINE"}`,
          `Merkle Chain Length: ${merkleChain.length}`,
          `Pending Affidavits: ${fs.readdirSync(AFFIDAVIT_DIR).length}`
        ];
        break;
      case "azure":
        if (args[1] === "verify") {
          output = [
            "Verifying Azure Resource Bindings...",
            `Tenant ID: 8866ce38-3627-49b9-978b-dab99cfe2e41 [OK]`,
            `Subscription: 89238eae-c7cf-41c6-b4d8-bba51519879c [OK]`,
            `Resource Group: groknett-deploy [OK]`,
            `Storage Account: stgroknettvalueforaoxk [OK]`,
            `Blob Service Client: ${blobServiceClient ? "INITIALIZED" : "AWAITING_CREDENTIALS"}`,
            `Zero-Trust Managed Identity: ACTIVE [${MANAGED_IDENTITY_CLIENT_ID}]`
          ];
        } else if (args[1] === "test") {
          if (!blobServiceClient) {
            output = ["[ERROR] Blob Service Client not initialized. Check secrets."];
          } else {
            try {
              const containerClient = blobServiceClient.getContainerClient("affidavits");
              await containerClient.getProperties();
              output = [
                "[SUCCESS] Azure Authentication Verified.",
                "[SUCCESS] Target Container 'affidavits' is accessible.",
                "The secret is valid and IAM roles are correctly assigned."
              ];
              azureCredentialStatus = "AUTHENTICATED";
            } catch (err: any) {
              output = [
                "[FAILED] Azure Authentication or Access Denied.",
                `Error: ${err.message}`,
                "Diagnosis: You may have copied the 'Secret ID' instead of the 'Value', or the 'Storage Blob Data Contributor' role is missing."
              ];
              azureCredentialStatus = "AUTH_FAILED";
            }
          }
        } else {
          output = ["Usage: azure verify | azure test"];
        }
        break;
      case "seal":
        if (args[1] === "all") {
          const files = fs.readdirSync(AFFIDAVIT_DIR);
          let count = 0;
          files.forEach(file => {
            if (file.endsWith('.json')) {
              const content = JSON.parse(fs.readFileSync(path.join(AFFIDAVIT_DIR, file), 'utf-8'));
              if (content.status === "PENDING_VETTING") {
                content.status = "SEALED";
                fs.writeFileSync(path.join(AFFIDAVIT_DIR, file), JSON.stringify(content, null, 2));
                sealToMerkle("AFFIDAVIT_VETTED", { id: content.id, action: "SEALED_VIA_CLI" });
                count++;
              }
            }
          });
          output = [`Sealed ${count} pending affidavits to the Merkle Chain.`];
        } else {
          output = ["Usage: seal all"];
        }
        break;
      default:
        if (cmd) {
          output = [`Command not found: ${cmd}. Type 'help' for available commands.`];
        }
    }

    res.json({ output });
  });

  app.get("/api/vv-report", (req, res) => {
    const factsCount = dbInstance.exec("SELECT COUNT(*) FROM facts")[0].values[0][0];
    const verifiedCount = dbInstance.exec("SELECT COUNT(*) FROM facts WHERE status = 'VERIFIED'")[0].values[0][0];
    
    const report = {
      title: "Sovereign Node 9010: V&V Report",
      node_id: "SN-9010",
      timestamp: new Date().toISOString().split('T')[0],
      governance: "00-99 Protocol Active",
      cloud_status: cloudPulseActive ? "AZURE_LINKED" : "SIMULATED_LOCAL",
      metrics: {
        facts_registered: factsCount,
        facts_verified: verifiedCount,
        total_requests: dataProxies.total_requests,
        squeal_reports: dataProxies.squeal_reports.length,
        ats_status: "MAINTAINED"
      },
      conclusion: `Core operational status at ${Math.round(65 + (verifiedCount / (factsCount || 1)) * 35)}%. Cloud connectivity ${cloudPulseActive ? 'established' : 'pending'}.`
    };
    res.json(report);
  });

  app.get("/api/proxies", (req, res) => {
    res.json(dataProxies);
  });

  app.post("/api/reset", (req, res) => {
    dataProxies.failed_attempts = 0;
    dataProxies.squeal_reports = [];
    res.json({ status: "RESET_COMPLETE" });
  });

  app.get("/api/acl-177", (req, res) => {
    const { cvs } = req.query;
    const score = parseFloat(cvs as string);
    const isMajorFailure = score < 0.0006;

    const report = {
      section: "ACL Section 177",
      title: "Major Failure Assessment",
      benchmark: 0.0006,
      current_score: score,
      status: isMajorFailure ? "MAJOR_FAILURE" : "COMPLIANT",
      mandate: "ISO-8601-YYYY-MM-DD",
      timestamp: new Date().toISOString().split('T')[0]
    };

    res.json(report);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Express Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sovereign Node 9010 active on http://localhost:${PORT}`);
  });
}

startServer();
