# 1. Python compile baseline (repeatable)
Measure-Command { python -m compileall -q -j 0 "path\to\your\project" }

# 2. Simple WSL command latency
Measure-Command { wsl echo "Sovereign Node benchmark" | Out-Null }

# 3. Docker build time (example)
Measure-Command { docker build -t sovereign-node-test . }

# 4. Node sync / startup time (replace with your actual Sovereign Node command)
Measure-Command { wsl ./sovereign-node --mode test --dry-run }