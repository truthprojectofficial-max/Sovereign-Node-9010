import os
import sys

# List of target files for integrity verification
files_to_check = [
    "TIME FOR MORE BUGGERY.",
    "microsoft cock",
    "S.md",
    "Untitled.md",
    "ources and related content",
    "over it",
    "fucknose",
    "Forensic Discovery Audit and SovereCHANGED COPY",
    "I can't seem to verify that account",
    "PERSONALSETTINGS",
    "[INCIDENT LOG SEC-01].md",
    "1. Interface & Tool Orchestration C",
    "1Cinetpub.md",
    "a CONSOLIDATION AND CORRECTLY ASSIG",
    "ACCOUNT AND LAPPY SET UP",
    "CUNT",
    "DR rech",
    "Algorithmic Deception Data Extraction - Google Gemini.txt",
    "machine deceit - NotebookLM00 99.txt",
    "decept prompr.txt"
]

def run_integrity_check():
    print("--- SOVEREIGN NODE 9010: FILE INTEGRITY AUDIT ---")
    empty_or_missing = []
    valid_files = []

    for file_name in files_to_check:
        # Check if the file doesn't exist OR if its size is 0 bytes
        if not os.path.exists(file_name):
            empty_or_missing.append((file_name, "MISSING"))
        elif os.path.getsize(file_name) == 0:
            empty_or_missing.append((file_name, "EMPTY (0 BYTES)"))
        else:
            valid_files.append(file_name)

    print(f"\nTotal files analyzed: {len(files_to_check)}")
    print(f"Total valid files: {len(valid_files)}")
    print(f"Total failures (missing/empty): {len(empty_or_missing)}")

    if empty_or_missing:
        print("\n--- FAILURE LOG ---")
        for f, reason in empty_or_missing:
            print(f" [!] {f}: {reason}")

    if valid_files:
        print("\n--- VALIDATED ASSETS ---")
        for f in valid_files:
            print(f" [OK] {f}")

if __name__ == "__main__":
    run_integrity_check()
