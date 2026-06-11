#!/usr/bin/env python3
"""
Convenience launcher for Sovereign Node 9010 after 00-99 reorganization.

PRE-WORK IS MANDATORY (equal importance to the code for reproducibility/portability).
Run the strict bootstrap first or this will refuse to start.

Usage:
    python run_server.py
"""
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
sys.path.insert(0, str(root / "02_Technical"))

from server import run_server

if __name__ == "__main__":
    run_server()
