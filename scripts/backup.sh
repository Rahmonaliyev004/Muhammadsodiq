#!/usr/bin/env bash
# Barcha do'konlar ma'lumotini (baza + rasmlar) arxivlaydi, 14 kundan eskisini o'chiradi.
# Cron: 0 3 * * * /srv/santexnik/app/scripts/backup.sh
set -euo pipefail
DATA_ROOT="${DATA_ROOT:-/var/santexnik/shops}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/santexnik}"
mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/santexnik-$(date +%F).tar.gz" -C "$DATA_ROOT" .
find "$BACKUP_DIR" -name 'santexnik-*.tar.gz' -mtime +14 -delete
echo "Zaxira tayyor: $BACKUP_DIR"
