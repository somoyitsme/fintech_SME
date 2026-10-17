#!/bin/bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-8090}"
cd "$DIR/finpilot/backend"
echo "🚀 Starting FinPilot Full-Stack Server on http://localhost:$PORT"
exec .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload
