# Sovereign Node 9010 v3.9.1 — User Instructions

**Version:** 3.9.1 (Production-Ready)  
**Last Updated:** May 26, 2026

---

## 1. Quick Start

### Prerequisites
- Python 3.11+
- Git (recommended)

### Installation

```bash
# 1. Clone or download the project
cd Sovereign-Node-9010

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) Install pre-commit hooks for local quality enforcement
pre-commit install
```

---

## 2. Running the System

### Basic Usage

```python
from groknett_core import GrokNetCore

# Initialize the system
core = GrokNetCore()

# Process a statement through the 4-Gate pipeline
result = core.process_input(
    category="VALUE_FORGE_DECISION",
    statement="Your input statement here...",
    folder="02_Technical"
)

print(result["final_action"])      # GO / DEFER / TEST FIRST
print(result["deception_gate"])    # Deception analysis results
print(result["bbfb_cvs"])          # Value score
```

### Health Check

```python
health = core.health_check()
print(health)
```

### Generate Affidavit

```python
affidavit = core.generate_affidavit()
print(affidavit)
```

---

## 3. Configuration

The system supports configuration via environment variables or `config.json`:

### Environment Variables

```bash
export SOVEREIGN_DB_PATH="/path/to/database.db"
export SOVEREIGN_LEDGER_PATH="/path/to/ledger.json"
export UID_THRESHOLD=0.15
export CONSENSUS_THRESHOLD=0.70
```

### Optional JSON Config

Create a `config.json` file in the project root for additional settings.

---

## 4. Running Quality Checks

### Local (Pre-commit)

```bash
pre-commit run --all-files
```

### Manual Checks

```bash
# Linting + Formatting
ruff check .
ruff format .

# Type Checking
mypy . --strict

# Security Scan
bandit -r .
```

---

## 5. Project Structure

```
Sovereign-Node-9010/
├── 02_Technical/
│   ├── groknett_core.py              # Main orchestrator
│   ├── deception_scanner_v3_9_1.py   # 52-pattern deception detection
│   ├── rule_verifier_v3_9_1.py       # Ontology validation
│   ├── facts_registry.py             # Persistent storage
│   ├── config.py                     # Configuration
│   └── constants.py                  # Named constants
├── .github/workflows/ci.yml          # CI Pipeline
├── pyproject.toml                    # Ruff + MyPy config
├── .pre-commit-config.yaml           # Pre-commit hooks
├── requirements.txt
└── USER_INSTRUCTIONS_v3.9.1.md       # This file
```

---

## 6. Common Commands

| Task | Command |
|------|---------|
| Run full pipeline | `python -c "from groknett_core import GrokNetCore; core = GrokNetCore(); print(core.process_input('test', 'Your statement'))"` |
| Check system health | `python -c "from groknett_core import GrokNetCore; print(GrokNetCore().health_check())"` |
| Generate affidavit | `python -c "from groknett_core import GrokNetCore; print(GrokNetCore().generate_affidavit())"` |
| Run all quality checks | `pre-commit run --all-files` |

---

## 7. Troubleshooting

| Problem | Solution |
|---------|----------|
| Import errors | Run `pip install -r requirements.txt` |
| Database issues | Check `SOVEREIGN_DB_PATH` environment variable |
| Long lines in Ruff | The project uses 120 character limit. Some files may need manual formatting. |
| Pre-commit failing | Run `pre-commit run --all-files --show-diff-on-failure` |

---

## 8. Support

For issues or questions:
- Review `FINAL_PROJECT_SUMMARY_v3.9.1.md`
- Check `CI_SECURITY_AUDIT_v3.9.1.md` for pipeline details
- Inspect logs in `04_Logs/` directory

---

**Sovereign Node 9010 v3.9.1 — Ready for Use**