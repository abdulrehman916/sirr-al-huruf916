/**
 * Stage8Names — Final grouping into Esma-i Kitabet names
 */
import { AR, G } from "./ManuscriptConstants";

export default function Stage8Names({ expandedLetters, groupSize, names, remainder, supplementLetters, color }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ fontSize: "0.75rem", color: G.dim, marginBottom: "12px" }}>
        Grouping {expandedLetters.length} letters into groups of {groupSize}:
      </div>
      <div style={{ display: "grid", gap: "10px" }}>
        {names.map((name, i) => {
          const startIdx = i * groupSize;
          const endIdx = Math.min(startIdx + groupSize, expandedLetters.length);
          const groupLetters = expandedLetters.slice(startIdx, endIdx);
          return (
            <div key={i} style={{ 
              padding: "12px", 
              border: `2px solid ${color}40`, 
              borderRadius: "8px",
              background: `${color}08`
            }}>
              <div style={{ fontSize: "0.7rem", color: G.dim, marginBottom: "6px" }}>
                Name {i + 1} (letters {startIdx + 1}-{endIdx}):
              </div>
              <div style={{ 
                display: "flex", 
                flexDirection: "row", 
                flexWrap: "wrap", 
                gap: "3px", 
                direction: "ltr",
                marginBottom: "8px",
                padding: "6px",
                border: `1px solid ${G.cyan}30`,
                borderRadius: "6px",
                background: `${G.cyan}08`
              }}>
                {[...groupLetters].reverse().map((l, idx) => (
                  <span 
                    key={idx}
                    dir="rtl" 
                    lang="ar"
                    style={{ 
                      fontFamily: AR.fontFamily,
                      fontSize: "1.2rem", 
                      color: G.cyan, 
                      fontWeight: "500",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: `${G.cyan}15`,
                      border: `1px solid ${G.cyan}25`,
                      display: "inline-block"
                    }}
                  >
                    {l}
                  </span>
                ))}
              </div>
              <div style={{ 
                fontSize: "1.8rem", 
                color: color, 
                fontWeight: "bold", 
                textAlign: "center",
                padding: "12px",
                border: `1px solid ${color}30`,
                borderRadius: "6px",
                background: `${color}05`
              }}>
                {name}
              </div>
            </div>
          );
        })}
      </div>
      {remainder && remainder.length > 0 && (
        <RemainderDisplay 
          remainder={remainder} 
          supplementLetters={supplementLetters} 
          color={color}
        />
      )}
    </div>
  );
}

function RemainderDisplay({ remainder, supplementLetters, color }) {
  return (
    <div style={{ 
      marginTop: "12px", 
      padding: "10px", 
      border: `1px dashed ${color}40`, 
      borderRadius: "6px",
      background: `${color}05`
    }}>
      <div style={{ fontSize: "0.75rem", color: G.dim, marginBottom: "6px" }}>
        Remainder letters ({remainder.length}):
      </div>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "3px", direction: "ltr" }}>
        {[...remainder].reverse().map((l, i) => (
          <span 
            key={i}
            dir="rtl" 
            lang="ar"
            style={{ 
              fontFamily: AR.fontFamily,
              fontSize: "1.2rem", 
              color: G.dim, 
              fontWeight: "500",
              padding: "2px 6px",
              borderRadius: "4px",
              background: `${G.dim}15`,
              border: `1px solid ${G.dim}25`,
              display: "inline-block"
            }}
          >
            {l}
          </span>
        ))}
      </div>
      {supplementLetters && supplementLetters.length > 0 && (
        <>
          <div style={{ fontSize: "0.75rem", color: G.dim, marginTop: "10px", marginBottom: "6px" }}>
            Supplement from element:
          </div>
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "3px", direction: "ltr" }}>
            {[...supplementLetters].reverse().map((l, i) => (
              <span 
                key={i}
                dir="rtl" 
                lang="ar"
                style={{ 
                  fontFamily: AR.fontFamily,
                  fontSize: "1.2rem", 
                  color: G.green, 
                  fontWeight: "500",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: `${G.green}15`,
                  border: `1px solid ${G.green}25`,
                  display: "inline-block"
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}