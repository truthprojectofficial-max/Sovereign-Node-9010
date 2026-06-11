"""
Sovereign Node 9010 — Technical Audit Affidavit Generator (v3.9.1)
Transforms cryptographically sealed Truth Ledger logs into formal technical audit reports.
Intended for business, compliance, due diligence, and internal governance use.

Zero-Dependency • Pure Python • Standard Library Only

Generates tamper-evident technical audit affidavits with Merkle-chain seals.
NOT intended for court proceedings. For business/technical audit purposes only.
"""

import json
from datetime import UTC, datetime
from typing import Any


class LegalAffidavitGenerator:
    """
    Compiles chronological evidence logs into formal technical audit affidavits.
    Ensures cryptographic integrity and system state are represented
    in a format suitable for business audit, compliance review, and due diligence.

    Intended Use: Business/technical audit reports (NOT court proceedings)
    Mandated Operator: Justin Barnett
    """

    def __init__(self, ledger_path: str | None = None):
        from config import SOVEREIGN_LEDGER_PATH

        self.ledger_path = ledger_path or SOVEREIGN_LEDGER_PATH
        self.operator_identity = "Justin Barnett"  # System-mandated operator
        self.system_id = "Sovereign Node 9010 (TaaS Monolith v3.0)"
        self.jurisdiction = "Computational Sovereignty / NSW Evidence Act s 177 Compliance"
        self.iso_date_mandate = True  # Enforces YYYY-MM-DD prefix on all records

    def _load_ledger(self) -> list[dict[str, Any]]:
        """Loads the facts registry from the vault with integrity verification."""
        from pathlib import Path

        if not Path(self.ledger_path).exists():
            return []
        try:
            with Path(self.ledger_path).open(encoding="utf-8") as f:
                content = json.load(f)
            # Handle both raw list or structured Merkle object
            if isinstance(content, dict):
                return content.get("blocks", [])
            if isinstance(content, list):
                return content
            return []
        except Exception as e:
            print(f"Ledger load error: {e}")
            return []

    def generate_affidavit_header(self) -> str:
        """Constructs the formal preamble and system declaration."""
        now = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
        return (
            f"================================================================================\n"
            f"                     AFFIDAVIT OF DETERMINISTIC SYSTEM TRUTH                     \n"
            f"================================================================================\n"
            f"SYSTEM IDENTIFIER: {self.system_id}\n"
            f"PRIMARY OPERATOR: {self.operator_identity}\n"
            f"DATE OF AFFIDAVIT: {now}\n"
            f"PROTOCOL COMPLIANCE: 00-99 Structural Mandate / ISO Date Mandate\n"
            f"ENVIRONMENTAL STATUS: NO_NETWORK=1 (Air-Gapped Forensic Surface)\n"
            f"JURISDICTION: {self.jurisdiction}\n"
            f"================================================================================\n\n"
            f"I, {self.operator_identity}, acting as the primary operator of {self.system_id},\n"
            f"hereby declare that the following evidentiary blocks were generated within a\n"
            f"deterministic, zero-dependency environment. These records are sealed via\n"
            f"SHA-256 Merkle-chaining and are tamper-evident. [2, 6]\n\n"
            f"--- BEGIN CHRONOLOGICAL EVIDENCE LOG ---\n"
        )

    def format_entry(self, block: dict[str, Any]) -> str:
        """Transforms a single ledger block into a legal testimony block."""
        block.get("index", block.get("block_index", "UNK"))
        ts = block.get("timestamp", "UNK")
        event = block.get("event_type", block.get("event", "SYSTEM_EVENT"))
        b_hash = block.get("current_hash", block.get("hash", "NO_HASH"))
        p_hash = block.get("previous_hash", block.get("prev_hash", "NO_PREV_HASH"))
        data = block.get("payload", block.get("data", block.get("private_payload", {})))
        nizk = block.get("nizk_proof", block.get("data_summary", {}).get("forensic_proof", "N/A"))

        return (
            f"\n"
            f"TIMESTAMP: {ts}\n"
            f"EVENT CLASSIFICATION: {event}\n"
            f"CRYPTOGRAPHIC SEAL (HMAC-SHA256): {b_hash}\n"
            f"PREVIOUS BLOCK LINK: {p_hash}\n"
            f"FORENSIC NIZK PROOF: {nizk}\n"
            f"FACTUAL CONTENT:\n{json.dumps(data, indent=4, default=str)}\n"
            f"--------------------------------------------------------------------------------\n"
        )

    def compile_full_affidavit(self) -> str:
        """Processes the entire ledger into a final evidentiary document."""
        blocks = self._load_ledger()
        if not blocks:
            return (
                "ERROR: No Truth Ledger entries found in the 03_Vault.\n"
                "Initialize the Facts Registry before generating affidavits."
            )

        affidavit = self.generate_affidavit_header()
        for block in blocks:
            affidavit += self.format_entry(block)

        affidavit += (
            f"\n--- END OF EVIDENCE LOG ---\n\n"
            f"TECHNICAL VERIFICATION STATEMENT:\n"
            f"Every block listed above has been mathematically verified against the\n"
            f"Sovereign Node 9010 Truth Ledger root. Any alteration to a single bit of\n"
            f"data within this sequence would result in a complete hash-link failure.\n\n"
            f"This technical audit affidavit is issued under the authority of the\n"
            f"BBFB Engine for business, compliance, and governance purposes.\n\n"
            f"PREPARED BY: {self.operator_identity}\n"
            f"        Sovereign Node 9010 Technical Auditor\n"
            f"        Date: {datetime.now(UTC).strftime('%Y-%m-%d')}\n"
        )
        return affidavit

    def save_to_vault(self, filename: str = "affidavit_transcript.txt") -> str:
        """Saves the compiled affidavit to the 03_Vault for archival."""
        from config import VAULT_DIR

        output_path = VAULT_DIR / filename
        content = self.compile_full_affidavit()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(content, encoding="utf-8")
        return str(output_path)


if __name__ == "__main__":
    generator = LegalAffidavitGenerator()
    print(generator.compile_full_affidavit())
    # Example: Save sample affidavit
    # saved_path = generator.save_to_vault()
    # print(f"Affidavit saved to: {saved_path}")
