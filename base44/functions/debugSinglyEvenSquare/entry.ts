// ═══════════════════════════════════════════════════════════════
//  MAGIC SQUARE SINGLY-EVEN DEBUG
//  Detailed analysis of 10x10 and 14x14 square generation
// ═══════════════════════════════════════════════════════════════

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const testSizes = [10, 14];
    const results = [];

    for (const n of testSizes) {
      const h = n / 2;
      
      // Step 1: Generate base odd-order square (h x h)
      const baseOdd = siameseStd(h);
      
      // Step 2: Build singly-even square using Strachey method
      const square = singlyEvenStd(n);
      
      // Detailed analysis
      const expected_mc = n * (n * n + 1) / 2;
      const verification = verifySquare(square);
      
      // Row analysis
      const rowSums = square.map((row, i) => ({
        row_index: i,
        sum: row.reduce((s, v) => s + v, 0),
        values: row
      }));
      
      // Column analysis
      const colSums = Array.from({ length: n }, (_, j) => ({
        col_index: j,
        sum: square.reduce((s, row) => s + row[j], 0)
      }));
      
      // Check Strachey construction
      const quadrant_analysis = {
        top_left_sum: square.slice(0, h).slice(0, h).flat().reduce((s, v) => s + v, 0),
        top_right_sum: square.slice(0, h).map(row => row.slice(h, n)).flat().reduce((s, v) => s + v, 0),
        bottom_left_sum: square.slice(h, n).slice(0, h).map(row => row.slice(0, h)).flat().reduce((s, v) => s + v, 0),
        bottom_right_sum: square.slice(h, n).map(row => row.slice(h, n)).flat().reduce((s, v) => s + v, 0),
      };
      
      // Check swaps
      const k = Math.floor((n - 2) / 4);
      const mid = Math.floor(h / 2);
      
      results.push({
        size: `${n}×${n}`,
        h: h,
        k: k,
        mid: mid,
        expected_mc: expected_mc,
        actual_mc: verification.mc,
        verification: verification,
        row_sums_summary: rowSums.map(r => r.sum),
        col_sums_summary: colSums.map(c => c.sum),
        diag1_sum: square.reduce((s, row, i) => s + row[i], 0),
        diag2_sum: square.reduce((s, row, i) => s + row[n - 1 - i], 0),
        quadrant_analysis,
        algorithm: 'Singly-Even (Strachey)'
      });
    }

    return Response.json({
      status: 'success',
      detailed_analysis: results
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});

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