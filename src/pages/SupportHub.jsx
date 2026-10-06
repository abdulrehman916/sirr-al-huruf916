import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageSquare, Mic, Ticket, ArrowRight, MessageCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";

const CARDS = [
  {
    id: "whatsapp",
    title: "WhatsApp Support",
    arabic: "دعم واتساب",
    desc: "Chat with your assigned support representative on WhatsApp",
    icon: MessageCircle,
    path: "/support/whatsapp",
    color: "rgba(34,197,94,0.18)",
    border: "rgba(34,197,94,0.40)",
  },
  {
    id: "chat",
    title: "Live Message Support",
    arabic: "الدعم المباشر",
    desc: "Chat with our support team in real-time",
    icon: MessageSquare,
    path: "/support/chat",
    color: "rgba(59,130,246,0.18)",
    border: "rgba(59,130,246,0.40)",
  },
  {
    id: "voice",
    title: "Voice Complaint",
    arabic: "شكوى صوتية",
    desc: "Record and send a voice message about your issue",
    icon: Mic,
    path: "/support/voice",
    color: "rgba(239,68,68,0.18)",
    border: "rgba(239,68,68,0.40)",
  },
  {
    id: "ticket",
    title: "Ticket Request",
    arabic: "طلب تذكرة",
    desc: "Submit a detailed support ticket with attachments",
    icon: Ticket,
    path: "/support/ticket",
    color: "rgba(34,197,94,0.18)",
    border: "rgba(34,197,94,0.40)",
  },
];

export default function SupportHub() {
  return (
    <PageLayout>
      <PageTitle
        arabic="الدعم"
        latin="SIRR AL-HURUF SUPPORT"
        subtitle="Choose how you'd like to reach us"
        icon="🛡️"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-4"
      >
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={card.path}
                className="block rounded-2xl border p-5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: `linear-gradient(145deg, ${card.color}, rgba(0,0,0,0.2))`,
                  borderColor: card.border,
                  boxShadow: `0 0 20px ${card.color}`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: card.color, border: `1px solid ${card.border}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.border.replace("0.40", "1") }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-inter font-bold text-white text-base">{card.title}</h3>
                    <p className="font-amiri text-sm mt-0.5" style={{ color: "rgba(212,175,55,0.60)" }}>
                      {card.arabic}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>
                      {card.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
                </div>
              </Link>
            </motion.div>
          );
        })}

        <div
          className="rounded-xl border p-4 text-center mt-6"
          style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.15)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            🛡️ All communications are handled by <strong style={{ color: "rgba(212,175,55,0.70)" }}>Sirr al-Huruf Support</strong>
          </p>
          <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.20)" }}>
            Your personal details are never shared
          </p>
        </div>
      </motion.div>
    </PageLayout>
  );
}