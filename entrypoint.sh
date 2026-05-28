#!/bin/sh
set -e

# Refuse to start without a stable AUTH_SECRET — an empty or missing value
# causes NextAuth v5 to generate a random secret per boot, invalidating all
# existing sessions on every container restart.
if [ -z "${AUTH_SECRET}" ]; then
  echo "ERROR: AUTH_SECRET is not set. Generate one with: openssl rand -base64 32"
  echo "Set it in your .env file on the host (not inside the container)."
  exit 1
fi

# Fix data directory ownership in case the bind-mount dir is root-owned (e.g. Synology).
# Runs as root before dropping privileges so chown is always permitted.
chown nextjs:nodejs /app/data
chmod 755 /app/data

exec su-exec nextjs sh -c "node /app/scripts/migrate.js && exec node /app/server.js"
