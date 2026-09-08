#!/usr/bin/env bash
# ==============================================================================
#  AuthCore — Unified Full-Stack Dev Runner
#  Starts MongoDB (Docker/local) + NestJS Backend + React 19 Frontend in one go.
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ANSI Colors
BOLD='\033[1m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
RESET='\033[0m'

log_sys()  { printf "${BOLD}${BLUE}[SYSTEM]${RESET} %s\n" "$*"; }
log_db()   { printf "${BOLD}${GREEN}[DB]${RESET}     %s\n" "$*"; }
log_warn() { printf "${BOLD}${YELLOW}[WARN]${RESET}   %s\n" "$*"; }
log_err()  { printf "${BOLD}${RED}[ERROR]${RESET}  %s\n" "$*"; }

echo ""
printf "${BOLD}${CYAN}====================================================${RESET}\n"
printf "${BOLD}${CYAN}  AuthCore — Unified Development Runner            ${RESET}\n"
printf "${BOLD}${CYAN}  MongoDB + NestJS Backend + React 19 Frontend      ${RESET}\n"
printf "${BOLD}${CYAN}====================================================${RESET}\n"
echo ""

# ------------------------------------------------------------------------------
# 1. Environment Files Check
# ------------------------------------------------------------------------------
if [ ! -f "backend/.env" ]; then
  log_warn "backend/.env not found. Copying from backend/.env.example..."
  cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
  log_warn "frontend/.env not found. Copying from frontend/.env.example..."
  cp frontend/.env.example frontend/.env
fi

# ------------------------------------------------------------------------------
# 2. Database Startup (MongoDB on port 27017)
# ------------------------------------------------------------------------------
is_mongo_ready() {
  timeout 1 bash -c 'cat < /dev/null > /dev/tcp/127.0.0.1/27017' 2>/dev/null
}

if is_mongo_ready; then
  log_db "MongoDB is already running and accessible on 127.0.0.1:27017."
else
  log_db "MongoDB is not running on port 27017. Attempting to start container..."

  if command -v docker >/dev/null 2>&1; then
    # Check if mongo-auth container already exists
    if docker ps -a --format '{{.Names}}' | grep -Eq '^mongo-auth$'; then
      log_db "Starting existing 'mongo-auth' container..."
      docker start mongo-auth >/dev/null
    else
      log_db "Starting MongoDB via Docker Compose..."
      docker compose up -d
    fi

    # Wait for MongoDB to become ready
    log_db "Waiting for MongoDB to accept connections..."
    TRIES=0
    MAX_TRIES=30
    until is_mongo_ready || [ $TRIES -ge $MAX_TRIES ]; do
      sleep 1
      TRIES=$((TRIES + 1))
    done

    if is_mongo_ready; then
      log_db "MongoDB is ready on 127.0.0.1:27017!"
    else
      log_warn "MongoDB took longer than expected to accept connections. Proceeding anyway..."
    fi
  else
    log_err "Docker is not installed or not in PATH, and MongoDB is not running locally."
    log_err "Please start MongoDB manually or install Docker."
    exit 1
  fi
fi

# ------------------------------------------------------------------------------
# 3. Dependency Verification
# ------------------------------------------------------------------------------
if [ ! -d "backend/node_modules" ]; then
  log_sys "Installing backend dependencies..."
  (cd backend && pnpm install)
fi

if [ ! -d "frontend/node_modules" ]; then
  log_sys "Installing frontend dependencies..."
  (cd frontend && pnpm install)
fi

# ------------------------------------------------------------------------------
# 4. Graceful Cleanup Trap
# ------------------------------------------------------------------------------
cleanup() {
  echo ""
  log_sys "Received termination signal. Shutting down all processes..."
  trap - SIGINT SIGTERM EXIT
  kill 0 2>/dev/null || true
  wait 2>/dev/null || true
  log_sys "All processes terminated cleanly. Goodbye!"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# ------------------------------------------------------------------------------
# 5. Launch Backend & Frontend in Parallel with Colored Prefixes
# ------------------------------------------------------------------------------
log_sys "Starting Backend on http://localhost:3000 (Swagger: http://localhost:3000/api/docs)..."
(
  cd backend
  pnpm run start:dev 2>&1 | sed -u "s/^/$(printf '%b' "${BOLD}${CYAN}[backend]${RESET} ")/"
) &

log_sys "Starting Frontend on http://localhost:5173..."
(
  cd frontend
  pnpm run dev 2>&1 | sed -u "s/^/$(printf '%b' "${BOLD}${MAGENTA}[frontend]${RESET} ")/"
) &

# Keep the script running and wait for background jobs
wait
