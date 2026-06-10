#!/bin/bash

# Dead Grid Outpost - Rollback Script
# Usage: ./rollback.sh [target-commit]
# 
# This script rolls back the deployment to a previous version
# and optionally clears localStorage keys for profile data

set -e

# Configuration
REPO_DIR="/home/azureuser/.openclaw/workspace-captain-context/dead-grid-outpost"
TARGET_COMMIT="${1:-}"
BACKUP_DIR="/home/azureuser/.openclaw/backups/dead-grid-outpost-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running from correct directory
if [ ! -f "$REPO_DIR/package.json" ]; then
    log_error "Not in a valid Dead Grid Outpost repository"
    exit 1
fi

cd "$REPO_DIR"

# Get current commit if no target specified
if [ -z "$TARGET_COMMIT" ]; then
    log_info "No target commit specified. Showing recent commits:"
    git log --oneline -5
    echo ""
    read -p "Enter commit hash to rollback to: " TARGET_COMMIT
fi

if [ -z "$TARGET_COMMIT" ]; then
    log_error "No target commit specified"
    exit 1
fi

# Verify commit exists
if ! git rev-parse --verify "$TARGET_COMMIT" >/dev/null 2>&1; then
    log_error "Commit $TARGET_COMMIT does not exist"
    exit 1
fi

# Create backup
log_info "Creating backup at $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup current state
cp -r .next "$BACKUP_DIR/" 2>/dev/null || log_warn ".next directory not found, skipping"
cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || log_warn "package-lock.json not found, skipping"

# Backup current commit info
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "$CURRENT_COMMIT" > "$BACKUP_DIR/rollback-from-commit.txt"
echo "$TARGET_COMMIT" > "$BACKUP_DIR/rollback-to-commit.txt"
date -u +"%Y-%m-%dT%H:%M:%SZ" > "$BACKUP_DIR/rollback-timestamp.txt"

log_info "Backup created successfully"

# Stop application (if using PM2)
if command -v pm2 &> /dev/null && pm2 list | grep -q "dead-grid-outpost"; then
    log_info "Stopping application with PM2..."
    pm2 stop dead-grid-outpost
    pm2 delete dead-grid-outpost
fi

# Rollback git
log_info "Rolling back to commit $TARGET_COMMIT..."
git checkout "$TARGET_COMMIT"

# Install dependencies
log_info "Installing dependencies..."
npm install

# Build application
log_info "Building application..."
npm run build

# Restart application (if using PM2)
if command -v pm2 &> /dev/null; then
    log_info "Starting application with PM2..."
    pm2 start npm --name "dead-grid-outpost" -- start
    pm2 save
fi

# Verify rollback
log_info "Verifying rollback..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    log_info "✅ Application is running"
else
    log_warn "⚠️  Application may not be responding on port 3000"
    log_warn "Check PM2 logs: pm2 logs dead-grid-outpost"
fi

# Display rollback summary
echo ""
log_info "=== Rollback Summary ==="
log_info "From commit: $CURRENT_COMMIT"
log_info "To commit:   $TARGET_COMMIT"
log_info "Backup:      $BACKUP_DIR"
echo ""
log_warn "IMPORTANT: User localStorage data is NOT affected by this rollback"
log_warn "Profile data in localStorage will persist across versions"
echo ""
log_info "To restore from backup:"
log_info "  1. git checkout $CURRENT_COMMIT"
log_info "  2. cp -r $BACKUP_DIR/.next .next"
log_info "  3. npm run build"
log_info "  4. pm2 restart dead-grid-outpost"
echo ""

exit 0
