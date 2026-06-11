# Sovereign Node 9010 - Python Core Build

This repository contains the deterministic Python core for Sovereign Node 9010 (Groknett ValueForge / TaaS Monolith).

## Current Structure (Organized Build)

```
C:\groknett-valueforge-main\
├── sovereign_core.py              # Main orchestrator (entry point)
├── build_verify_full_core.py      # Current build verification script
├── core/                          # All core engines (Python package)
│   ├── __init__.py
│   ├── bbfb_engine.py
│   ├── deception_scanner.py       # v3 + 8-rule + merged + structural
│   ├── deterministic_decision_layer.py
│   ├── facts_registry.py
│   ├── legal_affidavit_generator.py
│   ├── merkle_squeal.py           # Contains TruthLedger
│   ├── monitoring.py              # UI monitoring snapshots
│   ├── rule_verifier.py
│   ├── sovereign_exit.py
│   └── structural_deception.py
├── src/                           # React/Tauri frontend (includes Monitoring tab)
└── README_BUILD.md                # This file
```

## Key Monitoring Support (added for UI)

- `core/monitoring.py` + `SovereignNode9010.get_monitoring_snapshot()`
- New **Monitoring** tab in the UI (`src/App.tsx`)

Run the build verification:
```powershell
cd C:\groknett-valueforge-main
python build_verify_full_core.py
```

## Import Pattern

```python
from sovereign_core import SovereignNode9010

node = SovereignNode9010(deception_mode="merged")
status = node.get_system_status()
snap = node.get_monitoring_snapshot()
```

## Philosophy

- 100% deterministic
- No black boxes
- 10% Tau ceiling strictly enforced
- Merkle-sealed everything
- 00-99 governance respected

This structure was organized during active build to match the project's own documented core/ layout.
