#!/usr/bin/env bash
# ==============================================================================
# Now_or_Never Console - Full System Launcher (LAN & Localhost)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$DIR/logs"
PID_FILE="$LOG_DIR/.pids"

mkdir -p "$LOG_DIR"

# Detect Primary LAN IP Address
LAN_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LAN_IP" ]; then
  LAN_IP="127.0.0.1"
fi

echo "=================================================================="
echo "   NOW_OR_NEVER CONSOLE — LAUNCHING WHOLE SYSTEM"
echo "=================================================================="
echo "Host Machine IP: $LAN_IP"
echo ""

# Helper to check if a port is in use
check_port() {
  local port=$1
  lsof -i :$port -sTCP:LISTEN -t 2>/dev/null || true
}

# 1. Start Database Server (Express + SQLite WAL on port 3001)
DB_PID=$(check_port 3001)
if [ -n "$DB_PID" ]; then
  echo "✔ DB Server is already running on port 3001 (PID: $DB_PID)"
else
  echo "▶ Starting Database Server on 0.0.0.0:3001..."
  cd "$DIR/db-server"
  nohup npm run dev > "$LOG_DIR/db-server.log" 2>&1 &
  echo $! >> "$PID_FILE"
  echo "✔ DB Server launched in background (PID: $!)."
fi

# 2. Start AI Financial Copilot Agent (FastAPI on port 8100)
AGENT_PID=$(check_port 8100)
if [ -n "$AGENT_PID" ]; then
  echo "✔ AI Agent Server is already running on port 8100 (PID: $AGENT_PID)"
else
  echo "▶ Starting AI Copilot Agent on 0.0.0.0:8100..."
  cd "$DIR/agent"
  if [ -f "$DIR/agent/.venv/bin/python3" ]; then
    nohup "$DIR/agent/.venv/bin/python3" -m uvicorn app.main:app --host 0.0.0.0 --port 8100 > "$LOG_DIR/agent.log" 2>&1 &
  else
    nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8100 > "$LOG_DIR/agent.log" 2>&1 &
  fi
  echo $! >> "$PID_FILE"
  echo "✔ AI Agent launched in background (PID: $!)."
fi

# 3. Start Frontend Dashboard (Vite on port 5173 with host 0.0.0.0)
FRONT_PID=$(check_port 5173)
if [ -n "$FRONT_PID" ]; then
  echo "✔ Frontend Dashboard is already running on port 5173 (PID: $FRONT_PID)"
else
  echo "▶ Starting Frontend Dashboard on 0.0.0.0:5173..."
  cd "$DIR/frontend"
  nohup npm run dev -- --host 0.0.0.0 --port 5173 > "$LOG_DIR/frontend.log" 2>&1 &
  echo $! >> "$PID_FILE"
  echo "✔ Frontend Dashboard launched in background (PID: $!)."
fi

echo ""
echo "⏳ Waiting 3 seconds for services to initialize..."
sleep 3

echo ""
echo "=================================================================="
echo "   SYSTEM IS FULLY ONLINE & LIVE!"
echo "=================================================================="
echo ""
echo "▶ Localhost Access (This PC):"
echo "   http://localhost:5173"
echo ""
echo "▶ Network Access (Another PC / Mobile on same Wi-Fi):"
echo "   http://$LAN_IP:5173"
echo ""
echo "▶ Manager Login Credentials:"
echo "   Username:  somoy  (or manager)"
echo "   Password:  Somoy@2026"
echo ""
echo "▶ Service Status & Health:"
echo "   • Frontend:     http://$LAN_IP:5173"
echo "   • DB Server:    http://$LAN_IP:3001/api/health"
echo "   • AI Copilot:   http://$LAN_IP:8100/health"
echo ""
echo "▶ Log Files:"
echo "   tail -f logs/frontend.log"
echo "   tail -f logs/db-server.log"
echo "   tail -f logs/agent.log"
echo ""
echo "▶ To stop all services at once:"
echo "   ./stop.sh"
echo "=================================================================="
