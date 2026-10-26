// Returns true only when the current session is the Owner role.
// Used to gate Owner-only source material (source visuals, screenshots,
// PDF page previews, internal source cards, manuscript images, audit
// info, page numbers, evidence panels) on customer-facing pages.
// Presentation-layer only — never affects calculations, logic, or data.
//
// Reads the login context directly and never throws: outside an
// AuthProvider (build-time rendering, checks) nobody is the owner.
import { useContext } from 'react';
import { AuthContext } from '@/lib/authContextObject';
import { ROLES } from '@/lib/rbac';

export function useIsOwner() {
  const auth = useContext(AuthContext);
  return auth?.role === ROLES.OWNER;
}
