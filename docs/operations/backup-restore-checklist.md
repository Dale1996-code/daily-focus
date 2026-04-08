# Backup and Restore Checklist

## Before schema changes
1. Create a full PostgreSQL backup (`pg_dump`).
2. Save backup location and timestamp.
3. Confirm restore command works in a non-production database.

## Recommended commands
### Backup
```bash
pg_dump "$DATABASE_URL" --format=custom --file=flow-backup-$(date +%Y%m%d-%H%M%S).dump
```

### Restore
```bash
pg_restore --clean --if-exists --no-owner --dbname "$DATABASE_URL" flow-backup-YYYYMMDD-HHMMSS.dump
```

## Restore validation
1. Verify row counts on core tables.
2. Open the app and run:
   - create task
   - load planner
   - save reflection
3. Check `/api/health`.
