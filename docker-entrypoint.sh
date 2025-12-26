#!/bin/sh

# This script allows runtime configuration of nginx
# It replaces environment variables in nginx.conf with actual values

set -e

# Default values if not provided
PROXY_TARGET=${PROXY_TARGET:-"http://localhost:8083"}

echo "Configuring nginx with PROXY_TARGET: $PROXY_TARGET"

# Use envsubst to replace environment variables in nginx config
envsubst '${PROXY_TARGET}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Starting nginx..."
exec nginx -g 'daemon off;'
