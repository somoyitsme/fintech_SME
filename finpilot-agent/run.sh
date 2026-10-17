#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Ensure venv exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment for FinPilot Agent..."
    uv venv .venv
    source .venv/bin/activate
    uv pip install -e .
else
    source .venv/bin/activate
fi

# Seed DB if not already seeded
python3 -m agent_core.db.seed_data

echo "=========================================================="
echo " Starting Standalone FinPilot AI Agent Service on port 8100"
echo " Docs: http://localhost:8100/docs"
echo " SDK:  http://localhost:8100/sdk/finpilot-sdk.js"
echo " Demo: http://localhost:8100/sdk/demo/demo-host.html"
echo " Demo: http://localhost:8100/sdk/demo/demo-pharmacy.html"
echo "=========================================================="

exec uvicorn agent_core.main:app --host 0.0.0.0 --port 8100 --reload
