# Sovereign Node 9010 v3.9.1 — Deterministic Audit & Detection Node
# Containerized for reproducible, auditable, no-black-box runs.
#
# Curated from stacked development attempts (Project folder + Final v3.9.1).
# Avoided the trap of duplicated parallel implementations and over-scoped
# ambitions (TS frontend, full DO-178C DAL A, excessive 00-99 on host).
#
# Adopted the strongest practical elements:
# - Strict 00-99 Spatial Hierarchy *inside the container* for geometric isolation.
# - Hardened runtime (non-root, PYTHONHASHSEED=0, minimal footprint).
# - NO_NETWORK=1 enforcement where possible for the validation path.
# - Persistent Merkle ledger via volume (the real source of truth).
# - Healthcheck that asserts the deterministic / no-black-box contract.
#
# Build:
#   docker build -t sovereign-node:3.9.1 .
#
# Run (simple):
#   docker run --rm -p 8000:8000 -v sovereign-data:/app/data sovereign-node:3.9.1
#
# Recommended: use docker-compose.yml for secrets + persistence.

# =============================================================================
# Builder stage (keeps final image tiny)
# =============================================================================
FROM python:3.11-slim-bookworm AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

# Only what we need for installation
COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install python-dateutil==2.9.0.post0

# =============================================================================
# Runtime stage (minimal, auditable, deterministic)
# =============================================================================
FROM python:3.11-slim-bookworm AS runtime

LABEL org.opencontainers.image.title="Sovereign Node 9010 v3.9.1" \
      org.opencontainers.image.description="High-assurance deterministic audit & deception detection node" \
      org.opencontainers.image.version="3.9.1" \
      org.opencontainers.image.source="https://github.com/sovereign-node/9010"

# Determinism & security environment (hardened from production notes)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONHASHSEED=0 \
    PYTHONFAULTHANDLER=1 \
    PIP_NO_CACHE_DIR=1 \
    # Hardening flags from stacked attempts
    NO_NETWORK=1 \
    # Default paths inside container (overridable via compose)
    SOVEREIGN_DB_PATH=/app/data/vault/facts_registry.db \
    # Tau auth token and audit secret MUST be provided at runtime (never baked in)
    TAAS_AUTH_TOKEN="" \
    AUDIT_SECRET_KEY=""

# Create non-root user for security (principle of least privilege)
RUN groupadd --system --gid 1001 sovereign && \
    useradd --system --uid 1001 --gid sovereign --home /app --shell /sbin/nologin sovereign

WORKDIR /workspace

# The 00-99 Spatial Hierarchy now exists on the host and is copied as-is (strict structure from Project folder vision)
# This provides geometric isolation in both dev and production.

# Copy only the Python source we actually need (now already organized in 02_Technical/ on disk)
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy the entire organized 02_Technical tree + supporting root files
COPY 02_Technical/ 02_Technical/
COPY .pre-commit-config.yaml .
COPY README.md .

# Ensure 03_Vault and 04_Validation exist with correct ownership
RUN mkdir -p 03_Vault 04_Validation && \
    chown -R sovereign:sovereign /workspace

# Apply strict permissions (read-only for code, writable only for vault/validation)
RUN chmod -R 500 /workspace/02_Technical && \
    chmod -R 700 /workspace/03_Vault /workspace/04_Validation

# Switch to non-root
USER sovereign

WORKDIR /workspace

# Expose the HTTP dashboard + API
EXPOSE 8000

# Healthcheck against the real deterministic endpoint (inside the hardened hierarchy)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "
import urllib.request, json, sys
try:
    with urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=4) as r:
        data = json.loads(r.read())
        if data.get('deterministic') is True and data.get('black_box') is False:
            sys.exit(0)
    sys.exit(1)
except Exception:
    sys.exit(1)
" || exit 1

# MANDATORY PRE-WORK GATE (pre-work == code for reproducibility / no human/AI error)
# The checker refuses to start the node if the strict bootstrap was not executed.
COPY 04_Validation/check-bootstrap.py /workspace/04_Validation/check-bootstrap.py
RUN chmod +x /workspace/04_Validation/check-bootstrap.py

# ENTRYPOINT always runs the pre-work checker first, then the server.
# This is the key enforcement for containerized deterministic runs.
ENTRYPOINT ["python", "/workspace/04_Validation/check-bootstrap.py"]
CMD ["python", "02_Technical/server.py"]
