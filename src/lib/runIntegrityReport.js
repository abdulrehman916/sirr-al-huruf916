// ═══════════════════════════════════════════════════════════════
// SIRR AL-HURUF — INTEGRITY REPORT RUNNER
//
// How to use during development / deployment review:
//
//   import { runIntegrityReport } from '@/lib/runIntegrityReport';
//   runIntegrityReport();    // prints to console
//
// Or from any component (dev-only):
//   import { runIntegrityReport } from '@/lib/runIntegrityReport';
//   useEffect(() => { if (import.meta.env.DEV) runIntegrityReport(); }, []);
//
// The report will appear in the browser console (or terminal).
// Zero runtime effect — all checks are read-only comparisons.
// ═══════════════════════════════════════════════════════════════

import { generateDeploymentReport } from './coreEngineProtection';

// ── Import all engine datasets for live spot-checking ──────────
import { KABIR_MAP, SAGHIR_MAP, BAST_TABLE } from './abjadModes';
import { MIZAAN_ELEMENTS } from './mizaan9Engine';
import { BAST_LOOKUP }  from './bastHuroofData';
import { FAAL_CELLS }   from './faalHasrathData';
import { LUQMAN_CELLS } from './faalLuqmanData';

/**
 * Run the full integrity report and print to console.
 * Pass an optional array of changed file paths to classify them.
 *
 * @param {string[]} changedFiles - optional list of files changed in this deploy
 * @param {string}   deployVersion - optional version label
 */
export function runIntegrityReport(changedFiles = [], deployVersion = 'dev') {
  const report = generateDeploymentReport({
    engines: {
      ABJAD: {
        KABIR_MAP,
        SAGHIR_MAP,
        BAST_TABLE,
      },
      MIZAAN: {
        MIZAAN_ELEMENTS,
      },
      BAST_HUROOF: {
        BAST_LOOKUP,
      },
      FAAL_ALI: {
        FAAL_CELLS,
      },
      FAAL_LUQMAN: {
        LUQMAN_CELLS,
      },
    },
    changedFiles,
    deployVersion,
  });

  console.log(report);
  return report;
}