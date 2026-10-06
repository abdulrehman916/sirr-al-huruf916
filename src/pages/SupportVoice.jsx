import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mic, MicOff, StopCircle, Play, ArrowLeft, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.35)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
};

export default function SupportVoice() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onloadedmetadata = () => setAudioDuration(Math.floor(audio.duration));
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch {
      toast({ title: "Microphone Access Denied", description: "Please allow microphone access.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const discardRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioDuration(0);
    setRecordingTime(0);
  };

  const handleSubmit = async () => {
    if (!name || !email || !audioBlob) {
      toast({ title: "Missing Info", description: "Please provide your name, email, and voice recording.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const allTickets = await base44.entities.SupportTickets.list('-created_at', 100);
      const maxNum = allTickets.reduce((max, t) => {
        const n = parseInt(t.ticket_id?.split("-")[1] || "0");
        return n > max ? n : max;
      }, 0);
      const ticketId = `SUP-${String(maxNum + 1).padStart(6, "0")}`;
      await base44.entities.SupportTickets.create({
        ticket_id: ticketId,
        name,
        mobile: "",
        email,
        category: "General Question",
        subject: "Voice Complaint",
        message: `Voice complaint submitted. Duration: ${formatDuration(audioDuration)}`,
        audio_url: uploadRes.file_url,
        audio_duration: audioDuration,
        status: "OPEN",
        created_at: new Date().toISOString(),
      });
      setSubmitted(true);
      toast({ title: "Voice Complaint Sent", description: `Ticket #${ticketId} created.` });
    } catch (err) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
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
          <h2 className="font-inter font-bold text-white text-lg mb-2">Voice Complaint Sent</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Our support team will review your recording and respond soon.</p>
          <Link to="/support" className="mt-6">
            <Button variant="outline" className="border-gold text-gold">Back to Support</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageTitle arabic="شكوى صوتية" latin="VOICE COMPLAINT" subtitle="Record and send a voice message" icon="🎙️" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-5">
        <Link to="/support" className="inline-flex items-center gap-1.5 text-xs" style={{ color: G.dim }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Support
        </Link>

        <div className="space-y-3">
          <div>
            <Label style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.8rem" }}>Your Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
              className="mt-1 bg-white/5 border-white/10 text-white h-12" />
          </div>
          <div>
            <Label style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.8rem" }}>Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="mt-1 bg-white/5 border-white/10 text-white h-12" />
          </div>
        </div>

        {/* Recording */}
        <div className="rounded-2xl border-2 border-dashed p-6 text-center" style={{ borderColor: isRecording ? "rgba(239,68,68,0.50)" : G.border }}>
          {audioBlob ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                  <Mic className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">Recording Ready</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>{formatDuration(audioDuration)}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <audio controls className="w-full max-w-xs" style={{ filter: "invert(0.85)" }}>
                  <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                </audio>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={discardRecording}
                  className="border-red-400 text-red-400 hover:bg-red-400/10"><MicOff className="w-3.5 h-3.5 mr-1" />Discard</Button>
                <Button variant="outline" size="sm" onClick={startRecording}
                  className="border-gold text-gold hover:bg-gold/10"><Mic className="w-3.5 h-3.5 mr-1" />Re-record</Button>
              </div>
            </div>
          ) : isRecording ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white font-semibold">Recording... {formatDuration(recordingTime)}</span>
              </div>
              <Button variant="outline" size="sm" onClick={stopRecording}
                className="border-red-400 text-red-400 hover:bg-red-400/10"><StopCircle className="w-3.5 h-3.5 mr-1" />Stop</Button>
            </div>
          ) : (
            <div>
              <Mic className="w-10 h-10 mx-auto mb-3" style={{ color: G.dim }} />
              <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.50)" }}>
                Tap to record your complaint
              </p>
              <Button onClick={startRecording} className="btn-gold px-6"><Mic className="w-4 h-4 mr-2" />Start Recording</Button>
            </div>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={uploading || !audioBlob || !name || !email}
          className="w-full btn-gold py-6 text-lg font-bold">
          {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Send className="w-4 h-4 mr-2" />Submit Voice Complaint</>}
        </Button>

        <p className="text-center text-[10px]" style={{ color: "rgba(255,255,255,0.20)" }}>
          🛡️ Your complaint is sent to <strong style={{ color: "rgba(212,175,55,0.50)" }}>Sirr al-Huruf Support</strong>
        </p>
      </motion.div>
    </PageLayout>
  );
}