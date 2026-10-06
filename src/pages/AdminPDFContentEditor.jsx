import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Upload, CheckCircle, Loader2, FileText, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
};

export default function AdminPDFContentEditor() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const checkAdmin = async () => {
    try {
      const user = await base44.auth.me();
      if (!["owner", "admin"].includes(user?.role)) { setIsAdmin(false); return; }
      setIsAdmin(true);
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      
      const newUrls = [...uploadedUrls];
      newUrls[index] = {
        url: result.file_url,
        name: file.name.replace('.pdf', '').toLowerCase().replace(/[^a-z0-9]/g, '_'),
        fileName: file.name
      };
      setUploadedUrls(newUrls);
      
      toast({ title: "✓ PDF uploaded", description: file.name });
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removePdf = (index) => {
    const newUrls = [...uploadedUrls];
    newUrls[index] = null;
    setUploadedUrls(newUrls);
  };

  const handleAutoImport = async () => {
    const validUrls = uploadedUrls.filter(u => u && u.url);
    if (validUrls.length === 0) {
      toast({ title: "No PDFs", description: "Upload PDFs first", variant: "destructive" });
      return;
    }

    setImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const result = await base44.functions.invoke('autoImportHolyNamesFromPDF', {
        pdf_urls: validUrls
      });

      setImportResult(result.data);
      toast({ 
        title: "✓ Import Complete", 
        description: `${result.data.count} names imported automatically`
      });
    } catch (err) {
      setError(`Import failed: ${err.message}`);
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  if (isAdmin === false) return <Navigate to="/" replace />;
  if (isAdmin === null) {
    checkAdmin();
    return (
      <AdminLayout title="Loading...">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Automatic PDF Import" subtitle="Section B - Fully Automatic Holy Names Import">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Info Box */}
        <div className="rounded-xl border p-4" style={{ background: G.bg, borderColor: G.border }}>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 flex-shrink-0" style={{ color: G.text }} />
            <div className="text-sm text-white/60">
              <p className="font-semibold mb-2" style={{ color: G.text }}>Fully Automatic Import Process:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Upload your PDF files below (all 3 PDFs)</li>
                <li>Click "Start Automatic Import"</li>
                <li>System will read each PDF page-by-page</li>
                <li>Extract ALL Holy Names with complete content</li>
                <li>Translate everything to Malayalam automatically</li>
                <li>Import into database with full structure preserved</li>
                <li>No manual work required - 100% automatic</li>
              </ol>
              <p className="text-xs text-white/40 mt-2">
                ⏱️ Processing time: 2-5 minutes per PDF (depends on size)
              </p>
            </div>
          </div>
        </div>

        {/* PDF Upload Section */}
        <div className="space-y-3">
          <h3 className="font-inter font-semibold text-white text-sm">Upload PDF Files</h3>
          
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="rounded-xl border p-4" style={{ 
              background: uploadedUrls[idx] ? "rgba(34,197,94,0.06)" : G.bg,
              borderColor: uploadedUrls[idx] ? "rgba(34,197,94,0.30)" : G.border
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                    background: uploadedUrls[idx] ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"
                  }}>
                    <FileText className={`w-5 h-5 ${uploadedUrls[idx] ? 'text-green-400' : 'text-white/30'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {uploadedUrls[idx]?.fileName || `PDF File ${idx + 1}`}
                    </p>
                    <p className="text-xs text-white/30">
                      {uploadedUrls[idx] ? 'Ready for import' : 'Upload PDF (pages range)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {uploadedUrls[idx] && (
                    <button
                      onClick={() => removePdf(idx)}
                      className="p-2 rounded-lg hover:bg-white/5"
                    >
                      <X className="w-4 h-4 text-white/40" />
                    </button>
                  )}
                  <label className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-dashed text-xs cursor-pointer transition-all"
                    style={{
                      background: uploadedUrls[idx] ? "rgba(34,197,94,0.10)" : "rgba(255,255,255,0.03)",
                      borderColor: uploadedUrls[idx] ? "rgba(34,197,94,0.40)" : "rgba(255,255,255,0.15)",
                      color: uploadedUrls[idx] ? "#4ade80" : "rgba(255,255,255,0.40)"
                    }}
                  >
                    {uploading ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    ) : (
                      <Upload className="w-3 h-3 mr-2" />
                    )}
                    {uploadedUrls[idx] ? 'Replace' : 'Upload PDF'}
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, idx)}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Import Button */}
        <div className="pt-4">
          <Button
            onClick={handleAutoImport}
            disabled={importing || uploadedUrls.filter(u => u).length === 0}
            className="w-full py-4 rounded-xl font-inter font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ 
              background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", 
              color: "#0d1b2a" 
            }}
          >
            {importing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing PDFs... (This may take 2-5 minutes)
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Start Automatic Import
              </>
            )}
          </Button>
          <p className="text-xs text-white/30 text-center mt-2">
            The system will extract ALL names with complete content automatically
          </p>
        </div>

        {/* Results */}
        {importResult && (
          <div className="space-y-4 pt-4 border-t" style={{ borderColor: G.border }}>
            <h3 className="font-inter font-semibold text-white text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Import Results
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3 text-center" style={{ background: G.bg, borderColor: G.border }}>
                <p className="text-2xl font-bold text-gold">{importResult.count}</p>
                <p className="text-xs text-white/40">Names Imported</p>
              </div>
              <div className="rounded-xl border p-3 text-center" style={{ background: G.bg, borderColor: G.border }}>
                <p className="text-2xl font-bold text-gold">{importResult.global_order_reached}</p>
                <p className="text-xs text-white/40">Total in Database</p>
              </div>
            </div>

            <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2">
              {importResult.imported_names?.filter(n => !n.error).map((name, i) => (
                <div key={i} className="rounded-xl border p-3" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-amiri text-gold font-bold">{name.arabic_name}</span>
                      {name.has_complete_content && (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-white/30">
                      Page {name.source_pdf_page}
                    </span>
                  </div>
                  <div className="flex gap-2 text-[9px] text-white/30">
                    <span>Explanation: {(name.content_length?.explanation || 0) / 1000}k chars</span>
                    <span>Virtues: {(name.content_length?.virtues || 0) / 1000}k chars</span>
                  </div>
                </div>
              ))}
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="rounded-xl border p-3" style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.30)" }}>
                <p className="text-xs text-red-400 font-semibold mb-2">Errors:</p>
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-300">{err.pdf}: {err.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl border p-3" style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.30)" }}>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

      </motion.div>
    </AdminLayout>
  );
}