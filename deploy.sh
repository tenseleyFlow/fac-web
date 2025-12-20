#!/bin/bash
#
# Deploy script for facsimile.musicsian.com
#
# Usage: ./deploy.sh [--setup]
#
# --setup: First-time setup (creates directories, copies nginx config)
#

set -e

SITE_DIR="/var/www/facsimile.musicsian.com"
NGINX_CONF="/etc/nginx/conf.d/facsimile.musicsian.com.conf"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

setup() {
    info "Running first-time setup..."

    # Create site directory
    if [ ! -d "$SITE_DIR" ]; then
        sudo mkdir -p "$SITE_DIR"
        sudo chown -R $USER:$USER "$SITE_DIR"
        info "Created $SITE_DIR"
    fi

    # Copy nginx config to conf.d
    if [ ! -f "$NGINX_CONF" ]; then
        sudo cp "$SCRIPT_DIR/nginx/facsimile.musicsian.com.conf" "$NGINX_CONF"
        info "Installed nginx configuration to $NGINX_CONF"
    else
        warn "Nginx config already exists at $NGINX_CONF"
    fi

    # Test nginx config
    sudo nginx -t || error "Nginx configuration test failed"

    # Reload nginx
    sudo systemctl reload nginx
    info "Nginx reloaded"

    info "Setup complete! Run './deploy.sh' to deploy the site."
}

deploy() {
    info "Building site..."
    cd "$SCRIPT_DIR/site"
    npm run build || error "Build failed"

    # Create timestamped release directory
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    RELEASE_DIR="$SITE_DIR/releases/$TIMESTAMP"

    info "Deploying to $RELEASE_DIR..."
    mkdir -p "$RELEASE_DIR"
    cp -r dist/* "$RELEASE_DIR/"

    # Update symlink
    ln -sfn "$RELEASE_DIR" "$SITE_DIR/current"
    info "Updated symlink to $RELEASE_DIR"

    # Keep last 5 releases
    cd "$SITE_DIR/releases"
    ls -dt */ | tail -n +6 | xargs -r rm -rf
    info "Cleaned up old releases"

    info "Deployment complete!"
    echo ""
    echo "Site is live at: https://facsimile.musicsian.com"
}

# Parse args
if [ "$1" == "--setup" ]; then
    setup
else
    deploy
fi
