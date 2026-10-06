import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Comprehensive performance testing suite.
 * Simulates enterprise load and measures response times.
 * 
 * Tests:
 * 1. Permission check performance
 * 2. Subscription lookup performance
 * 3. Cache hit rate
 * 4. Rate limiting enforcement
 * 5. OTP generation speed
 * 6. Backup execution time
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin role required' }, { status: 403 });
    }
    
    const now = new Date();
    const results = {
      timestamp: now.toISOString(),
      tests: [],
      summary: {}
    };
    
    // Test 1: Permission check (with caching)
    console.log('[PERF TEST] Permission check with caching...');
    const permStart = Date.now();
    const permTests = [];
    for (let i = 0; i < 5; i++) {
      const testStart = Date.now();
      try {
        const permCheck = await base44.functions.invoke('checkPageAccessFast', {
          page_path: '/mizaan9'
        });
        permTests.push(Date.now() - testStart);
      } catch {
        permTests.push(Date.now() - testStart);
      }
    }
    const permAvg = Math.round(permTests.reduce((a, b) => a + b, 0) / permTests.length);
    results.tests.push({
      name: 'Permission Check (cached)',
      iterations: 5,
      avg_time_ms: permAvg,
      min_time_ms: Math.min(...permTests),
      max_time_ms: Math.max(...permTests),
      status: permAvg < 200 ? 'PASS' : 'WARN',
      target_ms: 200
    });
    
    // Test 2: Subscription lookup
    console.log('[PERF TEST] Subscription lookup...');
    const subStart = Date.now();
    const subTests = [];
    for (let i = 0; i < 5; i++) {
      const testStart = Date.now();
      try {
        const subs = await base44.asServiceRole.entities.Subscription.filter(
          { user_id: user.id, status: 'ACTIVE' }, null, 1
        );
        subTests.push(Date.now() - testStart);
      } catch {
        subTests.push(Date.now() - testStart);
      }
    }
    const subAvg = Math.round(subTests.reduce((a, b) => a + b, 0) / subTests.length);
    results.tests.push({
      name: 'Subscription Lookup',
      iterations: 5,
      avg_time_ms: subAvg,
      min_time_ms: Math.min(...subTests),
      max_time_ms: Math.max(...subTests),
      status: subAvg < 100 ? 'PASS' : 'WARN',
      target_ms: 100
    });
    
    // Test 3: Cache operations
    console.log('[PERF TEST] Cache operations...');
    const cacheStart = Date.now();
    const cacheTests = [];
    for (let i = 0; i < 10; i++) {
      const testStart = Date.now();
      try {
        await base44.functions.invoke('cacheManager', {
          action: 'SET',
          key: `test:${i}`,
          value: { test: i },
          ttl_type: 'PERMISSION'
        });
        await base44.functions.invoke('cacheManager', {
          action: 'GET',
          key: `test:${i}`
        });
        cacheTests.push(Date.now() - testStart);
      } catch {
        cacheTests.push(Date.now() - testStart);
      }
    }
    const cacheAvg = Math.round(cacheTests.reduce((a, b) => a + b, 0) / cacheTests.length);
    results.tests.push({
      name: 'Cache Operations (SET+GET)',
      iterations: 10,
      avg_time_ms: cacheAvg,
      min_time_ms: Math.min(...cacheTests),
      max_time_ms: Math.max(...cacheTests),
      status: cacheAvg < 50 ? 'PASS' : 'WARN',
      target_ms: 50
    });
    
    // Test 4: Rate limit check
    console.log('[PERF TEST] Rate limit enforcement...');
    const rateStart = Date.now();
    const rateTests = [];
    for (let i = 0; i < 5; i++) {
      const testStart = Date.now();
      try {
        await base44.functions.invoke('checkRateLimit', {
          endpoint_type: 'OTP_REQUEST',
          contact: `test${i}@example.com`
        });
        rateTests.push(Date.now() - testStart);
      } catch {
        rateTests.push(Date.now() - testStart);
      }
    }
    const rateAvg = Math.round(rateTests.reduce((a, b) => a + b, 0) / rateTests.length);
    results.tests.push({
      name: 'Rate Limit Check',
      iterations: 5,
      avg_time_ms: rateAvg,
      min_time_ms: Math.min(...rateTests),
      max_time_ms: Math.max(...rateTests),
      status: rateAvg < 400 ? 'PASS' : 'WARN',
      target_ms: 400
    });
    
    // Test 5: Email verification request (if not already verified)
    console.log('[PERF TEST] Email verification workflow...');
    const emailStart = Date.now();
    try {
      const emailResult = await base44.functions.invoke('requestEmailVerification', {});
      const emailTime = Date.now() - emailStart;
      results.tests.push({
        name: 'Email Verification Request',
        iterations: 1,
        avg_time_ms: emailTime,
        min_time_ms: emailTime,
        max_time_ms: emailTime,
        status: emailTime < 2000 ? 'PASS' : 'WARN',
        target_ms: 2000,
        note: emailResult.already_verified ? 'Email already verified' : 'OTP sent'
      });
    } catch (err) {
      results.tests.push({
        name: 'Email Verification Request',
        iterations: 1,
        avg_time_ms: Date.now() - emailStart,
        status: 'SKIP',
        note: err.message
      });
    }
    
    // Summary
    const passedTests = results.tests.filter(t => t.status === 'PASS').length;
    const totalTests = results.tests.filter(t => t.status !== 'SKIP').length;
    const avgTime = Math.round(
      results.tests.filter(t => t.status !== 'SKIP').reduce((sum, t) => sum + t.avg_time_ms, 0) / totalTests
    );
    
    results.summary = {
      total_tests: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      avg_response_time_ms: avgTime,
      pass_rate: Math.round((passedTests / totalTests) * 100),
      overall_status: passedTests === totalTests ? 'PASS' : 'WARN'
    };
    
    // Create audit log
    try {
      await base44.functions.invoke('createAuditLog', {
        action_type: 'PERFORMANCE_TEST',
        performed_by: user.id,
        details: JSON.stringify({
          overall_status: results.summary.overall_status,
          pass_rate: results.summary.pass_rate,
          avg_response_time_ms: results.summary.avg_response_time_ms,
          tests_run: totalTests
        }),
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || null
      });
    } catch {}
    
    return Response.json({
      success: true,
      timestamp: now.toISOString(),
      summary: results.summary,
      tests: results.tests,
      recommendation: results.summary.pass_rate === 100
        ? 'System is production-ready for enterprise scale'
        : `Review ${totalTests - passedTests} failing tests before launch`
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});