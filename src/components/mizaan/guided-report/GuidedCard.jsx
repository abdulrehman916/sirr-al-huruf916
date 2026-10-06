// GuidedCard — shared card wrapper for the guided decision assistant
export default function GuidedCard({ children, accent = "rgba(212,175,55,0.22)", className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl p-4 ${className}`}
      style={{
        background:
          "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${accent}`,
        boxShadow:
          "0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}