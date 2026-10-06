// ═══════════════════════════════════════════════════════════════
//  ELEMENT TRANSFORMATION AUDIT
//  Tests whether element changes affect numbers or just positions
// ═══════════════════════════════════════════════════════════════

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const n = 5;
    const usurper = 1;
    
    const fire = generateSquare(n, usurper, 'fire');
    const air = generateSquare(n, usurper, 'air');
    const water = generateSquare(n, usurper, 'water');
    const earth = generateSquare(n, usurper, 'earth');
    
    const fireVals = fire.flat().sort((a,b) => a - b);
    const airVals = air.flat().sort((a,b) => a - b);
    
    const mc = sq => sq[0].reduce((s,v) => s + v, 0);
    const total = sq => sq.flat().reduce((s,v) => s + v, 0);
    
    const verify = sq => {
      const n = sq.length;
      const m = mc(sq);
      const rows = sq.map(r => r.reduce((s,v) => s + v, 0));
      const cols = Array.from({length: n}, (_, j) => sq.reduce((s, row) => s + row[j], 0));
      const d1 = sq.reduce((s, row, i) => s + row[i], 0);
      const d2 = sq.reduce((s, row, i) => s + row[n-1-i], 0);
      return { mc: m, rows, cols, d1, d2, valid: rows.every(r=>r===m) && cols.every(c=>c===m) && d1===m && d2===m };
    };
    
    return Response.json({
      status: 'success',
      test_size: `${n}×${n}`,
      usurper,
      value_sets: {
        fire_values: fireVals,
        air_values: airVals,
        values_identical: JSON.stringify(fireVals) === JSON.stringify(airVals)
      },
      magic_constants: {
        fire: mc(fire),
        air: mc(air),
        water: mc(water),
        earth: mc(earth),
        all_identical: mc(fire) === mc(air) && mc(fire) === mc(water) && mc(fire) === mc(earth)
      },
      total_sums: {
        fire: total(fire),
        air: total(air),
        water: total(water),
        earth: total(earth),
        all_identical: total(fire) === total(air) && total(fire) === total(water) && total(fire) === total(earth)
      },
      position_comparison: {
        fire_positions_match_air: JSON.stringify(fire) === JSON.stringify(air),
        fire_positions_match_water: JSON.stringify(fire) === JSON.stringify(water),
        fire_positions_match_earth: JSON.stringify(fire) === JSON.stringify(earth)
      },
      sum_verification: {
        fire: verify(fire),
        air: verify(air),
        water: verify(water),
        earth: verify(earth)
      },
      sample_squares: {
        fire, air, water, earth
      },
      transformation_rules: {
        fire: 'Original (no transformation)',
        air: 'Left-Right mirror (reverse each row)',
        water: '180° rotation (reverse rows + reverse each row)',
        earth: 'Top-Bottom mirror (reverse order of rows)'
      },
      conclusion: {
        numbers_change: false,
        positions_change: true,
        magic_constant_preserved: true,
        all_sums_preserved: true,
        summary: 'Element transformations change ONLY cell positions. All numbers remain IDENTICAL. Magic constant and all row/column/diagonal sums remain IDENTICAL across Fire, Air, Water, and Earth.'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});

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
  for (let i=0;i<h;i++) for (let j=0;j<h;j++) {
    g[i][j]       = base[i][j];
    g[i][j+h]     = base[i][j] + 2*h*h;
    g[i+h][j]     = base[i][j] + 3*h*h;
    g[i+h][j+h]   = base[i][j] + h*h;
  }
  const k = Math.floor((n-2)/4), mid = Math.floor(h/2);
  for (let i=0;i<h;i++) for (let j=0;j<k;j++) {
    if (i===mid&&j===0) continue;
    [g[i][j],g[i+h][j]]=[g[i+h][j],g[i][j]];
  }
  [g[mid][k],g[mid+h][k]]=[g[mid+h][k],g[mid][k]];
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