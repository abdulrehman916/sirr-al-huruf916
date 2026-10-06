import { useState } from "react";
import { Plus, X, HelpCircle } from "lucide-react";

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
 * FAQs tab — manage unlimited question/answer pairs.
 * Each FAQ is shown in an accordion on the product detail page.
 */
export default function FAQsTab({ form, setForm }) {
  const [input, setInput] = useState({ question: "", answer: "" });
  const faqs = form.faqs || [];

  const addFaq = () => {
    if (!input.question.trim() || !input.answer.trim()) return;
    setForm({ ...form, faqs: [...faqs, { question: input.question.trim(), answer: input.answer.trim() }] });
    setInput({ question: "", answer: "" });
  };

  const removeFaq = (idx) => {
    setForm({ ...form, faqs: faqs.filter((_, i) => i !== idx) });
  };

  const updateFaq = (idx, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[idx] = { ...newFaqs[idx], [field]: value };
    setForm({ ...form, faqs: newFaqs });
  };

  return (
    <div className="space-y-4">
      {/* Existing FAQs */}
      {faqs.length > 0 && (
        <div className="space-y-2">
          <SectionLabel>FAQs ({faqs.length})</SectionLabel>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="space-y-1.5 p-2.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.faint}` }}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3 h-3 flex-shrink-0" style={{ color: G.dim }} />
                <span className="font-inter text-[10px] font-bold" style={{ color: G.dim }}>FAQ {idx + 1}</span>
                <button onClick={() => removeFaq(idx)} className="ml-auto">
                  <X className="w-3 h-3" style={{ color: "#F87171" }} />
                </button>
              </div>
              <input
                value={faq.question}
                onChange={e => updateFaq(idx, "question", e.target.value)}
                className="form-input"
                placeholder="Question..."
              />
              <textarea
                value={faq.answer}
                onChange={e => updateFaq(idx, "answer", e.target.value)}
                rows={2}
                className="form-input resize-none"
                placeholder="Answer..."
              />
            </div>
          ))}
        </div>
      )}

      {/* Add New FAQ */}
      <div className="space-y-2 p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <SectionLabel>Add FAQ</SectionLabel>
        <input
          value={input.question}
          onChange={e => setInput({ ...input, question: e.target.value })}
          className="form-input"
          placeholder="Question..."
        />
        <textarea
          value={input.answer}
          onChange={e => setInput({ ...input, answer: e.target.value })}
          rows={2}
          className="form-input resize-none"
          placeholder="Answer..."
        />
        <button
          onClick={addFaq}
          disabled={!input.question.trim() || !input.answer.trim()}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg font-inter text-[10px] font-bold disabled:opacity-30"
          style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}
        >
          <Plus className="w-3 h-3" /> Add FAQ
        </button>
      </div>
    </div>
  );
}