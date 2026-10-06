// ═══════════════════════════════════════════════════════════════
//  MAGIC SQUARE DIAGNOSTIC TEST
//  Tests square generation for all sizes to identify verification failures
// ═══════════════════════════════════════════════════════════════

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Test square generation for all sizes
    const testSizes = [5, 7, 10, 14];
    const results = [];

    for (const n of testSizes) {
      // Calculate magic constant for standard square (1..n²)
      const mc = n * (n * n + 1) / 2;
      const usurper = 1; // Standard square starts at 1
      
      // Generate base square using the same algorithms as msEngine.js
      let base;
      if (n % 2 === 1) {
        base = siameseStd(n);
      } else if (n % 4 === 0) {
        base = doublyEvenStd(n);
      } else {
        base = singlyEvenStd(n);
      }
      
      // Apply usurper shift
      const square = base.map(row => row.map(v => v - 1 + usurper));
      
      // Verify
      const verification = verifySquare(square);
      
      // Calculate detailed sums
      const rowSums = square.map(row => row.reduce((s, v) => s + v, 0));
      const colSums = Array.from({ length: n }, (_, j) => 
        square.reduce((s, row) => s + row[j], 0)
      );
      const d1Sum = square.reduce((s, row, i) => s + row[i], 0);
      const d2Sum = square.reduce((s, row, i) => s + row[n - 1 - i], 0);
      
      results.push({
        size: `${n}×${n}`,
        expected_mc: mc,
        actual_mc: verification.mc,
        row_sums: rowSums,
        col_sums: colSums,
        diag1_sum: d1Sum,
        diag2_sum: d2Sum,
        verification: verification,
        all_rows_match: rowSums.every(s => s === mc),
        all_cols_match: colSums.every(s => s === mc),
        diags_match: d1Sum === mc && d2Sum === mc,
        algorithm: n % 2 === 1 ? 'Siamese' : n % 4 === 0 ? 'Doubly-Even' : 'Singly-Even'
      });
    }

    return Response.json({
      status: 'success',
      test_date: new Date().toISOString(),
      results
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

// ── CONSTRUCTION ALGORITHMS (from msEngine.js) ──────────────────

function siameseStd(n) {
  const g = Array.from({ length: n }, () => Array(n).fill(0));
  let r = 0, c = Math.floor(n / 2);
  for (let k = 1; k <= n * n; k++) {
    g[r][c] = k;
    const nr = (r - 1 + n) % n, nc = (c + 1) % n;
    if (g[nr][nc] !== 0) r = (r + 1) % n;
    else { r = nr; c = nc; }
  }
  return g;
}

function doublyEvenStd(n) {
  const g = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) 
    for (let j = 0; j < n; j++) 
      g[i][j] = i * n + j + 1;
  
  for (let i = 0; i < n; i++) 
    for (let j = 0; j < n; j++) {
      const bi = i % 4, bj = j % 4;
      if (bi === bj || bi + bj === 3) 
        g[i][j] = n * n + 1 - g[i][j];
    }
  return g;
}

function singlyEvenStd(n) {
  const h = n / 2;
  const base = Array.from({ length: h }, () => Array(h).fill(0));
  let r = 0, c = Math.floor(h / 2);
  
  for (let k = 1; k <= h * h; k++) {
    base[r][c] = k;
    const nr = (r - 1 + h) % h, nc = (c + 1) % h;
    if (base[nr][nc] !== 0 || (nr === 0 && nc === Math.floor(h / 2))) 
      r = (r + 1) % h;
    else { r = nr; c = nc; }
  }
  
  const g = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < h; i++) 
    for (let j = 0; j < h; j++) {
      g[i][j] = base[i][j];
      g[i][j + h] = base[i][j] + 2 * h * h;
      g[i + h][j] = base[i][j] + h * h;
      g[i + h][j + h] = base[i][j] + 3 * h * h;
    }
  
  const k = Math.floor((n - 2) / 4), mid = Math.floor(h / 2);
  
  for (let i = 0; i < h; i++) 
    for (let j = 0; j < k; j++) {
      if (i === mid && j === 0) continue;
      [g[i][j], g[i + h][j]] = [g[i + h][j], g[i][j]];
    }
  
  [g[mid][k], g[mid + h][k]] = [g[mid + h][k], g[mid][k]];
  
  for (let i = 0; i < h; i++) 
    for (let j = n - k; j < n; j++) {
      [g[i][j], g[i + h][j]] = [g[i + h][j], g[i][j]];
    }
  
  return g;
}

function verifySquare(g) {
  const n = g.length;
  const mc = g[0].reduce((s, v) => s + v, 0);
  const rowOk = g.every(row => row.reduce((s, v) => s + v, 0) === mc);
  const colOk = Array.from({ length: n }, (_, j) => 
    g.reduce((s, row) => s + row[j], 0)
  ).every(s => s === mc);
  const d1Ok = g.reduce((s, row, i) => s + row[i], 0) === mc;
  const d2Ok = g.reduce((s, row, i) => s + row[n - 1 - i], 0) === mc;
  return { mc, rowOk, colOk, d1Ok, d2Ok, valid: rowOk && colOk && d1Ok && d2Ok };
}