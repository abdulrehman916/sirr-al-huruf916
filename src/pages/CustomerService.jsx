import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Upload, FileText, Image, Monitor, Mic, MicOff, Play, StopCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

const CATEGORIES = [
  { value: "Bug Report", label: "Bug Report", icon: "🐛" },
  { value: "Feature Request", label: "Feature Request", icon: "✨" },
  { value: "Content Correction", label: "Content Correction", icon: "📝" },
  { value: "Access Problem", label: "Access Problem", icon: "🔒" },
  { value: "General Question", label: "General Question", icon: "❓" }
];

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  success: "rgba(34,197,94,0.15)",
  successBorder: "rgba(34,197,94,0.60)"
};

export default function CustomerService() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    category: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (images, PDFs, audio)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPG, PNG, GIF, PDF, MP3, M4A, or WAV files only.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ url: result.file_url, name: file.name, type: file.type });
      toast({
        title: "Upload Successful",
        description: "File uploaded successfully."
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Calculate duration
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onloadedmetadata = () => {
          setAudioDuration(Math.floor(audio.duration));
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Speak your message. Click stop when finished."
      });
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record voice messages.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({
        title: "Recording Complete",
        description: `Recorded ${recordingTime} seconds of audio.`
      });
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setAudioBlob(null);
    setAudioDuration(0);
    setRecordingTime(0);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return null;

    setUploading(true);
    try {
      const file = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
      const result = await base44.integrations.Core.UploadFile({ file });
      return { url: result.file_url, duration: audioDuration };
    } catch (error) {
      toast({
        title: "Audio Upload Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateTicketId = async () => {
    const existingTickets = await base44.entities.SupportTickets.list('-created_at', 100);
    const maxNum = existingTickets.reduce((max, ticket) => {
      const num = parseInt(ticket.ticket_id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    return `SUP-${String(maxNum + 1).padStart(6, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mobile || !formData.email || !formData.category || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const ticketId = await generateTicketId();
      const now = new Date().toISOString();

      // Upload audio if exists
      let audioData = null;
      if (audioBlob) {
        audioData = await uploadAudio();
      }

      await base44.entities.SupportTickets.create({
        ticket_id: ticketId,
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
        attachment_url: uploadedFile?.url || null,
        audio_url: audioData?.url || null,
        audio_duration: audioData?.duration || null,
        status: "OPEN",
        created_at: now
      });

      toast({
        title: "Ticket Created Successfully!",
        description: `Your ticket ID is ${ticketId}. We'll respond soon.`,
        action: <ToastAction altText="Copy ID" onClick={() => navigator.clipboard.writeText(ticketId)}>Copy ID</ToastAction>
      });

      // Reset form
      setFormData({
        name: "",
        mobile: "",
        email: "",
        category: "",
        subject: "",
        message: ""
      });
      setUploadedFile(null);
      setAudioBlob(null);
      setAudioDuration(0);
      setRecordingTime(0);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageTitle 
        arabic="دعم العملاء"
        latin="SIRR AL-HURUF SUPPORT"
        subtitle="Submit Support Tickets & Inquiries"
        icon="📧"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="border-0" style={{ background: "transparent" }}>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information - Required for Support Tickets */}
              <div className="mb-6 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <p className="text-blue-400 text-xs mb-2">
                  ℹ️ For support tickets, we need your contact details to respond to your inquiry.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your name"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">Mobile Number *</Label>
                  <Input
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="+971 XX XXX XXXX"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Email Address *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-white/80">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label className="text-white/80">Subject *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-white/80">Message *</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  className="bg-white/5 border-white/10 text-white min-h-[150px]"
                />
              </div>

              {/* Voice Message */}
              <div className="space-y-2">
                <Label className="text-white/80">Voice Message (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: G.border }}>
                  {audioBlob ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <Mic className="w-6 h-6" style={{ color: G.success }} />
                        <span className="text-white font-semibold">Voice Message Recorded</span>
                        <span className="text-white/70 text-sm">({formatDuration(audioDuration)})</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelRecording}
                          className="border-red-400 text-red-400 hover:bg-red-400/10"
                        >
                          <MicOff className="w-4 h-4 mr-1" />
                          Discard
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={startRecording}
                          className="border-gold text-gold hover:bg-gold/10"
                        >
                          <Mic className="w-4 h-4 mr-1" />
                          Re-record
                        </Button>
                      </div>
                    </div>
                  ) : isRecording ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-white font-semibold">Recording... {formatDuration(recordingTime)}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={stopRecording}
                          className="border-red-400 text-red-400 hover:bg-red-400/10"
                        >
                          <StopCircle className="w-4 h-4 mr-1" />
                          Stop
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelRecording}
                          className="border-white/40 text-white/70 hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Mic className="w-8 h-8 mx-auto mb-2" style={{ color: G.dim }} />
                      <p className="text-white/60 text-sm mb-3">
                        Record a voice message (MP3, M4A, WAV supported)
                      </p>
                      <Button
                        type="button"
                        onClick={startRecording}
                        className="btn-gold px-6 py-2"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Start Recording
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label className="text-white/80">Attachments (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: G.border }}>
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      {uploadedFile.type.includes('image') ? (
                        <Image className="w-6 h-6" style={{ color: G.text }} />
                      ) : uploadedFile.type.includes('pdf') ? (
                        <FileText className="w-6 h-6" style={{ color: G.text }} />
                      ) : (
                        <Monitor className="w-6 h-6" style={{ color: G.text }} />
                      )}
                      <span className="text-white/80">{uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: G.dim }} />
                      <p className="text-white/60 text-sm mb-2">
                        Upload screenshot, image, or PDF (max 10MB)
                      </p>
                      <label className="inline-block">
                        <span className="btn-gold px-4 py-2 cursor-pointer text-sm">
                          Choose File
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {uploading && (
                        <p className="text-white/60 text-sm mt-2">Uploading...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || uploading}
                className="w-full btn-gold py-6 text-lg font-bold"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Submit Support Ticket
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 rounded-lg border" style={{ background: G.bg, borderColor: G.border }}>
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <span>📧</span> Sirr al-Huruf Support
            </h3>
            <p className="text-white/70 text-sm">All communications appear from our branded support team</p>
          </div>
          <div className="p-4 rounded-lg border" style={{ background: G.bg, borderColor: G.border }}>
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <span>🔒</span> Privacy Protected
            </h3>
            <p className="text-white/70 text-sm">Your contact details are secure and never shared</p>
          </div>
          <div className="p-4 rounded-lg border" style={{ background: G.bg, borderColor: G.border }}>
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <span>⏰</span> Response Time
            </h3>
            <p className="text-white/70 text-sm">We typically respond within 24-48 hours</p>
          </div>
        </div>
      </motion.div>
    </PageLayout>
  );
}