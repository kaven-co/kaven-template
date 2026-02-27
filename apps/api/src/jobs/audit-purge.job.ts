/**
 * Audit Log Purge Job
 *
 * Removes permanently deleted audit logs whose retentionUntil has expired.
 * Configurable via: AUDIT_RETENTION_DAYS env variable (default: 90)
 *
 * Usage:
 *   - Manual: npx tsx src/jobs/audit-purge.job.ts
 *   - Scheduled: cron job calling this script (daily recommended)
 *
 * LGPD/GDPR: Only purges logs marked as deleted AND past retentionUntil.
 * Active (non-deleted) logs are never purged by this job.
 */
import { auditService } from '../modules/audit/services/audit.service';

async function runPurge() {
  console.log('🔄 [AuditPurgeJob] Starting audit log purge...');
  console.log(`   Retention period: ${process.env.AUDIT_RETENTION_DAYS || '90'} days`);

  try {
    const result = await auditService.purgeExpiredLogs();
    console.log(`✅ [AuditPurgeJob] Purge complete: ${result.purged} logs removed`);
    process.exit(0);
  } catch (error) {
    console.error('❌ [AuditPurgeJob] Purge failed:', error);
    process.exit(1);
  }
}

runPurge();
