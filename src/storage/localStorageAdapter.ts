import type { GameSession } from '../types/session.ts';
import { parseSession } from '../engine/sessionValidation.ts';
import type { SessionContext } from '../engine/sessionValidation.ts';
export const SESSION_STORAGE_KEY = 'date-night-engine:v1:session';
type SessionStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

// Content context is required on BOTH save and restore: IDs alone cannot prove compatibility.
export function createLocalStorageAdapter(context: SessionContext,
  getStorage: () => SessionStorage = () => globalThis.localStorage) {
  function removeSession(): boolean {
    try { getStorage().removeItem(SESSION_STORAGE_KEY); return true; } catch { return false; }
  }
  function loadSession(): GameSession | null {
    try {
      const raw = getStorage().getItem(SESSION_STORAGE_KEY);
      if (raw === null) return null;
      try { return parseSession(JSON.parse(raw), context); }
      catch { removeSession(); return null; }
    } catch { return null; }
  }
  function saveSession(value: GameSession): boolean {
    try {
      const session = parseSession(value, context);
      getStorage().setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      return true;
    } catch { return false; }
  }
  return { loadSession, saveSession, removeSession };
}
