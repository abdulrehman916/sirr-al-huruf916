import { motion } from "framer-motion";
import { MessageCircle, Mail } from "lucide-react";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
  borderHi: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
};

/**
 * WhatsApp Inquiry + Contact Seller buttons.
 * Frontend-only: opens WhatsApp / email with a pre-filled message about the product.
 * Buttons are hidden if the corresponding seller field is not set.
 */
export default function SellerContact({ product }) {
  if (!product) return null;
  const wa = product.seller_whatsapp;
  const email = product.seller_email;

  if (!wa && !email) return null;

  const productName = product.name || "this product";
  const productUrl = `${window.location.origin}/shop/${product.slug || product.id}`;
  const waMessage = encodeURIComponent(`Hello, I'm interested in "${productName}".\n\nLink: ${productUrl}`);
  const emailSubject = encodeURIComponent(`Inquiry: ${productName}`);
  const emailBody = encodeURIComponent(`Hello,\n\nI'm interested in "${productName}".\n\nLink: ${productUrl}\n\nRegards`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="grid grid-cols-2 gap-2">
        {wa && (
          <a
            href={`https://wa.me/${wa.replace(/[^0-9]/g, "")}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-inter text-[11px] font-bold transition-all hover:scale-[1.02]"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.40)",
              color: "#86EFAC",
            }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp Inquiry
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}?subject=${emailSubject}&body=${emailBody}`}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-inter text-[11px] font-bold transition-all hover:scale-[1.02]"
            style={{
              background: G.bg,
              border: `1px solid ${G.borderHi}`,
              color: G.text,
            }}
          >
            <Mail className="w-3.5 h-3.5" />
            Contact Seller
          </a>
        )}
      </div>
    </motion.div>
  );
}