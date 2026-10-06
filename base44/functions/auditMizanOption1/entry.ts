import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { 
  runMizaanPostPipeline, 
  getBastLevel,
} from '../src/lib/mizaanPostEngine.js';

/**
 * Audit function to verify Mizan Option 1 Value 1 calculation
 * Returns detailed breakdown of all expanded letters and their First Bast values
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { grandBast, grandLetters, dominant = 'fire' } = body;

    if (!grandBast || grandBast <= 0) {
      return Response.json({ error: 'Invalid grandBast value' }, { status: 400 });
    }

    // Run the pipeline
    const pipeline = runMizaanPostPipeline({ grandBast, grandLetters, dominant });
    
    if (!pipeline) {
      return Response.json({ error: 'Pipeline failed' }, { status: 500 });
    }

    const { kitabet, expandedLettersSum } = pipeline;
    const expandedLetters = kitabet.finalExpandedLetters || [];

    // Build detailed breakdown
    const breakdown = expandedLetters.map((letter, idx) => ({
      position: idx + 1,
      letter,
      value1: getBastLevel(letter, 1),
    }));

    // Calculate verification total
    const calculatedTotal = breakdown.reduce((sum, item) => sum + item.value1, 0);

    // Verify against pipeline total
    const isMatch = calculatedTotal === (expandedLettersSum || 0);

    return Response.json({
      success: true,
      audit: {
        input: {
          grandBast,
          grandLetters,
          dominant,
        },
        expandedLetters: {
          total: expandedLetters.length,
          letters: breakdown,
        },
        vefkSource: {
          displayed: expandedLettersSum,
          calculated: calculatedTotal,
          match: isMatch,
        },
        verification: {
          status: isMatch ? '✓ VERIFIED' : '✗ MISMATCH',
          formula: 'Σ First Bast(Level 1) of all expanded letters',
        }
      }
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});