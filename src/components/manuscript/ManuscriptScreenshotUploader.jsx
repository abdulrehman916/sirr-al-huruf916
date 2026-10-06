import { useState, useCallback, useRef } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle, FileImage, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useManuscriptScreenshotIngestion } from "@/hooks/useManuscriptScreenshotIngestion";

const DOMAIN_LABELS = {
  astro_clock: "Astro Clock",
  ihtilac: "İhtilâç (Body Twitching)",
  kiyafetname: "Kıyafetname (Physiognomy)",
  ear_ringing: "Ear Ringing",
  other: "Other Manuscript",
};

const DOMAIN_COLORS = {
  astro_clock: "#F5D060",
  ihtilac: "#60A5FA",
  kiyafetname: "#A78BFA",
  ear_ringing: "#34D399",
  other: "#F87171",
};

export default function ManuscriptScreenshotUploader() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sourceLabel, setSourceLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);
  const { state, result, error, ingest, reset } = useManuscriptScreenshotIngestion();

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setResults([]);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    setSelectedFiles(files);
    setResults([]);
  }, []);

  const processFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setResults([]);

    for (const file of selectedFiles) {
      try {
        // Step 1: Upload file
        const uploadRes = await base44.integrations.Core.UploadFile({ file });
        const fileUrl = uploadRes.file_url || uploadRes.data?.file_url;

        // Step 2: Classify + Ingest
        const ingestRes = await base44.functions.invoke('classifyAndIngestScreenshot', {
          file_url: fileUrl,
          source_label: sourceLabel || file.name
        });
        const data = ingestRes.data || ingestRes;

        setResults(prev => [...prev, {
          fileName: file.name,
          domain: data.domain,
          domainLabel: DOMAIN_LABELS[data.domain] || data.domain,
          domainColor: DOMAIN_COLORS[data.domain] || '#888',
          records_created: data.records_created || 0,
          records_merged: data.records_merged || 0,
          status: data.status,
          details: data.details || [],
          message: data.message,
          fileUrl
        }]);
      } catch (err) {
        setResults(prev => [...prev, {
          fileName: file.name,
          error: err.message || 'Processing failed',
          status: 'error'
        }]);
      }
    }
    setUploading(false);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [selectedFiles, sourceLabel]);

  const totalCreated = results.reduce((sum, r) => sum + (r.records_created || 0), 0);
  const totalMerged = results.reduce((sum, r) => sum + (r.records_merged || 0), 0);

  return (
    <div className="space-y-4">
      {/* Source label input */}
      <div>
        <label className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1.5 block" style={{ color: "rgba(212,175,55,0.55)" }}>
          Source Label (Book title + Page)
        </label>
        <input
          type="text"
          value={sourceLabel}
          onChange={(e) => setSourceLabel(e.target.value)}
          placeholder="e.g., Kenzül Havas p.1014"
          className="w-full px-3 py-2 rounded-xl font-inter text-xs"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(212,175,55,0.20)"
          }}
        />
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors"
        style={{
          borderColor: selectedFiles.length > 0 ? "rgba(212,175,55,0.50)" : "rgba(212,175,55,0.20)",
          background: "rgba(255,255,255,0.02)"
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        {selectedFiles.length > 0 ? (
          <div className="space-y-1">
            <FileImage className="w-6 h-6 mx-auto mb-2" style={{ color: "#F5D060" }} />
            <p className="font-inter text-xs font-bold" style={{ color: "#F5D060" }}>
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </p>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              {selectedFiles.map(f => f.name).join(', ')}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: "rgba(212,175,55,0.50)" }} />
            <p className="font-inter text-xs font-bold" style={{ color: "rgba(255,255,255,0.60)" }}>
              Drop screenshots here or click to select
            </p>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>
              PNG, JPG — multiple files supported
            </p>
          </div>
        )}
      </div>

      {/* Process button */}
      {selectedFiles.length > 0 && (
        <button
          onClick={processFiles}
          disabled={uploading}
          className="btn-gold w-full py-2.5 rounded-xl font-inter text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            <><Upload className="w-4 h-4" /> Classify & Ingest {selectedFiles.length} Screenshot{selectedFiles.length > 1 ? 's' : ''}</>
          )}
        </button>
      )}

      {/* Summary */}
      {results.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)" }}>
          <p className="font-inter text-xs font-bold mb-1" style={{ color: "#F5D060" }}>
            Session Summary
          </p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
            {results.length} screenshot{results.length > 1 ? 's' : ''} processed → {totalCreated} records created, {totalMerged} merged
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-none">
          {results.map((r, i) => (
            <div key={i} className="rounded-xl p-3" style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${r.error ? 'rgba(248,113,113,0.30)' : (r.domainColor || 'rgba(212,175,55,0.20)')}40`
            }}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.80)" }}>
                    {r.fileName}
                  </p>
                  {r.error ? (
                    <p className="font-inter text-[10px] flex items-center gap-1 mt-1" style={{ color: "#F87171" }}>
                      <AlertCircle className="w-3 h-3" /> {r.error}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded" style={{
                        background: (r.domainColor || '#888') + '15',
                        color: r.domainColor || '#888',
                        border: `1px solid ${(r.domainColor || '#888')}40`
                      }}>
                        {r.domainLabel || r.domain}
                      </span>
                      {r.records_created > 0 && (
                        <span className="font-inter text-[10px]" style={{ color: "#4ADE80" }}>
                          +{r.records_created} created
                        </span>
                      )}
                      {r.records_merged > 0 && (
                        <span className="font-inter text-[10px]" style={{ color: "#F5D060" }}>
                          ↪{r.records_merged} merged
                        </span>
                      )}
                      {r.status === 'no_knowledge_found' && (
                        <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                          No knowledge found
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {r.status === 'success' && !r.error && (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#4ADE80" }} />
                )}
              </div>
              {/* Detail entries */}
              {r.details && r.details.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {r.details.slice(0, 5).map((d, j) => (
                    <p key={j} className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                      • {d.body_part || d.trait || d.content_type || `W${d.weekday} ${d.period || ''} ${d.saat ? 'S' + d.saat : ''}`} — {d.action}
                    </p>
                  ))}
                  {r.details.length > 5 && (
                    <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                      ...and {r.details.length - 5} more
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}