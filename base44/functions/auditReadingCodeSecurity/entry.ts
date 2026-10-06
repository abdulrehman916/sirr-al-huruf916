import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Audit Reading Code system security.
 * Checks for vulnerabilities, unused codes, expiration issues, etc.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const auditResults = {
      timestamp: new Date().toISOString(),
      total_codes: 0,
      active_codes: 0,
      disabled_codes: 0,
      expired_codes: 0,
      fully_redeemed_codes: 0,
      partially_redeemed_codes: 0,
      never_used_codes: 0,
      security_issues: [],
      recommendations: []
    };

    // Fetch all AccessCodes
    const allCodes = await base44.asServiceRole.entities.AccessCode.list(null, 10000);
    auditResults.total_codes = allCodes.length;

    const now = new Date();
    const codesByStatus = {
      active: [],
      disabled: [],
      expired: [],
      fullyRedeemed: [],
      partiallyRedeemed: [],
      neverUsed: []
    };

    for (const code of allCodes) {
      // Check disabled
      if (code.is_disabled) {
        codesByStatus.disabled.push(code);
        continue;
      }

      // Check expired
      if (code.expiry_date && new Date(code.expiry_date) < now) {
        codesByStatus.expired.push(code);
        auditResults.security_issues.push({
          type: 'EXPIRED_CODE_STILL_ACTIVE',
          code: code.code,
          expired_at: code.expiry_date,
          severity: 'MEDIUM'
        });
        continue;
      }

      // Check max uses
      const maxUses = code.max_uses || 1;
      const useCount = code.use_count || 0;

      if (useCount >= maxUses) {
        codesByStatus.fullyRedeemed.push(code);
      } else if (useCount > 0) {
        codesByStatus.partiallyRedeemed.push(code);
      } else {
        codesByStatus.neverUsed.push(code);
      }
    }

    auditResults.active_codes = codesByStatus.active.length;
    auditResults.disabled_codes = codesByStatus.disabled.length;
    auditResults.expired_codes = codesByStatus.expired.length;
    auditResults.fully_redeemed_codes = codesByStatus.fullyRedeemed.length;
    auditResults.partially_redeemed_codes = codesByStatus.partiallyRedeemed.length;
    auditResults.never_used_codes = codesByStatus.neverUsed.length;

    // Check for codes with no expiry (potential security risk)
    const noExpiryCodes = allCodes.filter(c => !c.expiry_date && !c.is_disabled);
    if (noExpiryCodes.length > 0) {
      auditResults.security_issues.push({
        type: 'CODES_WITHOUT_EXPIRY',
        count: noExpiryCodes.length,
        codes: noExpiryCodes.slice(0, 10).map(c => c.code),
        severity: 'LOW'
      });
      auditResults.recommendations.push('Set expiry dates on all codes for security');
    }

    // Check for codes with max_uses > 1 (multi-use codes)
    const multiUseCodes = allCodes.filter(c => (c.max_uses || 1) > 1);
    if (multiUseCodes.length > 0) {
      auditResults.security_issues.push({
        type: 'MULTI_USE_CODES',
        count: multiUseCodes.length,
        codes: multiUseCodes.slice(0, 10).map(c => ({ code: c.code, max_uses: c.max_uses })),
        severity: 'MEDIUM'
      });
      auditResults.recommendations.push('Consider using single-use codes (max_uses=1) for better security');
    }

    // Check for weak codes (too short or predictable patterns)
    const weakCodes = allCodes.filter(c => c.code && (c.code.length < 6 || /^[A-Z0-9]{4}$/.test(c.code)));
    if (weakCodes.length > 0) {
      auditResults.security_issues.push({
        type: 'WEAK_CODE_FORMAT',
        count: weakCodes.length,
        severity: 'HIGH'
      });
      auditResults.recommendations.push('Use generateSecureReadingCode function for cryptographically secure codes (min 8 chars)');
    }

    // Check recent redemption attempts (brute-force detection)
    const recentAttempts = await base44.asServiceRole.entities.AuditLog.filter({
      action_type: { $in: ['CODE_REDEMPTION_ATTEMPT', 'BRUTE_FORCE_DETECTED'] }
    }, '-timestamp', 100);

    const failedAttempts = (recentAttempts || []).filter(a => 
      a.details && JSON.parse(a.details || '{}').result === 'FAILED'
    ).length;

    if (failedAttempts > 20) {
      auditResults.security_issues.push({
        type: 'HIGH_FAILED_ATTEMPTS',
        count: failedAttempts,
        severity: 'HIGH'
      });
      auditResults.recommendations.push('Investigate potential brute-force attacks');
    }

    // Summary statistics
    auditResults.summary = {
      redemption_rate: auditResults.total_codes > 0 
        ? ((auditResults.fully_redeemed_codes / auditResults.total_codes) * 100).toFixed(2) + '%'
        : '0%',
      unused_rate: auditResults.total_codes > 0
        ? ((auditResults.never_used_codes / auditResults.total_codes) * 100).toFixed(2) + '%'
        : '0%',
      security_score: auditResults.security_issues.length === 0 ? 'EXCELLENT' 
        : auditResults.security_issues.filter(i => i.severity === 'HIGH').length > 0 ? 'CRITICAL'
        : auditResults.security_issues.filter(i => i.severity === 'MEDIUM').length > 0 ? 'NEEDS_ATTENTION'
        : 'GOOD'
    };

    return Response.json(auditResults);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});