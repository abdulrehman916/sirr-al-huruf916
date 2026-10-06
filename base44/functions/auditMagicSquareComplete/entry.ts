// ═══════════════════════════════════════════════════════════════
//  MAGIC SQUARE COMPREHENSIVE AUDIT
//  Tests ALL sizes 3×3 through 16×16
//  Verifies: rows, columns, diagonals, magic constants
// ═══════════════════════════════════════════════════════════════

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const auditResults = [];
    const algorithmStats = {
      odd: { count: 0, valid: 0, failed: [] },
      doublyEven: { count: 0, valid: 0, failed: [] },
      singlyEven: { count: 0, valid: 0, failed: [] }
    };

    // Test ALL sizes from 3 to 16
    for (let n = 3; n <= 16; n++) {
      const square = generateSquare(n, 1, 'fire');
      const expected_mc = n * (n * n + 1) / 2;
      const verification = verifySquare(square);
      
      const rowSums = square.map(row => row.reduce((s, v) => s + v, 0));
      const colSums = Array.from({ length: n }, (_, j) => 
        square.reduce((s, row) => s + row[j], 0)
      );
      const d1Sum = square.reduce((s, row, i) => s + row[i], 0);
      const d2Sum = square.reduce((s, row, i) => s + row[n - 1 - i], 0);
      
      let algorithm, algoKey;
      if (n % 2 === 1) { algorithm = 'odd'; algoKey = 'odd'; }
      else if (n % 4 === 0) { algorithm = 'doubly-even'; algoKey = 'doublyEven'; }
      else { algorithm = 'singly-even'; algoKey = 'singlyEven'; }
      
      algorithmStats[algoKey].count++;
      if (verification.valid) {
        algorithmStats[algoKey].valid++;
      } else {
        algorithmStats[algoKey].failed.push(n);
      }
      
      auditResults.push({
        size: `${n}×${n}`,
        n,
        algorithm,
        expected_mc,
        actual_mc: verification.mc,
        mc_match: verification.mc === expected_mc,
        valid: verification.valid,
        rowOk: verification.rowOk,
        colOk: verification.colOk,
        d1Ok: verification.d1Ok,
        d2Ok: verification.d2Ok,
        row_sums: rowSums,
        col_sums: colSums,
        diag1_sum: d1Sum,
        diag2_sum: d2Sum
      });
    }

    return Response.json({
      status: 'success',
      audit_timestamp: new Date().toISOString(),
      total_sizes_tested: auditResults.length,
      summary: {
        total_valid: auditResults.filter(r => r.valid).length,
        total_failed: auditResults.filter(r => !r.valid).length,
        algorithm_stats: algorithmStats
      },
      detailed_results: auditResults
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});

// ════════════════════════════════════════════════════════════════
//  SQUARE GENERATION ALGORITHMS (EXACT COPY from msEngine.js)
// ════════════════════════════════════════════════════════════════

function siameseStd(n) {
  const g = Array.from({length:n}, () => Array(n).fill(0));
  let r = 0, c = Math.floor(n/2);
  for (let k = 1; k <= n * n; k++) {
    g[r][c] = k;
    const nr = (r-1+n)%n, nc = (c+1)%n;
    if (g[nr][nc] !== 0) r = (r+1)%n;
    else { r = nr; c = nc; }
  }
  return g;
}

function doublyEvenStd(n) {
  const g = Array.from({length:n}, () => Array(n).fill(0));
  for (let i=0;i<n;i++) for (let j=0;j<n;j++) g[i][j] = i*n+j+1;
  for (let i=0;i<n;i++) for (let j=0;j<n;j++) {
    const bi=i%4, bj=j%4;
    if (bi===bj || bi+bj===3) g[i][j] = n*n+1-g[i][j];
  }
  return g;
}

function singlyEvenStd(n) {
  const h = n/2;
  const base = Array.from({length:h}, () => Array(h).fill(0));
  let r=0, c=Math.floor(h/2);
  for (let k=1;k<=h*h;k++) {
    base[r][c] = k;
    const nr=(r-1+h)%h, nc=(c+1)%h;
    if (base[nr][nc]!==0||(nr===0&&nc===Math.floor(h/2))) r=(r+1)%h;
    else { r=nr; c=nc; }
  }
  const g = Array.from({length:n}, () => Array(n).fill(0));
  // Strachey layout: A|C / D|B
  for (let i=0;i<h;i++) for (let j=0;j<h;j++) {
    g[i][j]       = base[i][j];         // A: top-left
    g[i][j+h]     = base[i][j] + 2*h*h; // C: top-right
    g[i+h][j]     = base[i][j] + 3*h*h; // D: bottom-left
    g[i+h][j+h]   = base[i][j] + h*h;   // B: bottom-right
  }
  const k = Math.floor((n-2)/4), mid = Math.floor(h/2);
  // Left swap: k columns A↔D
  for (let i=0;i<h;i++) for (let j=0;j<k;j++) {
    if (i===mid&&j===0) continue;
    [g[i][j],g[i+h][j]]=[g[i+h][j],g[i][j]];
  }
  // Middle swap: column k
  [g[mid][k],g[mid+h][k]]=[g[mid+h][k],g[mid][k]];
  // Right swap: k-1 columns C↔B
  for (let i=0;i<h;i++) for (let j=n-k+1;j<n;j++) {
    [g[i][j],g[i+h][j]]=[g[i+h][j],g[i][j]];
  }
  return g;
}

function buildBaseSquare(n) {
  if (n%2===1)     return siameseStd(n);
  if (n%4===0)     return doublyEvenStd(n);
  return singlyEvenStd(n);
}

function buildMagicSquare(n, usurper) {
  return buildBaseSquare(n).map(row => row.map(v => v - 1 + usurper));
}

function elementTransform(g, key) {
  const clone = () => g.map(row=>[...row]);
  if (key==="fire")  return clone();
  if (key==="air")   return clone().map(row=>[...row].reverse());
  if (key==="earth") return [...clone()].reverse();
  if (key==="water") return [...clone()].reverse().map(row=>[...row].reverse());
  return clone();
}

function generateSquare(n, usurper, elementKey) {
  return elementTransform(buildMagicSquare(n, usurper), elementKey);
}

function verifySquare(g) {
  const n = g.length;
  const mc = g[0].reduce((s,v)=>s+v,0);
  const rowOk = g.every(row=>row.reduce((s,v)=>s+v,0)===mc);
  const colOk = Array.from({length:n},(_,j)=>g.reduce((s,row)=>s+row[j],0)).every(s=>s===mc);
  const d1Ok  = g.reduce((s,row,i)=>s+row[i],0)===mc;
  const d2Ok  = g.reduce((s,row,i)=>s+row[n-1-i],0)===mc;
  return { mc, rowOk, colOk, d1Ok, d2Ok, valid: rowOk&&colOk&&d1Ok&&d2Ok };
}