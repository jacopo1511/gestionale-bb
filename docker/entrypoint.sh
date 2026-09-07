#!/bin/sh
set -e

echo "→ Applico le migrazioni del database..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "→ Avvio l'applicazione..."
exec "$@"
