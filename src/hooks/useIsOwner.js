// Returns true only when the current session is the Owner role.
// Used to gate Owner-only source material (source visuals, screenshots,
// PDF page previews, internal source cards, manuscript images, audit
// info, page numbers, evidence panels) on customer-facing pages.
// Presentation-layer only — never affects calculations, logic, or data.
import { useAuth } from '@/lib/AuthContext';
import { ROLES } from '@/lib/rbac';

export function useIsOwner() {
  const { role } = useAuth();
  return role === ROLES.OWNER;
}