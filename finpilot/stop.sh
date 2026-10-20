#!/usr/bin/env bash
# ==============================================================================
# Now_or_Never Console - Stop All Services
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$DIR/logs/.pids"

echo "Stopping Now_or_Never Console services..."

# Helper to kill by port
kill_port() {
  local port=$1
  local name=$2
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Stopping $name on port $port (PID: $pids)..."
    kill -9 $pids 2>/dev/null || true
  fi
}

kill_port 5173 "Frontend (Vite)"
kill_port 3001 "Database Server (Express)"
kill_port 8100 "AI Copilot Agent (Uvicorn)"

if [ -f "$PID_FILE" ]; then
  rm -f "$PID_FILE"
fi

echo "✔ All Now_or_Never Console services stopped."
