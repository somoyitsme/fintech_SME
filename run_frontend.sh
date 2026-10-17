#!/bin/bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/finpilot/frontend"
echo "🚀 Starting FinPilot Frontend Dev Server on http://localhost:5173"
exec npm run dev
