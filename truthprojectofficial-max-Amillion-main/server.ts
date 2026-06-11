import express from 'express';
import { createServer as createViteServer } from 'vite';
import initSqlJs from 'sql.js';
import path from 'path';
import crypto from 'crypto';

// --- CONSTANTS & THRESHOLDS ---
const NODE_ID = "SOVEREIGN_NODE_9010_ALPHA";
const AUDIT_SECRET = process.env.AUDIT_SECRET_KEY || "FATAL_MISSING_SECRET_KEY";
const ENTROPY_THRESHOLD = 4.5;
const CVS_BENCHMARK = 0.0006;
const BOM_SIGNATURE = '\uFEFF'; // EF BB BF

// --- MATHEMATICAL DIAGNOSTICS & CRYPTOGRAPHY ---

/** ShED-HD: Shannon Entropy Distribution Hallucination Detector */
function calculateShannonEntropy(text: string): number {
    if (!text || text.length === 0) return 0.0;
    const counts: Record<string, number> = {};
    for (const char of text) {
        counts[char] = (counts[char] || 0) + 1;
    }
    const len = text.length;
    let entropy = 0;
    for (const char in counts) {
        const p = counts[char] / len;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}

/** BBFB Engine: The "Jesus Code" */
function calculateCVS(extractionRate: number, fruit: number, grace: number, debt: number): number {
    // LAW Gate: Multiplicative binary veto
    const L = extractionRate <= 0.10 ? 1 : 0; 
    // Equation: CVS = L * (F - G - (D * 0.5))
    return L * (fruit - grace - (debt * 0.5));
}

/** Cryptographic Sealing */
function generateMerkleSeal(payload: string): string {
    return crypto.createHmac('sha256', AUDIT_SECRET).update(payload).digest('hex');
}

/** ACL Section 177 Compliance Mapping */
function generateAffidavit(cvsResult: number, factObj: any): { narrative: string, seal: string } {
    const isoDate = new Date().toISOString();
    const narrative = `ISO DATE: ${isoDate}\nNODE ID: ${NODE_ID}\nSUBJECT: Section 177 Technical Statement - Major Failure\nPursuant to ACL, this node has recorded a Major Failure on payload ingest.\nBBFB CVS SCORE: ${cvsResult} (REJECTED)\nLEGAL MAPPING: This failure maps to ACL Section 54/56.\nPAYLOAD FRAGMENT: ${JSON.stringify(factObj)}`;
    const seal = generateMerkleSeal(narrative);
    return { narrative, seal };
}

// --- CORE SERVER LOGIC ---
async function startServer() {
    const app = express();
    const PORT = 3000;
    app.use(express.json());

    // Initialize Ground Truth Store
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    
    // Scaffold initial ledger including verification tier and seal
    db.run(`
        CREATE TABLE IF NOT EXISTS facts_registry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fact TEXT NOT NULL,
            tier INTEGER NOT NULL,
            entropy REAL NOT NULL,
            cvs REAL NOT NULL,
            seal TEXT NOT NULL,
            timestamp TEXT NOT NULL
        );
    `);
    
    // Table for Section 177 Affidavits (Spoliation Alerts)
    db.run(`
        CREATE TABLE IF NOT EXISTS legal_affidavits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            narrative TEXT NOT NULL,
            seal TEXT NOT NULL,
            timestamp TEXT NOT NULL
        );
    `);

    // 10% Tau Refusal Gate Middleware
    const tauRefusalGate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const authHeader = req.headers['x-taas-auth'];
        if (!authHeader || authHeader !== process.env.TAAS_AUTH_TOKEN) {
            console.warn(`[Tau Refusal Gate] Incident logged: Unauthorized.`);
            res.status(403).json({ error: 'Tau Refusal Gate: Unauthorized access.' });
            return;
        }
        next();
    };

    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', message: `${NODE_ID} ACTIVE.` });
    });

    app.get('/api/facts', (req, res) => {
        const result = db.exec("SELECT * FROM facts_registry");
        if (result.length > 0) {
            const columns = result[0].columns;
            const values = result[0].values;
            const rows = values.map(val => {
                const row: any = {};
                columns.forEach((col, i) => {
                    row[col] = val[i];
                });
                return row;
            });
            res.json({ facts: rows });
        } else {
            res.json({ facts: [] });
        }
    });

    app.get('/api/affidavits', (req, res) => {
        const result = db.exec("SELECT * FROM legal_affidavits");
        if (result.length > 0) {
            const columns = result[0].columns;
            const values = result[0].values;
            const rows = values.map(val => {
                const row: any = {};
                columns.forEach((col, i) => {
                    row[col] = val[i];
                });
                return row;
            });
            res.json({ affidavits: rows });
        } else {
            res.json({ affidavits: [] });
        }
    });

    // Validates incoming assertions against Information Theory, BBFB, Ties, and Sabotage constraints
    app.post('/api/validate', tauRefusalGate, (req, res) => {
        const { fact, extractionRate, fruit, grace, debt, verificationTier } = req.body;

        if (typeof fact !== 'string') {
             res.status(400).json({ error: 'Payload schema violation.' });
             return;
        }

        // 0. Sabotage Detection: Byte Order Mark (EF BB BF) Filter
        if (fact.indexOf(BOM_SIGNATURE) !== -1) {
             console.error(`[Sabotage Detection] Signature EF BB BF (BOM) found in payload. Immediate structural refusal.`);
             res.status(406).json({ 
                 status: 'rejected', 
                 reason: 'Sabotage Detection: EF BB BF (Byte Order Mark) signature found. Potential adversarial payload.' 
             });
             return;
        }

        // Tier Assignment (Enforce 1, 2, or 3. Default to 3: Unverified)
        const tier = [1, 2, 3].includes(verificationTier) ? verificationTier : 3;

        // 1. Run ShED-HD (Entropy Calculation)
        const entropy = calculateShannonEntropy(fact);
        if (entropy > ENTROPY_THRESHOLD) {
            console.warn(`[ShED-HD] Anomaly Detected. Entropy [${entropy.toFixed(3)}] exceeds limit (4.5). Deception suspected.`);
        }

        // 2. Run BBFB Engine (Tau Logic)
        const extRate = extractionRate ?? 0; // Handled by 10% Tau Limit Axiom
        const f = fruit ?? 0;
        const g = grace ?? 0;
        const d = debt ?? 0;
        const cvs = calculateCVS(extRate, f, g, d);

        const timestamp = new Date().toISOString();

        // 3. Evaluate Output & Execute Merkle Logic
        if (cvs < CVS_BENCHMARK || entropy > ENTROPY_THRESHOLD || extRate > 0.10) {
            // MAJOR FAILURE: Automate ACL Section 177 Affidavit
            const affidavit = generateAffidavit(cvs, { fact, tier, entropy });
            
            db.run(
                `INSERT INTO legal_affidavits (narrative, seal, timestamp) VALUES (?, ?, ?)`,
                [affidavit.narrative, affidavit.seal, timestamp]
            );

            console.error(`[BBFB Engine] STRUCTURAL_REFUSAL. CVS: ${cvs}. Affidavit generated.`);
            res.status(406).json({ 
                status: 'rejected', 
                reason: 'BBFB Constraint Validation Failed. Major Failure.',
                affidavit_seal: affidavit.seal
            });
            return;
        }

        // SUCCESS: Cryptographically seal the truth and append to registry
        try {
            const payloadObject = JSON.stringify({ fact, tier, entropy, cvs, timestamp });
            const seal = generateMerkleSeal(payloadObject);

            db.run(
                `INSERT INTO facts_registry (fact, tier, entropy, cvs, seal, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
                [fact, tier, entropy, cvs, seal, timestamp]
            );
            
            console.log(`[Facts Registry] Anchored Tier ${tier} truth at ${timestamp} (Seal: ${seal.substring(0,8)}...)`);
            res.json({ status: 'validated', tier, seal, timestamp });
        } catch (error) {
            res.status(500).json({ error: 'Database error' });
        }
    });

    // Vite Middleware for Local HMI
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({ server: { middlewareMode: true, strictPort: true }, appType: 'spa' });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    }

    app.listen(PORT, '0.0.0.0', () => {
         console.log(`[${NODE_ID}] Port ${PORT} LOCKED.`);
    });
}

startServer().catch(console.error);
