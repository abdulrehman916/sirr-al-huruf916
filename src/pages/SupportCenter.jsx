import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Upload, Image, FileText, Mic, StopCircle, Paperclip, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getSessionId } from "@/lib/sessionId";
import ReactMarkdown from "react-markdown";

const CATEGORIES = [
  { value: "General Question", label: "General Question", icon: "❓" },
  { value: "Bug Report", label: "Bug Report", icon: "🐛" },
  { value: "Feature Request", label: "Feature Request", icon: "✨" },
  { value: "Access Problem", label: "Access Problem", icon: "🔒" },
  { value: "Technical Support", label: "Technical Support", icon: "🛠️" },
  { value: "Billing Question", label: "Billing Question", icon: "💳" }
];

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
};

export default function SupportCenter() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General Question");
  const [subject, setSubject] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [view, setView] = useState("list"); // "list" or "chat"
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionId = getSessionId();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      const result = await base44.functions.invoke("getSupportConversations", {
        session_id: sessionId,
        limit: 50
      });
      setConversations(result.data.conversations || []);
    } catch (e) {
      toast({ title: "Failed to load conversations", description: e.message, variant: "destructive" });
    }
  };

  const loadMessages = async (conversation_id) => {
    try {
      const result = await base44.functions.invoke("getSupportMessages", {
        conversation_id,
        session_id: sessionId,
        limit: 100
      });
      setMessages(result.data.messages || []);
    } catch (e) {
      toast({ title: "Failed to load messages", description: e.message, variant: "destructive" });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'video/mp4'];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid File Type", description: "Please upload JPG, PNG, GIF, PDF, MP3, M4A, WAV, or MP4 files only.", variant: "destructive" });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Maximum file size is 25MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ url: result.file_url, name: file.name, type: file.type, size: file.size });
      toast({ title: "Upload Successful", description: "File uploaded successfully." });
    } catch (error) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
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
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onloadedmetadata = () => setRecordingTime(Math.floor(audio.duration));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      toast({ title: "Recording Started", description: "Speak your message." });
    } catch (error) {
      toast({ title: "Recording Failed", description: error.message, variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast({ title: "Recording Stopped", description: "Voice message ready to send." });
    }
  };

  const createNewConversation = async () => {
    if (!subject.trim()) {
      toast({ title: "Subject Required", description: "Please enter a subject.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const result = await base44.functions.invoke("createSupportConversation", {
        subject: subject.trim(),
        category: selectedCategory,
        message: "New conversation started",
        session_id: sessionId
      });
      
      toast({ title: "Conversation Created", description: "Support conversation started successfully." });
      setActiveConversation(result.data);
      setView("chat");
      setSubject("");
      loadConversations();
    } catch (error) {
      toast({ title: "Failed to Create", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() && !uploadedFile && !audioBlob) {
      return;
    }

    if (!activeConversation) {
      toast({ title: "No Active Conversation", description: "Please create or select a conversation first.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let attachment_url = uploadedFile?.url;
      let attachment_type = uploadedFile?.type;
      let attachment_name = uploadedFile?.name;
      let attachment_size = uploadedFile?.size;
      let audio_duration = null;

      // Upload audio if recording
      if (audioBlob) {
        const audioFile = new File([audioBlob], "voice-message.webm", { type: "audio/webm" });
        const result = await base44.integrations.Core.UploadFile({ file: audioFile });
        attachment_url = result.file_url;
        attachment_type = "audio/webm";
        attachment_name = "voice-message.webm";
        audio_duration = recordingTime;
      }

      const result = await base44.functions.invoke("sendSupportMessage", {
        conversation_id: activeConversation.conversation_id,
        message: messageInput.trim(),
        attachment_url,
        attachment_type,
        attachment_name,
        attachment_size,
        audio_duration,
        session_id: sessionId
      });

      setMessageInput("");
      setUploadedFile(null);
      setAudioBlob(null);
      setRecordingTime(0);
      loadMessages(activeConversation.conversation_id);
      loadConversations();
      
      toast({ title: "Message Sent", description: "Your message has been sent." });
    } catch (error) {
      toast({ title: "Send Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-GB", { 
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" 
    });
  };

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-inter text-2xl font-bold text-white">Support Center</h1>
          <p className="font-inter text-xs text-white/40 mt-1">Get help from our support team</p>
        </div>

        {view === "list" ? (
          <>
            {/* New Conversation Form */}
            <div className="rounded-xl border p-4 space-y-3" style={{ background: G.bg, borderColor: G.border }}>
              <h2 className="font-inter text-sm font-semibold text-white">Start New Conversation</h2>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject (e.g., Access issue with Mizaan page)"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: G.border, fontSize: 16 }}
              />
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategory === cat.value ? "bg-yellow-500/20 border-yellow-500/50" : "bg-white/5 border-white/10"
                    }`}
                    style={{ border: "1px solid" }}
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
              <Button onClick={createNewConversation} disabled={loading || !subject.trim()} className="w-full btn-gold">
                {loading ? "Creating..." : "Start Conversation"}
              </Button>
            </div>

            {/* Conversations List */}
            <div className="space-y-2">
              <h2 className="font-inter text-sm font-semibold text-white">Your Conversations</h2>
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-white/30">
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => { setActiveConversation(conv); setView("chat"); loadMessages(conv.conversation_id); }}
                    className="rounded-xl border p-3 cursor-pointer hover:border-yellow-500/50 transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-semibold text-white truncate">{conv.subject}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">
                          {conv.category} • {conv.message_count || 0} messages • {formatDateTime(conv.last_message_at)}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500 text-black">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Chat View */}
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setView("list")} className="text-white/60 hover:text-white text-sm">← Back</button>
              <h2 className="font-inter text-sm font-semibold text-white flex-1">{activeConversation?.subject}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded ${
                activeConversation?.status === "OPEN" ? "bg-green-500/20 text-green-400" :
                activeConversation?.status === "RESOLVED" ? "bg-blue-500/20 text-blue-400" :
                "bg-gray-500/20 text-gray-400"
              }`}>
                {activeConversation?.status}
              </span>
            </div>

            {/* Messages */}
            <div className="rounded-xl border p-4 space-y-3 min-h-[400px] max-h-[60vh] overflow-y-auto"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: G.border }}>
              {messages.map((msg, i) => (
                <div key={msg.id} className={`flex ${msg.sender_type === "CUSTOMER" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 ${
                    msg.sender_type === "CUSTOMER" ? "bg-yellow-500/20 border border-yellow-500/30" : "bg-white/5 border border-white/10"
                  }`}>
                    {msg.message_type === "IMAGE" && msg.attachment_url && (
                      <img src={msg.attachment_url} alt="Attachment" className="rounded-lg mb-2 max-w-full" />
                    )}
                    {msg.message_type === "AUDIO" && msg.attachment_url && (
                      <audio controls src={msg.attachment_url} className="mb-2" />
                    )}
                    {msg.message && (
                      <p className="text-sm text-white whitespace-pre-wrap">{msg.message}</p>
                    )}
                    <p className="text-[9px] text-white/30 mt-1">{formatDateTime(msg.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="rounded-xl border p-3 space-y-2" style={{ background: G.bg, borderColor: G.border }}>
              {uploadedFile && (
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <FileText className="w-3 h-3" />
                  <span className="truncate flex-1">{uploadedFile.name}</span>
                  <button onClick={() => setUploadedFile(null)}><X className="w-3 h-3" /></button>
                </div>
              )}
              {audioBlob && (
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Mic className="w-3 h-3" />
                  <span>Voice message ({formatTime(recordingTime)})</span>
                  <button onClick={() => setAudioBlob(null)}><X className="w-3 h-3" /></button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-white/40 hover:text-white">
                  <Paperclip className="w-4 h-4" />
                  <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,video/*,audio/*,.pdf" />
                </label>
                {isRecording ? (
                  <button onClick={stopRecording} className="text-red-400"><StopCircle className="w-5 h-5" /></button>
                ) : (
                  <button onClick={startRecording} className="text-white/40 hover:text-white"><Mic className="w-4 h-4" /></button>
                )}
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Type your message..."
                  className="flex-1"
                  style={{ background: "rgba(255,255,255,0.05)", borderColor: G.border, fontSize: 16 }}
                />
                <Button onClick={sendMessage} disabled={loading || (!messageInput.trim() && !uploadedFile && !audioBlob)} className="btn-gold px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {isRecording && <p className="text-[10px] text-red-400 text-center">{formatTime(recordingTime)}</p>}
            </div>
          </>
        )}
      </motion.div>
    </PageLayout>
  );
}