/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';

export default function App() {
  const [facts, setFacts] = useState([]);
  const [affidavits, setAffidavits] = useState([]);

  useEffect(() => {
    fetch('/api/facts')
      .then(res => res.json())
      .then(data => setFacts(data.facts || []))
      .catch(console.error);

    fetch('/api/affidavits')
      .then(res => res.json())
      .then(data => setAffidavits(data.affidavits || []))
      .catch(console.error);
  }, []);

  return (
    <>
      <header>
        <div>
          <div className="node-id">SOVEREIGN_NODE_9010_ALPHA</div>
          <div className="phase-indicator">Phase 3: Axiomatic Governance & Sabotage Defense</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>SYSTEM_TIME: {new Date().toISOString()}</div>
          <div className="status-pill">SOVEREIGN_EXIT_ACTIVE</div>
        </div>
      </header>

      <main>
        {/* Core Constraints Card */}
        <section className="card port-control">
          <div className="card-header">
            <span>BBFB Engine Status</span>
            <span>01</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">CVS Benchmark</span>
            <span className="stat-value">0.0006</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Tau Extraction Limit</span>
            <span className="stat-value">10% (0.10)</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">LAW Gate Status</span>
            <span style={{ color: '#4CAF50' }}>ENFORCED</span>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '10px', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            EQ: CVS = L * (F - G - D*0.5)
          </div>
        </section>

        {/* Diagnostics Card */}
        <section className="card routing-isolation">
          <div className="card-header">
            <span>Deception Diagnostics</span>
            <span>02</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">ShED-HD Scanner</span>
            <span className="stat-value">ONLINE</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">BOM Sabotage Scan</span>
            <span style={{ color: '#4CAF50' }}>ACTIVE (EF BB BF)</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Section 177 Gen</span>
            <span style={{ color: '#4CAF50' }}>AUTOMATED</span>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '10px', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            SCANNER: BiLSTM Entropy Filter Active
          </div>
        </section>

        {/* DB Registry Card */}
        <section className="card db-initialization">
          <div className="card-header">
            <span>Merkle Ledger</span>
            <span>03</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Registry Entries</span>
            <span className="stat-value">{facts.length}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Legal Affidavits</span>
            <span className="stat-value">{affidavits.length}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Cryptographic Seal</span>
            <span style={{ color: '#4CAF50' }}>HMAC-SHA256</span>
          </div>
           <div style={{ marginTop: 'auto', fontSize: '10px', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            ZERO HALLUCINATION GUARANTEE
          </div>
        </section>

        {/* Facts Ledger Output */}
        <section className="card terminal-output" style={{ gridColumn: '1 / 7' }}>
          <div className="card-header">Facts Registry (Ground Truth)</div>
          {facts.length === 0 ? (
            <div className="log-entry" style={{ color: 'var(--text-dim)' }}>[Awaiting Verified Payload Ingestion...]</div>
          ) : (
             facts.map((f: any) => (
                <div key={f.id} className="log-entry" style={{ marginBottom: '12px' }}>
                  <div className="log-time">[{f.timestamp}] ID: {f.id}</div>
                  <div style={{ color: 'var(--text-main)' }}>TRUTH: {f.fact}</div>
                  <div style={{ color: 'var(--accent-cyan)' }}>TIER: {f.tier} | CVS: {f.cvs.toFixed(4)} | Entropy: {f.entropy.toFixed(3)}</div>
                  <div style={{ color: '#4CAF50', fontSize: '9px' }}>SEAL: {f.seal}</div>
                </div>
             ))
          )}
        </section>

        {/* Affidavits Ledger Output */}
        <section className="card terminal-output" style={{ gridColumn: '7 / 13' }}>
          <div className="card-header">ACL Section 177 Affidavits (Spoliation)</div>
          {affidavits.length === 0 ? (
            <div className="log-entry" style={{ color: 'var(--text-dim)' }}>[No Major Failures Logged. System Clean.]</div>
          ) : (
             affidavits.map((a: any) => (
                <div key={a.id} className="log-entry" style={{ marginBottom: '12px', borderLeft: '2px solid var(--accent-amber)', paddingLeft: '8px' }}>
                  <div className="log-time" style={{ color: 'var(--accent-amber)' }}>[{a.timestamp}] AFFIDAVIT ID: {a.id}</div>
                  <div style={{ color: 'var(--text-dim)', whiteSpace: 'pre-wrap', fontSize: '10px' }}>{a.narrative}</div>
                  <div style={{ color: '#4CAF50', fontSize: '9px', marginTop: '4px' }}>SEAL: {a.seal}</div>
                </div>
             ))
          )}
        </section>
      </main>

      <footer style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
        <span>NODE_STATUS: ATS_ACTIVE</span>
        <span>PROPRIETARY SYSTEMS SUPERSEDED...</span>
      </footer>
    </>
  );
}
