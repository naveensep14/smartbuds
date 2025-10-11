# SuccessBuds Data Backups

This directory contains automated backups of your SuccessBuds Supabase data.

## Backup Files

### Latest Backup
- `latest_backup.json` - Always contains the most recent backup data

### Timestamped Backups
- `successbuds_backup_YYYY-MM-DD.json` - Combined backup with all data
- `tests_backup_YYYY-MM-DD.json` - Tests table backup only
- `results_backup_YYYY-MM-DD.json` - Results table backup only

## Backup Contents

Each backup includes:
- **Tests**: All test data including questions, options, and metadata
- **Results**: Student test results and scores
- **Profiles**: User profile information including grades and boards
- **Test Progress**: Student progress tracking (if available)
- **Metadata**: Backup timestamp, table counts, and source information

## How to Restore

### From Latest Backup
```bash
# Use the restore script
node scripts/restore-supabase.js latest_backup.json
```

### From Specific Backup
```bash
# Use a specific timestamped backup
node scripts/restore-supabase.js successbuds_backup_2025-10-03.json
```

## Backup Schedule

**Manual Backup:**
```bash
node backup-database.js
```

**Automated Backup (recommended):**
Set up a cron job or GitHub Actions to run weekly backups.

## Data Safety

- ✅ All data is exported in JSON format
- ✅ Backups include full test questions and student results
- ✅ Metadata preserved (timestamps, IDs, etc.)
- ✅ Human-readable format for easy inspection
- ✅ Stored locally in your repository

## Important Notes

- Backups are stored in this repository for version control
- Keep backups secure and don't commit sensitive student data to public repos
- Consider encrypting backups for additional security
- Test restore procedures regularly

## File Structure

```
backups/
├── README.md                           # This file
├── latest_backup.json                  # Most recent backup
├── successbuds_backup_2025-10-03.json # Timestamped full backup
├── tests_backup_2025-10-03.json       # Tests table only
└── results_backup_2025-10-03.json     # Results table only
```

## Backup Script

The backup script (`backup-database.js`) automatically:
1. Connects to your Supabase database
2. Exports all tables (tests, results)
3. Creates multiple backup formats
4. Updates the latest backup file
5. Provides detailed logging

## Last Backup

**Date:** October 11, 2025  
**Tests:** 59 records  
**Results:** 3 records  
**Profiles:** 5 records  
**Test Progress:** 0 records  
**Status:** ✅ Successful

---

*Keep your educational data safe! 🎓*
