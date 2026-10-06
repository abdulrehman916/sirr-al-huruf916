import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Hook for the multi-domain manuscript screenshot ingestion pipeline.
 * Calls classifyAndIngestScreenshot backend function which:
 * 1. Classifies the screenshot into the correct knowledge domain
 * 2. Extracts structured data via vision LLM
 * 3. Merges into the correct canonical entity (IhtilacKnowledge, KiyafetnameKnowledge, etc.)
 */
export function useManuscriptScreenshotIngestion() {
  const [state, setState] = useState('idle'); // idle | uploading | classifying | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const ingest = useCallback(async (fileUrl, sourceLabel) => {
    if (!fileUrl) return;
    setState('classifying');
    setError(null);
    setResult(null);
    try {
      const response = await base44.functions.invoke('classifyAndIngestScreenshot', {
        file_url: fileUrl,
        source_label: sourceLabel || 'Screenshot Upload'
      });
      const data = response.data || response;
      setResult(data);
      setState(data.status === 'no_knowledge_found' ? 'done' : 'done');
    } catch (err) {
      setError(err.message || 'Ingestion failed');
      setState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  return { state, result, error, ingest, reset };
}