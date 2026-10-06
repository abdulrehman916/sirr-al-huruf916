import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Send, Upload, FileText, Image, ArrowLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

const CATEGORIES = [
  { value: "Bug Report", label: "Bug Report", icon: "🐛" },
  { value: "Feature Request", label: "Feature Request", icon: "✨" },
  { value: "Content Correction", label: "Content Correction", icon: "📝" },
  { value: "Access Problem", label: "Access Problem", icon: "🔒" },
  { value: "General Question", label: "General Question", icon: "❓" },
];

const G = {
  border: "rgba(212,175,55,0.35)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
};

export default function SupportTicket() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketIdState] = useState("");

  const [form, setForm] = useState({
    name: "", mobile: "", email: "", category: "", subject: "", message: "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const valid = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (!valid.includes(file.type)) {
      toast({ title: "Invalid File", description: "JPG, PNG, GIF, or PDF only.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Too Large", description: "Max 10MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ url: res.file_url, name: file.name, type: file.type });
    } catch (err) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.email || !form.category || !form.subject || !form.message) {
      toast({ title: "Missing Info", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Use timestamp-based ID instead of counting all tickets — O(1) vs O(n)
      const ts = Date.now().toString(36).toUpperCase();
      const tid = `SUP-${ts.slice(-6)}`;
      await base44.entities.SupportTickets.create({
        ticket_id: tid,
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        category: form.category,
        subject: form.subject,
        message: form.message,
        attachment_url: uploadedFile?.url || null,
        status: "OPEN",
        created_at: new Date().toISOString(),
      });
      setTicketIdState(tid);
      setSubmitted(true);
      toast({ title: "Ticket Created!", description: `#${tid} — we'll respond soon.`,
        action: <ToastAction altText="Copy" onClick={() => navigator.clipboard.writeText(tid)}>Copy ID</ToastAction> });
    } catch (err) {
      toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.40)" }}>
            <Send className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="font-inter font-bold text-white text-lg mb-2">Ticket Submitted</h2>
          <p className="font-mono text-sm mb-1" style={{ color: G.text }}>{ticketId}</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>We'll respond within 24-48 hours.</p>
          <Link to="/support" className="mt-6">
            <Button variant="outline" className="border-gold text-gold">Back to Support</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageTitle arabic="طلب تذكرة" latin="TICKET REQUEST" subtitle="Submit a detailed support ticket" icon="🎫" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
        <Link to="/support" className="inline-flex items-center gap-1.5 text-xs mb-5" style={{ color: G.dim }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Support
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.8rem" }}>Full Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name"
                className="mt-1 bg-white/5 border-white/10 text-white h-11" />
            </div>
            <div>
              <Label style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.8rem" }}>Mobile *</Label>
              <Input value={form.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="+971 50 123 4567"
                className="mt-1 bg-white/5 border-white/10 text-white h-11" />
            </div>
          </div>

          <div>
            <Label style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.8rem" }}>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com"
              className="mt-1 bg-white/5 border-white/10 text-white h-11" />
          </div>

          <div>
            <Label style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.8rem" }}>Category *</Label>
            <Select value={form.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white h-11">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.8rem" }}>Subject *</Label>
            <Input value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="Brief summary"
              className="mt-1 bg-white/5 border-white/10 text-white h-11" />
          </div>

          <div>
            <Label style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.8rem" }}>Message *</Label>
            <Textarea value={form.message} onChange={(e) => update("message", e.target.value)}
              placeholder="Describe your issue in detail..."
              className="mt-1 bg-white/5 border-white/10 text-white min-h-[140px]" />
          </div>

          <div className="border-2 border-dashed rounded-xl p-4 text-center" style={{ borderColor: G.border }}>
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                {uploadedFile.type.includes("image") ? <Image className="w-5 h-5" style={{ color: G.text }} />
                  : <FileText className="w-5 h-5" style={{ color: G.text }} />}
                <span className="text-white/80 text-sm">{uploadedFile.name}</span>
                <button type="button" onClick={() => setUploadedFile(null)} className="text-red-400 text-xs">Remove</button>
              </div>
            ) : (
              <div>
                <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: G.dim }} />
                <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Screenshot, image, or PDF (max 10MB)</p>
                <label className="inline-block">
                  <span className="btn-gold px-4 py-2 cursor-pointer text-sm">Choose File</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" disabled={uploading} />
                </label>
                {uploading && <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.40)" }}>Uploading...</p>}
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading || uploading} className="w-full btn-gold py-6 text-lg font-bold">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
              : <><Send className="w-4 h-4 mr-2" />Submit Ticket</>}
          </Button>
        </form>

        <p className="text-center text-[10px] mt-4" style={{ color: "rgba(255,255,255,0.20)" }}>
          🛡️ All tickets handled by <strong style={{ color: "rgba(212,175,55,0.50)" }}>Sirr al-Huruf Support</strong>
        </p>
      </motion.div>
    </PageLayout>
  );
}