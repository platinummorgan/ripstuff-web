# Database Recovery Guide

## 🚨 Emergency Data Loss Recovery

### Neon Database Point-in-Time Recovery (PRIMARY METHOD)

**When:** Database appears empty or data is missing
**Solution:** Use Neon's built-in point-in-time recovery

#### Steps:
1. **Go to Neon Console:** https://console.neon.tech/
2. **Find your database:** `ep-muddy-art-adh26olr-pooler.c-2.us-east-1.aws.neon.tech`
3. **Navigate to:** Backups → Point-in-time Recovery
4. **Select time:** Choose a point before the data loss (e.g., 20+ minutes ago)
5. **Restore:** Follow Neon's restoration process
6. **Verify:** Run `node check-data.js` to confirm restoration

#### Recovery Timeline:
- **Free Tier:** 7 days of backup history
- **Paid Tier:** 30+ days of backup history

### Quick Data Verification
```bash
# Check if data exists
node check-data.js

# Check database connection
node test-db-connection.js

# Check recent graves
node check-recent-graves.js
```

### Emergency Contacts & Resources
- **Neon Support:** https://neon.tech/docs/support
- **Database URL:** Check `.env.local` for current connection
- **Backup Frequency:** Neon automatically backs up every few minutes

## 🛡️ Prevention Strategies

### Before Making Database Changes:
1. **Always test migrations on development first**
2. **Use `npx prisma migrate dev` not `db push --reset`**
3. **Double-check environment variables before deployment**
4. **Create manual backup before major schema changes**

### Warning Commands (DANGEROUS):
```bash
# ⚠️ NEVER run these in production:
npx prisma db push --reset          # Resets entire database
npx prisma migrate reset            # Destroys all data
DROP DATABASE neondb;               # Nuclear option
```

### Safe Commands:
```bash
# ✅ Safe database operations:
npx prisma migrate dev              # Safe migration
npx prisma db seed                  # Add sample data
npx prisma generate                 # Regenerate client
```

## 📊 Incident Log

### September 28, 2025 - Complete Data Loss
- **Problem:** All graves (13) and users (2) disappeared from database
- **Detection:** Empty website, `check-data.js` showed 0 records
- **Cause:** Unknown (occurred within 20-minute window)
- **Solution:** Neon point-in-time recovery to 20 minutes prior
- **Recovery Time:** ~5 minutes
- **Data Restored:** All 13 graves and 2 users successfully recovered
- **Lesson:** Neon's point-in-time recovery is extremely reliable and fast

---
*Last updated: September 28, 2025*
*Next review: Monitor for patterns if data loss recurs*