import { useState, useRef } from "react";
import { Plus, X, ChevronUp, ChevronDown, Play, FileText, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

function SectionLabel({ children }) {
  return (
    <p className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: G.text }}>
      {children}
    </p>
  );
}

/**
 * Media Manager tab — images (add URL, reorder, preview, delete),
 * videos (YouTube/Vimeo/direct URL), and PDF attachment.
 */
export default function MediaTab({ form, setForm }) {
  const { toast } = useToast();
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const result = await base44.integrations.Core.UploadFile({ file });
        if (result?.file_url) {
          setForm(prev => ({ ...prev, images: [...(prev.images || []), result.file_url] }));
        }
      }
      toast({ title: `${files.length} image(s) uploaded` });
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result?.file_url) {
        setForm(prev => ({ ...prev, pdf_url: result.file_url }));
        toast({ title: "PDF uploaded" });
      }
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const setThumbnail = (idx) => {
    setForm({ ...form, thumbnail_index: idx });
  };

  const addImage = () => {
    if (!imageUrlInput.trim()) return;
    setForm({ ...form, images: [...(form.images || []), imageUrlInput.trim()] });
    setImageUrlInput("");
  };

  const removeImage = (idx) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const moveImage = (idx, dir) => {
    const images = [...form.images];
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    [images[idx], images[target]] = [images[target], images[idx]];
    setForm({ ...form, images });
  };

  const addVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    if (!(form.video_urls || []).includes(videoUrlInput.trim())) {
      setForm({ ...form, video_urls: [...(form.video_urls || []), videoUrlInput.trim()] });
    }
    setVideoUrlInput("");
  };

  const removeVideoUrl = (idx) => {
    setForm({ ...form, video_urls: (form.video_urls || []).filter((_, i) => i !== idx) });
  };

  const images = form.images || [];
  const videoUrls = form.video_urls || [];

  return (
    <div className="space-y-4">
      {/* Images */}
      <div className="space-y-2">
        <SectionLabel>Images ({images.length})</SectionLabel>
        <div className="flex gap-2">
          <input
            value={imageUrlInput}
            onChange={e => setImageUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addImage()}
            placeholder="Paste image URL..."
            className="form-input flex-1"
          />
          <button onClick={addImage} className="px-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <Plus className="w-4 h-4" style={{ color: G.text }} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-3 rounded-lg flex items-center gap-1 disabled:opacity-40" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: G.text }} /> : <Upload className="w-4 h-4" style={{ color: G.text }} />}
          </button>
        </div>
        {images.length > 0 && (
          <div className="space-y-1.5">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${idx === 0 ? G.border : G.faint}` }}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="font-inter text-[10px] truncate flex-1" style={{ color: (form.thumbnail_index || 0) === idx ? G.text : "rgba(255,255,255,0.45)" }}>
                  {(form.thumbnail_index || 0) === idx ? "★ Thumbnail" : `Image ${idx + 1}`}
                </span>
                {(form.thumbnail_index || 0) !== idx && (
                  <button onClick={() => setThumbnail(idx)} className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: G.bg, border: `1px solid ${G.faint}`, color: G.dim }}>Set Thumb</button>
                )}
                {/* Reorder */}
                <button onClick={() => moveImage(idx, -1)} disabled={idx === 0} className="p-1 rounded disabled:opacity-20">
                  <ChevronUp className="w-3 h-3" style={{ color: G.dim }} />
                </button>
                <button onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1} className="p-1 rounded disabled:opacity-20">
                  <ChevronDown className="w-3 h-3" style={{ color: G.dim }} />
                </button>
                <button onClick={() => removeImage(idx)} className="p-1 rounded">
                  <X className="w-3 h-3" style={{ color: "#F87171" }} />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length === 0 && (
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            <ImageIcon className="w-3 h-3 inline mr-1" />No images yet. Add image URLs above. First image is the primary thumbnail.
          </p>
        )}
      </div>

      {/* Videos */}
      <div className="space-y-2">
        <SectionLabel>Product Videos ({videoUrls.length})</SectionLabel>
        <div className="flex gap-2">
          <input
            value={videoUrlInput}
            onChange={e => setVideoUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addVideoUrl()}
            placeholder="YouTube, Vimeo, or direct video URL..."
            className="form-input flex-1"
          />
          <button onClick={addVideoUrl} className="px-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <Plus className="w-4 h-4" style={{ color: G.text }} />
          </button>
        </div>
        {videoUrls.length > 0 && (
          <div className="space-y-1">
            {videoUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.faint}` }}>
                <Play className="w-3 h-3 flex-shrink-0" style={{ color: G.dim }} />
                <span className="font-inter text-[10px] truncate flex-1" style={{ color: "rgba(255,255,255,0.45)" }}>{url}</span>
                <button onClick={() => removeVideoUrl(idx)}><X className="w-3 h-3" style={{ color: "#F87171" }} /></button>
              </div>
            ))}
          </div>
        )}
        {/* Legacy single video URL */}
        <div className="space-y-1 pt-1">
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.30)" }}>Legacy Video URL (single)</p>
          <input
            value={form.video_url || ""}
            onChange={e => setForm({ ...form, video_url: e.target.value })}
            className="form-input"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </div>

      {/* PDF */}
      <div className="space-y-2">
        <SectionLabel>PDF Attachment</SectionLabel>
        <div className="flex gap-2">
          <input
            value={form.pdf_url || ""}
            onChange={e => setForm({ ...form, pdf_url: e.target.value })}
            className="form-input flex-1"
            placeholder="https://.../datasheet.pdf"
          />
          <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
          <button onClick={() => pdfInputRef.current?.click()} disabled={uploadingPdf} className="px-3 rounded-lg flex items-center gap-1 disabled:opacity-40" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: G.text }} /> : <Upload className="w-4 h-4" style={{ color: G.text }} />}
          </button>
        </div>
        {form.pdf_url && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.faint}` }}>
            <FileText className="w-3 h-3 flex-shrink-0" style={{ color: "#F87171" }} />
            <span className="font-inter text-[10px] truncate flex-1" style={{ color: "rgba(255,255,255,0.45)" }}>{form.pdf_url}</span>
          </div>
        )}
      </div>

      {/* Seller Contact */}
      <div className="space-y-2">
        <SectionLabel>Seller Contact (for inquiries)</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={form.seller_whatsapp || ""}
            onChange={e => setForm({ ...form, seller_whatsapp: e.target.value })}
            className="form-input"
            placeholder="WhatsApp: 97150XXXXXXX"
          />
          <input
            value={form.seller_email || ""}
            onChange={e => setForm({ ...form, seller_email: e.target.value })}
            className="form-input"
            placeholder="seller@example.com"
          />
        </div>
      </div>
    </div>
  );
}