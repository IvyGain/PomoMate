#!/bin/sh
# Database backup script

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pomodoro_backup_$TIMESTAMP.sql.gz"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)"

# Perform backup
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -h postgres \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --no-owner \
    --no-privileges \
    --verbose \
    | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    
    # Get file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $SIZE"
    
    # Remove old backups
    echo "Removing backups older than $RETENTION_DAYS days"
    find "$BACKUP_DIR" -name "pomodoro_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # List remaining backups
    echo "Current backups:"
    ls -lh "$BACKUP_DIR"/pomodoro_backup_*.sql.gz 2>/dev/null || echo "No backups found"
else
    echo "Backup failed!"
    exit 1
fi

echo "Backup process completed at $(date)"