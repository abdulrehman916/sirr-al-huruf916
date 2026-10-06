// Test 6x6 singly-even square generation
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const n = 6;
    const h = n / 2; // 3
    const k = Math.floor((n - 2) / 4); // 1
    const mid = Math.floor(h / 2); // 1
    
    // Build base 3x3 using Siamese
    const base = Array.from({ length: h }, () => Array(h).fill(0));
    let r = 0, c = Math.floor(h / 2);
    for (let k_val = 1; k_val <= h * h; k_val++) {
      base[r][c] = k_val;
      const nr = (r - 1 + h) % h, nc = (c + 1) % h;
      if (base[nr][nc] !== 0 || (nr === 0 && nc === Math.floor(h / 2))) 
        r = (r + 1) % h;
      else { r = nr; c = nc; }
    }
    
    // Create 4 quadrants
    const g = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < h; i++) 
      for (let j = 0; j < h; j++) {
        g[i][j] = base[i][j];         // A: 1..9
        g[i + h][j + h] = base[i][j] + h * h;     // B: 10..18
        g[i + h][j] = base[i][j] + 2 * h * h;     // C: 19..27
        g[i][j + h] = base[i][j] + 3 * h * h;     // D: 28..36
      }
    
    // Strachey swaps
    // Left: swap k columns between A(top) and C(bottom)
    for (let i = 0; i < h; i++) 
      for (let j = 0; j < k; j++) {
        if (i === mid && j === 0) continue;
        [g[i][j], g[i + h][j]] = [g[i + h][j], g[i][j]];
      }
    
    // Middle of column 0
    [g[mid][0], g[mid + h][0]] = [g[mid + h][0], g[mid][0]];
    
    // Central cell
    [g[mid][mid], g[mid + h][mid]] = [g[mid + h][mid], g[mid][mid]];
    
    // Right: swap k-1 columns between D(top) and B(bottom)
    for (let i = 0; i < h; i++) 
      for (let j = n - k + 1; j < n; j++) {
        [g[i][j], g[i + h][j]] = [g[i + h][j], g[i][j]];
      }
    
    // Verify
    const expected_mc = n * (n * n + 1) / 2; // 111
    const rowSums = g.map(row => row.reduce((s, v) => s + v, 0));
    const colSums = Array.from({ length: n }, (_, j) => g.reduce((s, row) => s + row[j], 0));
    const d1Sum = g.reduce((s, row, i) => s + row[i], 0);
    const d2Sum = g.reduce((s, row, i) => s + row[n - 1 - i], 0);
    
    return Response.json({
      status: 'success',
      base_square: base,
      final_square: g,
      expected_mc,
      actual_mc: rowSums[0],
      row_sums: rowSums,
      col_sums: colSums,
      diag1: d1Sum,
      diag2: d2Sum,
      valid: rowSums.every(s => s === expected_mc) && colSums.every(s => s === expected_mc) && d1Sum === expected_mc && d2Sum === expected_mc,
      params: { n, h, k, mid }
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});