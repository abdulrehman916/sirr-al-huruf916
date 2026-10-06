// ═══════════════════════════════════════════════════════════════
//  MAGIC SQUARE FORENSIC AUDIT
//  Traces: Generation → Display → Validation pipeline
//  Identifies exact point of failure
// ═══════════════════════════════════════════════════════════════

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const auditResults = [];
    const testSizes = [6, 10, 14];

    for (const n of testSizes) {
      const result = await forensicAudit(n);
      auditResults.push(result);
    }

    return Response.json({
      status: 'success',
      audit_timestamp: new Date().toISOString(),
      forensic_analysis: auditResults
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});

async function forensicAudit(n) {
  // Step 1: Generate the square
  const square = generateSquare(n, 1, 'fire');
  
  // Step 2: Calculate expected magic constant
  const expected_mc = n * (n * n + 1) / 2;
  
  // Step 3: Verify the square in memory (immediate)
  const immediate_verification = verifySquare(square, 'immediate');
  
  // Step 4: Calculate all sums manually
  const rowSums = square.map((row, i) => ({
    row_index: i,
    values: row,
    sum: row.reduce((s, v) => s + v, 0)
  }));
  
  const colSums = Array.from({ length: n }, (_, j) => ({
    col_index: j,
    values: square.map(row => row[j]),
    sum: square.reduce((s, row) => s + row[j], 0)
  }));
  
  const d1Values = square.map((row, i) => row[i]);
  const d1Sum = d1Values.reduce((s, v) => s + v, 0);
  
  const d2Values = square.map((row, i) => row[n - 1 - i]);
  const d2Sum = d2Values.reduce((s, v) => s + v, 0);
  
  // Step 5: Find first mismatch
  const firstRowMismatch = rowSums.findIndex(r => r.sum !== expected_mc);
  const firstColMismatch = colSums.findIndex(c => c.sum !== expected_mc);
  
  // Step 6: Check for duplicate values (should be 1..n² exactly once)
  const allValues = square.flat().sort((a, b) => a - b);
  const expectedValues = Array.from({ length: n * n }, (_, i) => i + 1);
  const valuesMatch = JSON.stringify(allValues) === JSON.stringify(expectedValues);
  const missingValues = expectedValues.filter(v => !allValues.includes(v));
  const duplicateValues = allValues.filter((v, i) => allValues.indexOf(v) !== i);
  
  // Step 7: Check magic constant calculation
  const calculated_mc_from_first_row = rowSums[0].sum;
  const mc_calculation_correct = calculated_mc_from_first_row === expected_mc;
  
  return {
    size: `${n}×${n}`,
    n,
    expected_magic_constant: expected_mc,
    
    // Generation check
    square_generated: true,
    total_cells: square.length * square[0].length,
    
    // Value integrity
    values_integrity: {
      all_values_present: valuesMatch,
      missing_values: missingValues,
      duplicate_values: duplicateValues,
      value_range: { min: allValues[0], max: allValues[allValues.length - 1] }
    },
    
    // Magic constant verification
    magic_constant_check: {
      calculated_from_first_row: calculated_mc_from_first_row,
      expected: expected_mc,
      calculation_correct: mc_calculation_correct
    },
    
    // Row analysis
    rows: {
      all_valid: rowSums.every(r => r.sum === expected_mc),
      first_mismatch_index: firstRowMismatch,
      first_mismatch_value: firstRowMismatch >= 0 ? rowSums[firstRowMismatch].sum : null,
      total_rows: rowSums.length,
      valid_rows: rowSums.filter(r => r.sum === expected_mc).length,
      failed_rows: rowSums.filter(r => r.sum !== expected_mc).length
    },
    
    // Column analysis
    columns: {
      all_valid: colSums.every(c => c.sum === expected_mc),
      first_mismatch_index: firstColMismatch,
      first_mismatch_value: firstColMismatch >= 0 ? colSums[firstColMismatch].sum : null,
      total_columns: colSums.length,
      valid_columns: colSums.filter(c => c.sum === expected_mc).length,
      failed_columns: colSums.filter(c => c.sum !== expected_mc).length
    },
    
    // Diagonal analysis
    diagonals: {
      d1: {
        values: d1Values,
        sum: d1Sum,
        valid: d1Sum === expected_mc
      },
      d2: {
        values: d2Values,
        sum: d2Sum,
        valid: d2Sum === expected_mc
      }
    },
    
    // Immediate verification (in-memory)
    immediate_verification: {
      magic_constant: immediate_verification.mc,
      rows_ok: immediate_verification.rowOk,
      cols_ok: immediate_verification.colOk,
      d1_ok: immediate_verification.d1Ok,
      d2_ok: immediate_verification.d2Ok,
      valid: immediate_verification.valid
    },
    
    // Summary
    overall_valid: immediate_verification.valid,
    failure_points: []
  };
}

function verifySquare(g, label = '') {
  const n = g.length;
  const mc = g[0].reduce((s,v)=>s+v,0);
  const rowOk = g.every(row=>row.reduce((s,v)=>s+v,0)===mc);
  const colOk = Array.from({length:n},(_,j)=>g.reduce((s,row)=>s+row[j],0)).every(s=>s===mc);
  const d1Ok  = g.reduce((s,row,i)=>s+row[i],0)===mc;
  const d2Ok  = g.reduce((s,row,i)=>s+row[n-1-i],0)===mc;
  return { mc, rowOk, colOk, d1Ok, d2Ok, valid: rowOk&&colOk&&d1Ok&&d2Ok };
}

// ════════════════════════════════════════════════════════════════
//  SQUARE GENERATION (COPIED from msEngine.js - CORRECTED VERSION)
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