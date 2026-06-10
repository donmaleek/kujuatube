#!/usr/bin/env sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" > "$BACKUP_DIR/kujuatime-$(date +%Y%m%d%H%M%S).sql"
