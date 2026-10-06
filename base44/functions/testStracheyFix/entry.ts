// ═══════════════════════════════════════════════════════════════
//  MAGIC SQUARE STRACHEY FIX TEST
//  Testing corrected singly-even square generation
// ═══════════════════════════════════════════════════════════════

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Test with CORRECTED Strachey algorithm
    const testSizes = [10, 14];
    const results = [];

    for (const n of testSizes) {
      const square = singlyEvenCorrected(n);
      const expected_mc = n * (n * n + 1) / 2;
      const verification = verifySquare(square);
      
      const rowSums = square.map(row => row.reduce((s, v) => s + v, 0));
      const colSums = Array.from({ length: n }, (_, j) => 
        square.reduce((s, row) => s + row[j], 0)
      );
      const d1Sum = square.reduce((s, row, i) => s + row[i], 0);
      const d2Sum = square.reduce((s, row, i) => s + row[n - 1 - i], 0);
      
      results.push({
        size: `${n}×${n}`,
        expected_mc: expected_mc,
        actual_mc: verification.mc,
        row_sums: rowSums,
        col_sums: colSums,
        diag1_sum: d1Sum,
        diag2_sum: d2Sum,
        verification: verification,
        valid: verification.valid
      });
    }

    return Response.json({
      status: 'success',
      corrected_results: results
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

// CORRECTED Singly-even (Strachey) algorithm
function singlyEvenCorrected(n) {
  const h = n / 2;
  const base = Array.from({ length: h }, () => Array(h).fill(0));
  let r = 0, c = Math.floor(h / 2);
  
  // Build odd-order square for half-size
  for (let k = 1; k <= h * h; k++) {
    base[r][c] = k;
    const nr = (r - 1 + h) % h, nc = (c + 1) % h;
    if (base[nr][nc] !== 0 || (nr === 0 && nc === Math.floor(h / 2))) 
      r = (r + 1) % h;
    else { r = nr; c = nc; }
  }
  
  // Create 4 quadrants
  const g = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < h; i++) 
    for (let j = 0; j < h; j++) {
      g[i][j] = base[i][j];
      g[i][j + h] = base[i][j] + 2 * h * h;
      g[i + h][j] = base[i][j] + h * h;
      g[i + h][j + h] = base[i][j] + 3 * h * h;
    }
  
  // Calculate swap parameters
  const k = Math.floor((n - 2) / 4);
  const mid = Math.floor(h / 2);
  
  // Left-side swaps (k columns from left)
  for (let i = 0; i < h; i++) 
    for (let j = 0; j < k; j++) {
      if (i === mid && j === 0) continue;
      [g[i][j], g[i + h][j]] = [g[i + h][j], g[i][j]];
    }
  
  // Middle swap (single column)
  [g[mid][k], g[mid + h][k]] = [g[mid + h][k], g[mid][k]];
  
  // Right-side swaps (k-1 columns from right) - THIS IS THE FIX
  for (let i = 0; i < h; i++) 
    for (let j = n - k + 1; j < n; j++) {
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