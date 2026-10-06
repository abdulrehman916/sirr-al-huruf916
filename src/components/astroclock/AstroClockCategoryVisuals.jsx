// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK CATEGORY VISUALS — wrapper that fetches + renders
// the attached source visuals for an Astro Clock category card.
//
// Props:
//   categories    — array of AstroClockKnowledge rule_category slugs
//   entityAliases — optional array of rule_entity values to filter
//                   (normalized: lowercase, harakat stripped). When
//                   empty, all visuals in the given categories are
//                   shown (deduped by visual_url).
//
// Renders nothing when no visuals are attached (no visual = no card
// section), so cards without source visuals stay unchanged.
// ═══════════════════════════════════════════════════════════════
import AstroClockVisuals from "./AstroClockVisuals";
import { useAstroClockVisuals } from "@/hooks/useAstroClockVisuals";
import { useIsOwner } from "@/hooks/useIsOwner";

export default function AstroClockCategoryVisuals({ categories = [], entityAliases = [] }) {
  const { visuals } = useAstroClockVisuals(categories, entityAliases);
  const isOwner = useIsOwner();
  if (!isOwner || !visuals || visuals.length === 0) return null;
  return <AstroClockVisuals visuals={visuals} />;
}