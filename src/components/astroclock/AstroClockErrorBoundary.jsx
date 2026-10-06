/**
 * ASTRO CLOCK ERROR BOUNDARY
 * Catches runtime errors in any Astro Clock section and shows
 * a graceful fallback instead of a white screen.
 */
import { Component } from "react";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
};

export default class AstroClockErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[AstroClockErrorBoundary] Caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      const label = this.props.label || "Section";
      return (
        <div
          className="rounded-2xl border p-6 text-center"
          style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.40)" }}
        >
          <p className="text-2xl mb-2">⚠️</p>
          <p className="font-inter text-sm font-bold text-white mb-1">{label} — Failed to Load</p>
          <p className="font-inter text-xs" style={{ color: G.dim }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border"
            style={{ background: G.bg, borderColor: G.border, color: G.text }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}