// The login context object on its own, with nothing else imported, so
// a presentation check (useIsOwner) can read it without pulling in the
// platform client. AuthContext.jsx provides it; this file only holds it.
import { createContext } from 'react';

export const AuthContext = createContext(undefined);
