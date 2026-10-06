import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Calculator, LockKeyhole, ShoppingBag, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: Calculator,
    title: "Independent Calculation Systems",
    text: "Each method keeps its own rules, tables, sections and calculation flow without mixing logic between systems.",
  },
  {
    icon: BookOpen,
    title: "Structured Knowledge Library",
    text: "Calculators, reference material and manuscript-based knowledge are organised as dedicated website sections.",
  },
  {
    icon: LockKeyhole,
    title: "Controlled Access",
    text: "Public, member, premium and restricted content can live together under one clear access experience.",
  },
];

const quickLinks = [
  { to: "/abjad", label: "Open Abjad", sub: "أبجد" },
  { to: "/mizaan9", label: "Open Mizaan 9", sub: "الميزان" },
  { to: "/astro-clock", label: "Astro Clock", sub: "الساعة الفلكية" },
  { to: "/shop", label: "Visit Shop", sub: "المتجر" },
];

export default function WebsiteHomeShell() {
  return (
    <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[28px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10"
          style={{
            background: "linear-gradient(145deg, rgba(9,19,39,0.94), rgba(3,9,22,0.96))",
            border: "1px solid rgba(212,175,55,0.22)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 0%, rgba(212,175,55,0.12), transparent 42%), radial-gradient(circle at 12% 90%, rgba(68,92,170,0.10), transparent 38%)",
            }}
          />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ border: "1px solid rgba(212,175,55,0.22)", background: "rgba(212,175,55,0.06)" }}>
                <Sparkles className="h-3.5 w-3.5" style={{ color: "#D4AF37" }} />
                <span className="font-inter text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: "rgba(232,200,74,0.78)" }}>
                  Sirr Al-Huruf Knowledge Website
                </span>
              </div>
              <h2 className="font-amiri text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl" style={{ color: "#F5ECD4" }}>
                الحساب والمعرفة في نظام واحد
              </h2>
              <p className="mt-3 max-w-2xl font-inter text-sm leading-7 sm:text-base" style={{ color: "rgba(226,232,240,0.66)" }}>
                A dedicated website for independent Ilm al-Huruf calculations, structured reference knowledge, controlled premium content and digital services.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-inter text-sm font-bold sm:w-auto"
              style={{
                color: "#08111F",
                background: "linear-gradient(135deg, #F1D66B 0%, #C99524 100%)",
                boxShadow: "0 10px 34px rgba(212,175,55,0.20)",
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              Explore Services
            </Link>
          </div>

          <div className="relative z-10 mt-8 grid gap-3 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-2xl p-4 sm:p-5"
                style={{
                  background: "linear-gradient(160deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012))",
                  border: "1px solid rgba(255,255,255,0.065)",
                }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.16)" }}>
                  <Icon className="h-5 w-5" style={{ color: "#D8B94A" }} />
                </div>
                <h3 className="font-inter text-sm font-bold" style={{ color: "#F2E8CE" }}>{title}</h3>
                <p className="mt-2 font-inter text-xs leading-6 sm:text-sm" style={{ color: "rgba(203,213,225,0.56)" }}>{text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickLinks.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                to={item.to}
                className="group block rounded-2xl px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: "rgba(6,14,30,0.78)",
                  border: "1px solid rgba(212,175,55,0.12)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.20)",
                }}
              >
                <span className="block font-amiri text-xl" dir="rtl" style={{ color: "rgba(232,200,74,0.88)" }}>{item.sub}</span>
                <span className="mt-1 block font-inter text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "rgba(226,232,240,0.72)" }}>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
